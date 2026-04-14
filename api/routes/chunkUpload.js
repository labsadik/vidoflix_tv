const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Create temp directory for chunks if it doesn't exist
const tempDir = path.join(__dirname, "../temp");
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 700 * 1024 * 1024 // 700MB per chunk
    }
});

// Store active uploads
const activeUploads = new Map();

/* =========================
   INIT CHUNKED UPLOAD
========================= */
router.post("/init", async (req, res) => {
    try {
        const { fileName, videoId, totalChunks } = req.body;

        console.log("📥 Init request:", { fileName, videoId, totalChunks });

        if (!fileName || !videoId || !totalChunks) {
            return res.status(400).json({ 
                message: "Missing required fields",
                received: { fileName, videoId, totalChunks }
            });
        }

        const uploadId = Date.now().toString() + "_" + Math.random().toString(36).substr(2, 9);
        
        const uploadDir = path.join(tempDir, uploadId);
        fs.mkdirSync(uploadDir, { recursive: true });

        activeUploads.set(uploadId, {
            videoId,
            fileName,
            totalChunks: parseInt(totalChunks),
            uploadedChunks: 0,
            createdAt: Date.now(),
            chunks: new Set()
        });

        console.log(`✅ Upload initialized: ${uploadId}`);
        console.log(`   File: ${fileName}`);
        console.log(`   Chunks: ${totalChunks}`);

        res.json({
            success: true,
            uploadId,
            message: "Upload initialized"
        });

    } catch (err) {
        console.error("❌ Init error:", err);
        res.status(500).json({
            message: "Failed to initialize upload",
            error: err.message
        });
    }
});

/* =========================
   UPLOAD CHUNK
========================= */
router.post("/chunk", upload.single("chunk"), async (req, res) => {
    try {
        const { uploadId, index, videoId } = req.body;
        const chunkIndex = parseInt(index);

        console.log(`📤 Chunk request:`, { uploadId, index: chunkIndex, hasFile: !!req.file });

        if (!uploadId || index === undefined) {
            return res.status(400).json({ 
                message: "Missing uploadId or index" 
            });
        }

        if (!req.file) {
            return res.status(400).json({ 
                message: "No chunk file received" 
            });
        }

        const uploadInfo = activeUploads.get(uploadId);
        if (!uploadInfo) {
            console.log(`⚠️ Upload session not found: ${uploadId}`);
            return res.status(404).json({ 
                message: "Upload session not found or expired" 
            });
        }

        // Check if chunk already uploaded
        if (uploadInfo.chunks.has(chunkIndex)) {
            console.log(`ℹ️ Chunk ${chunkIndex} already uploaded, skipping`);
            return res.json({
                success: true,
                message: `Chunk ${chunkIndex} already uploaded`,
                progress: Math.round((uploadInfo.uploadedChunks / uploadInfo.totalChunks) * 100)
            });
        }

        // Save chunk to disk
        const chunkPath = path.join(tempDir, uploadId, `chunk_${chunkIndex}`);
        fs.writeFileSync(chunkPath, req.file.buffer);
        
        uploadInfo.chunks.add(chunkIndex);
        uploadInfo.uploadedChunks++;

        const progress = Math.round((uploadInfo.uploadedChunks / uploadInfo.totalChunks) * 100);
        
        console.log(`✅ Chunk ${chunkIndex}/${uploadInfo.totalChunks} saved (${progress}%)`);

        res.json({
            success: true,
            message: `Chunk ${chunkIndex} uploaded`,
            progress: progress,
            uploadedChunks: uploadInfo.uploadedChunks,
            totalChunks: uploadInfo.totalChunks
        });

    } catch (err) {
        console.error("❌ Chunk upload error:", err);
        res.status(500).json({
            message: "Failed to upload chunk",
            error: err.message
        });
    }
});

/* =========================
   COMPLETE CHUNKED UPLOAD
========================= */
router.post("/complete", async (req, res) => {
    try {
        const { uploadId, videoId, fileName, totalChunks } = req.body;

        console.log(`🏁 Complete request:`, { uploadId, videoId, fileName });

        if (!uploadId || !videoId) {
            return res.status(400).json({ 
                message: "Missing required fields" 
            });
        }

        const uploadInfo = activeUploads.get(uploadId);
        if (!uploadInfo) {
            return res.status(404).json({ 
                message: "Upload session not found" 
            });
        }

        const expectedChunks = parseInt(totalChunks);
        const actualChunks = uploadInfo.uploadedChunks;

        console.log(`   Expected chunks: ${expectedChunks}`);
        console.log(`   Actual chunks: ${actualChunks}`);

        if (actualChunks !== expectedChunks) {
            const missing = [];
            for (let i = 0; i < expectedChunks; i++) {
                if (!uploadInfo.chunks.has(i)) {
                    missing.push(i);
                }
            }
            
            return res.status(400).json({
                message: `Incomplete upload: ${actualChunks}/${expectedChunks} chunks`,
                missingChunks: missing
            });
        }

        // Combine chunks
        const uploadDir = path.join(tempDir, uploadId);
        const finalFilePath = path.join(uploadDir, fileName);
        
        console.log(`🔗 Assembling chunks...`);
        
        const writeStream = fs.createWriteStream(finalFilePath);
        
        for (let i = 0; i < expectedChunks; i++) {
            const chunkPath = path.join(uploadDir, `chunk_${i}`);
            if (!fs.existsSync(chunkPath)) {
                throw new Error(`Missing chunk ${i}`);
            }
            const chunkData = fs.readFileSync(chunkPath);
            writeStream.write(chunkData);
        }
        
        writeStream.end();

        await new Promise((resolve, reject) => {
            writeStream.on("finish", () => {
                console.log(`✅ File assembled: ${finalFilePath}`);
                console.log(`   Size: ${(fs.statSync(finalFilePath).size / (1024*1024)).toFixed(2)} MB`);
                resolve();
            });
            writeStream.on("error", reject);
        });

        // Clean up individual chunks
        for (let i = 0; i < expectedChunks; i++) {
            const chunkPath = path.join(uploadDir, `chunk_${i}`);
            if (fs.existsSync(chunkPath)) {
                fs.unlinkSync(chunkPath);
            }
        }

        activeUploads.delete(uploadId);

        // Schedule temp dir cleanup
        setTimeout(() => {
            if (fs.existsSync(uploadDir)) {
                fs.rmSync(uploadDir, { recursive: true, force: true });
                console.log(`🧹 Cleaned up temp directory: ${uploadDir}`);
            }
        }, 60000);

        res.json({
            success: true,
            message: "Upload completed successfully",
            filePath: finalFilePath,
            fileSize: fs.statSync(finalFilePath).size
        });

    } catch (err) {
        console.error("❌ Complete error:", err);
        res.status(500).json({
            message: "Failed to complete upload",
            error: err.message
        });
    }
});

module.exports = router;