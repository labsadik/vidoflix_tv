const express = require("express");
const router = express.Router();

router.post("/video", async (req, res) => {
    try {
        const { title } = req.body;

        const response = await fetch(
            `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos`,
            {
                method: "POST",
                headers: {
                    AccessKey: process.env.BUNNY_STREAM_API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ title })
            }
        );

        const data = await response.json();

        return res.json(data);

    } catch (err) {
        console.log("UPLOAD ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;