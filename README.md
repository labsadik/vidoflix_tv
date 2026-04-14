

# 🎬 Vidoflix

A full-stack **video streaming platform** like Netflix/YouTube built with **Node.js, Express, MongoDB, and BunnyCDN**.
It supports **large video uploads (chunked upload system)**, authentication, admin dashboard, and video streaming.

---

# 🚀 Project Overview

**Vidoflix** is a scalable video hosting and streaming platform where:

* Admin can upload movies/videos
* Videos are stored on **Bunny Stream + Bunny CDN**
* Users can watch videos instantly via embedded player
* System supports **large file uploads (1GB – 100GB+) using chunk upload system**
* Secure authentication system with JWT

---

# ✨ Features

## 👤 User Features

* 🔐 Login / Register system
* 🎬 Watch movies instantly
* 📺 Netflix-style UI
* 🖼️ Movie thumbnails from CDN
* ⚡ Fast streaming via Bunny CDN
* 📱 Responsive design (mobile + desktop)

---

## 🛠️ Admin Features

* 🎬 Upload movies/videos
* 📦 Chunked upload system (for large files)
* 📊 Admin dashboard analytics
* ✏️ Edit movie title & description
* ❌ Delete movies
* 📈 View active users
* ⏱️ Upload progress tracking (% bar)
* ☁️ Automatic upload to Bunny Stream + CDN

---

## ⚙️ System Features

* 🚀 Chunked upload (YouTube-like system)
* 🔄 Resume-friendly architecture (extendable)
* ☁️ Bunny Stream integration (video hosting)
* ☁️ Bunny CDN (fast global delivery)
* 🔐 JWT authentication
* 🗂️ MongoDB database storage
* 🧹 Auto cleanup of temporary upload files

---

# 🧠 How It Works

## 📤 1. Video Upload Process

1. Admin selects video file
2. File is split into **chunks**
3. Chunks are uploaded to backend API
4. Backend stores chunks temporarily
5. Chunks are merged into final file
6. Final file is uploaded to **Bunny Stream**
7. Video URL is generated and saved in MongoDB

---

## 🎥 2. Video Streaming Process

1. User opens Vidoflix homepage
2. Frontend fetches movie list from API
3. Thumbnails loaded from Bunny CDN
4. Clicking a movie opens embedded player
5. Video streams directly from Bunny CDN (fast global delivery)

---

## 🔐 3. Authentication System

* Users register/login
* Server issues JWT token
* Token stored in browser localStorage
* Protected routes (admin + movies API)

---

## 📊 4. Analytics System

* Tracks total uploaded movies
* Tracks daily uploads
* Tracks active users (last 5 min activity)
* Admin dashboard shows real-time stats

---

# 🏗️ Tech Stack

## Frontend

* HTML
* CSS
* JavaScript (Vanilla)

## Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

## Storage & Streaming

* Bunny Stream (video hosting)
* Bunny CDN (fast delivery)

## Security

* JWT Authentication
* Middleware protected APIs


---

# ⚡ API Endpoints

## Auth

```
POST /api/auth/register
POST /api/auth/login
```

## Movies

```
GET    /api/movies
POST   /api/movies/save
PUT    /api/movies/:id
DELETE /api/movies/:id
```

## Upload

```
POST /api/upload/init
POST /api/upload/chunk
POST /api/upload/complete
```

## Config

```
GET /api/config/bunny
```

## Analytics

```
GET /api/admin/active-users
```

---

# 🔥 Key Highlights

* ✔ YouTube-like chunk upload system
* ✔ Scalable architecture for large videos (100GB+ ready)
* ✔ Fast CDN streaming
* ✔ Admin dashboard analytics
* ✔ Secure JWT authentication
* ✔ Fully responsive UI

---




