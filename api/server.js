require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const uploadRoutes = require("./routes/uploadRoutes");
const movieRoutes = require("./routes/movieRoutes");
const configRoutes = require("./routes/configRoutes");
const uploadFile = require("./routes/uploadFile");
const authRoutes = require("./routes/authRoutes");
const chunkUpload = require("./routes/chunkUpload");

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "AccessKey"]
}));

// Increase payload limits for large uploads
app.use(express.json({ limit: "700mb" }));
app.use(express.urlencoded({ extended: true, limit: "700mb" }));

// Set timeout for large file uploads (5 minutes)
app.use((req, res, next) => {
    req.setTimeout(300000); // 5 minutes
    res.setTimeout(300000);
    next();
});

/* =========================
   DATABASE
========================= */
connectDB();

/* =========================
   ROUTES
========================= */

// AUTH (LOGIN / REGISTER)
app.use("/api/auth", authRoutes);

// BUNNY CONFIG
app.use("/api/config", configRoutes);

// UPLOAD ROUTES - Order matters!
// Chunked upload routes
app.use("/api/upload", chunkUpload);

// Thumbnail upload
app.use("/api/upload", uploadFile);

// General upload routes
app.use("/api/upload", uploadRoutes);

// MOVIES (PROTECTED)
app.use("/api/movies", movieRoutes);

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
    res.json({
        status: "Vidoflix API running 🚀"
    });
});

/* =========================
   ERROR HANDLING
========================= */
// Handle Multer errors specifically
app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            message: "File too large",
            error: err.message
        });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            message: "Unexpected field",
            error: err.message
        });
    }
    
    // Handle request aborted errors silently (client disconnected)
    if (err.message === 'Request aborted' || err.code === 'ECONNRESET') {
        console.log('⚠️ Client disconnected during upload');
        return; // Don't send response, client already disconnected
    }
    
    console.error("Global Error:", err);
    res.status(500).json({
        message: "Internal Server Error",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("🚀 Server running on port", PORT);
});