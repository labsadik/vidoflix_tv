const Movie = require("../models/Movie");

// SAVE MOVIE TO DATABASE
exports.saveMovie = async (req, res) => {
    try {
        console.log("BODY:", req.body); // 👈 DEBUG CHECK

        const { title, description, videoUrl, thumbnailUrl } = req.body;

        if (!title || !videoUrl) {
            return res.status(400).json({ message: "Missing data" });
        }

        const movie = await Movie.create({
            title,
            description,
            videoUrl,
            thumbnailUrl,
            createdBy: req.user.id
        });

        console.log("✅ MOVIE SAVED:", movie);

        res.json(movie);

    } catch (err) {
        console.log("❌ SAVE ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
};

// GET MOVIES
exports.getMovies = async (req, res) => {
    const movies = await Movie.find();
    res.json(movies);
};