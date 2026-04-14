const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
    title: String,
    description: String,
    videoUrl: String,
    thumbnailUrl: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Movie", movieSchema);