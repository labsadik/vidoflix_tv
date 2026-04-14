const express = require("express");
const router = express.Router();

router.get("/bunny", (req, res) => {
    try {

        const libraryId = process.env.BUNNY_LIBRARY_ID;
        const streamKey = process.env.BUNNY_STREAM_API_KEY;
        const storageZone = process.env.BUNNY_STORAGE_ZONE;
        const storageKey = process.env.BUNNY_STORAGE_KEY;
        const cdn = process.env.BUNNY_CDN;

        // 🔥 SAFETY CHECK
        if (!libraryId || !streamKey || !storageZone || !storageKey || !cdn) {
            return res.status(500).json({
                error: "Missing Bunny config in .env"
            });
        }

        res.json({
            libraryId,
            streamKey,
            storageZone,
            storageKey,   // ✅ REQUIRED FOR THUMBNAIL UPLOAD
            cdn           // ✅ REQUIRED FOR IMAGE URL
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;