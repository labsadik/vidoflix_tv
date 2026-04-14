const express = require("express");
const router = express.Router();
const multer = require("multer");
const fetch = require("node-fetch"); // ✅ Make sure this line exists

const upload = multer({ storage: multer.memoryStorage() });

router.post("/thumbnail", upload.single("file"), async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const fileName = Date.now() + "_" + file.originalname;

        // ✅ FIX: correct Bunny Storage endpoint
        const uploadUrl =
            `https://storage.bunnycdn.com/${process.env.BUNNY_STORAGE_ZONE}/${fileName}`;

        const response = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
                AccessKey: process.env.BUNNY_STORAGE_KEY, // ✅ correct key
                "Content-Type": "application/octet-stream"
            },
            body: file.buffer
        });

        const text = await response.text();

        console.log("🔥 BUNNY RESPONSE:", text);
        console.log("STATUS:", response.status);

        if (!response.ok) {
            return res.status(500).json({
                message: "Upload failed",
                error: text
            });
        }

        // ✅ FIX: clean CDN URL (NO double slash issues)
        const cdnBase = process.env.BUNNY_CDN.replace(/\/$/, "");

        const finalUrl = `${cdnBase}/${fileName}`;

        return res.json({
            success: true,
            url: finalUrl
        });

    } catch (err) {
        console.error("SERVER ERROR:", err);
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
});

module.exports = router;