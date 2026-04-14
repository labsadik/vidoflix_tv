const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const { saveMovie, getMovies } = require("../controllers/movieController");

// SAVE MOVIE
router.post("/save", auth, saveMovie);

// GET MOVIES
router.get("/", auth, getMovies);

module.exports = router;