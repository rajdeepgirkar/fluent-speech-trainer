# 🎤 Fluent Speech Trainer — Server

Express.js backend for the Fluent Speech Trainer, providing a robust API for user authentication, content delivery, scoring, and analytics via MongoDB Atlas.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Node.js** | JavaScript runtime environment |
| **Express.js** | Web framework for building RESTful APIs |
| **MongoDB & Mongoose** | NoSQL database and Object Data Modeling (ODM) |
| **JSON Web Tokens (JWT)** | Secure, stateless authentication |
| **Bcrypt.js** | Password hashing for user security |
| **Multer** | Middleware for handling file uploads (audio/text) |
| **Cors & Dotenv** | Cross-Origin Resource Sharing and environment management |

---

## 📁 Source Structure

```
server/
├── config/
│   └── db.js                 # MongoDB connection logic
├── data/
│   ├── paragraphs.json       # Seed data for paragraph reading (categorized by difficulty)
│   └── tongue_twisters.json  # Seed data for tongue twisters (categorized)
├── middleware/
│   └── authMiddleware.js     # Validates JWT tokens and protects private routes
├── models/
│   ├── Score.js              # Mongoose schema for user scores (accuracy, WPM, details)
│   └── User.js               # Mongoose schema for user accounts with bcrypt pre-save
├── routes/
│   ├── authRoutes.js         # Endpoints: POST /signup, POST /login
│   ├── scoreRoutes.js        # Endpoints: CRUD for scores, dashboard analytics, leaderboard
│   ├── speechRoutes.js       # Endpoints: GET twisters and paragraphs data
│   └── uploadRoutes.js       # Endpoints: POST file uploads
├── uploads/                  # Directory for uploaded files (auto-created if missing)
├── server.js                 # Express application entry point & middleware setup
├── package.json              # Backend dependencies and scripts
└── .env                      # Environment variables (needs to be created)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v16+)
- A MongoDB cluster (e.g., MongoDB Atlas) or local MongoDB instance

### 2. Environment Variables
Create a `.env` file in the `server/` root directory with the following keys:

```env
# MongoDB Connection String (Replace with your own credentials)
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fluent-speech?retryWrites=true&w=majority

# JWT Secret for signing tokens (Use a strong random string)
JWT_SECRET=your_super_secret_jwt_key

# Port for the Express server to run on
PORT=5000
```

### 3. Installation & Running

```bash
# Install dependencies
npm install

# Start the server in development mode (with nodemon for auto-restarts)
npm run dev

# Start the server in production mode
npm start
```

The server will be available at `http://localhost:5000`.

---

## 🔌 Core Functionality & APIs

### 🔐 Authentication (`/api/auth`)
Handles user registration and login securely.
- `POST /api/auth/signup`: Validates email/password, hashes the password using `bcryptjs`, saves the user to MongoDB, and returns a signed JWT.
- `POST /api/auth/login`: Verifies user credentials against the hashed password and issues a JWT.

### 📚 Content Delivery (`/api`)
Serves practice material from static JSON files located in the `data/` directory.
- `GET /api/twisters`: Returns all tongue twisters grouped by category.
- `GET /api/twisters/session`: Returns a randomized set of 5 tongue twisters for a practice session.
- `GET /api/paragraphs`: Returns all paragraphs grouped by difficulty.
- `GET /api/paragraphs/random`: Returns a random paragraph based on a requested difficulty query parameter.

### 📊 Scoring & Analytics (`/api/score`) — *Protected via JWT*
Manages performance records and computes aggregated statistics. Requires the `Authorization: Bearer <token>` header.
- `POST /api/score`: Saves a new session score including module name, accuracy (%), WPM, speed setting, and granular feedback.
- `GET /api/score`: Retrieves the logged-in user's recent score history (latest 20 entries).
- `GET /api/score/dashboard`: Computes real-time KPIs for the dashboard, including:
  - Average and Best Accuracy & WPM
  - Consecutive day practice streaks
  - Global user ranking
  - Module breakdowns and speed feedback distribution
- `GET /api/score/leaderboard`: Aggregates the top 20 scores across the entire platform, sorted by accuracy and WPM.
- `DELETE /api/score/:id`: Deletes a specific activity record. Enforces ownership (users can only delete their own scores).

### 📁 File Uploads (`/api/upload`)
- `POST /api/upload`: Accepts file uploads (like `.txt` for custom paragraph practice) using `multer` and saves them to the local `/uploads` folder.

### 🏥 Health Check (`/api/health`)
- `GET /api/health`: Returns a status ping along with the server's configured WPM targets (`slow`, `medium`, `fast`) for client-side syncing.

---

## 🔒 Security Measures

1. **Password Hashing**: Passwords are never stored in plaintext. They are salted and hashed using `bcryptjs` via Mongoose middleware before saving.
2. **JWT Authentication**: User identity is verified on protected routes using JWTs that expire or must be managed securely on the client.
3. **Authorization Checks**: Destructive operations, like the `DELETE /api/score/:id` endpoint, explicitly check that the requesting user's ID matches the score's owner ID.
4. **CORS Configured**: Cross-Origin Resource Sharing is enabled to allow frontend connections while providing a layer of security over who can request resources.
