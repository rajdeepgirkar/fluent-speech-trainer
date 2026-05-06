# 🎤 Fluent Speech Trainer — MERN Stack

A professional full-stack web application for improving communication skills through interactive speaking activities — featuring real-time speech recognition, word-by-word highlighting, audio recording, comprehensive performance analytics, and secure user authentication.

---

## 📁 Complete Folder Structure

```
comm_v5/
├── client/                         # React Frontend (Vite)
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── api/                    # Axios instance & API calls
│   │   ├── components/             # Reusable React components (Navbar, Footer, etc.)
│   │   ├── context/                # React Context (AuthContext)
│   │   ├── hooks/                  # Custom hooks (useSpeechRecognition, useRecorder)
│   │   ├── pages/                  # Route views (Home, Dashboard, TongueTwister, etc.)
│   │   ├── utils/                  # Shared utilities (speechUtils for Levenshtein)
│   │   ├── App.jsx                 # Main application router
│   │   ├── main.jsx                # Entry point
│   │   └── *.css                   # Stylesheets (index.css, activity.css, etc.)
│   ├── package.json                # Frontend dependencies
│   └── vite.config.js              # Vite bundler configuration
│
├── server/                         # Express.js Backend
│   ├── config/                     # Database configuration (db.js)
│   ├── data/                       # JSON seed data (twisters, paragraphs)
│   ├── middleware/                 # Custom middleware (authMiddleware)
│   ├── models/                     # Mongoose Schemas (User, Score)
│   ├── routes/                     # Express API routers (auth, scores, content)
│   ├── uploads/                    # User audio recordings
│   ├── server.js                   # Express application entry point
│   └── package.json                # Backend dependencies
│
└── README.md                       # This file
```

---

## ✨ Features Overview

| Feature                          | Implementation                                              |
| -------------------------------- | ----------------------------------------------------------- |
| **Multi-page SPA**               | React Router DOM with protected routes                      |
| **Authentication**               | Secure JWT-based login/signup with Bcrypt hashing           |
| **Real-time Speech Recognition** | Web Speech API with continuous mode via custom React hook   |
| **Number Normalization**         | Spoken digits ("3") → words ("three") for accurate matching |
| **Word Highlighting**            | 🟢 Green = correct, 🔴 Red = incorrect, 🟡 Yellow = current |
| **WPM Pacer**                    | Visual guide at adjustable speeds (Slow/Medium/Fast/Custom) |
| **Audio Recording**              | MediaRecorder API via custom hook → downloadable `.webm`    |
| **File Upload**                  | Upload `.txt` files to practice reading custom paragraphs   |
| **Typed Text Input**             | Direct textarea input with live word count                  |
| **Leaderboard**                  | Filterable by module, sorted by accuracy and WPM            |
| **User Dashboard**               | KPIs, module breakdown, streak tracking, activity history   |
| **Score Persistence**            | MongoDB Atlas storage linked to authenticated users         |

---

## 🚀 Quick Start

Follow these steps to run the complete MERN application locally.

### 1. Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB Atlas** account (or local MongoDB server)

### 2. Configure Database Environment

1. In `server/`, create a `.env` file (if it doesn't exist) or update it.
2. Add your MongoDB connection string and a JWT secret:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fluent-speech?retryWrites=true&w=majority

JWT_SECRET=your_super_secret_jwt_key

PORT=5000
```

### 3. Run the Backend

Open a terminal and start the Express server:

```bash
cd server
npm install
npm run dev
```

_(You should see "✅ MongoDB Connected" and "🎤 API running on port 5000")_

### 4. Run the Frontend

Open a **second** terminal and start the Vite React app:

```bash
cd client
npm install
npm run dev
```

_(Vite will provide a local URL, usually `http://localhost:5173`. Open this in your browser.)_

> ⚠️ **Browser Requirement**: Use **Google Chrome** or **Microsoft Edge**  
> (Web Speech API is not supported in Firefox or Safari)

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint  | Description                                              |
| ------ | --------- | -------------------------------------------------------- |
| POST   | `/signup` | Create a new user account (hashes password, returns JWT) |
| POST   | `/login`  | Authenticate user and return JWT                         |

### Content (`/api/twisters` & `/api/paragraphs`)

| Method | Endpoint             | Description                            |
| ------ | -------------------- | -------------------------------------- |
| GET    | `/twisters`          | All twisters by category               |
| GET    | `/twisters/session`  | Get a randomized session of 5 twisters |
| GET    | `/paragraphs`        | All paragraphs by difficulty           |
| GET    | `/paragraphs/random` | Get a random paragraph by difficulty   |

### Scores & Analytics (`/api/score`) _Requires JWT_

| Method | Endpoint     | Description                                         |
| ------ | ------------ | --------------------------------------------------- |
| POST   | `/`          | Save a new practice session score                   |
| GET    | `/`          | Get recent score history for the authenticated user |
| GET    | `/dashboard` | Get aggregated dashboard stats (streaks, averages)  |

---

## 🧠 How It Works

### Authentication Flow

1. **Signup/Login:** User provides credentials. Backend hashes password via `bcrypt` (on signup) or compares hashes (on login).
2. **Token Generation:** Backend issues a JSON Web Token (JWT).
3. **Storage:** Frontend stores the JWT in `localStorage`.
4. **Protected Requests:** The `axios` interceptor automatically attaches the JWT (`Authorization: Bearer <token>`) to every API request.
5. **Validation:** Backend `authMiddleware` validates the token before allowing access to user-specific routes (like saving scores).

### Speech Recognition & Evaluation

1. **Initialize**: `useSpeechRecognition.js` hook wraps Web Speech API.
2. **Normalize**: Target text and transcript are tokenized, lowercase, and **digits are converted to words** to ensure consistent matching.
3. **Compare**: A custom Levenshtein distance algorithm determines if words match (≤ 30% error margin).
4. **React State**: The transcript updates React state in real-time, triggering a re-evaluation and instantly updating DOM classes for highlighted words.

---

## 📊 Scoring System

### Accuracy

```
(correct_words / total_words) × 100
```

### WPM (Words Per Minute)

```
words_spoken / (elapsed_seconds / 60)
```

### Speed Feedback

| Condition            | Feedback |
| -------------------- | -------- |
| WPM < 70% of target  | Too Slow |
| WPM > 135% of target | Too Fast |
| Otherwise            | Optimal  |

**Default Targets**: Slow = 50 WPM · Medium = 100 WPM · Fast = 150 WPM

---

## 🎨 Design System

### Technology

- **CSS**: Pure Vanilla CSS organized by component (`index.css`, `activity.css`, `dashboard.css`, `home.css`).
- **Variables**: extensive use of CSS Custom Properties for theme consistency.

### Visual Identity

- **Background**: Deep rich dark mode gradients.
- **Primary Elements**: Mint green (`var(--mint)`) for success states and primary CTAs.
- **Secondary Elements**: Coral red (`var(--coral)`) for errors/incorrect words.
- **Accent Elements**: Vibrant Gold (`var(--gold)`) for highlights and active UI components.
- **Glassmorphism**: Soft semi-transparent cards with subtle borders and backdrop blurs to create depth.

---

## 🐛 Troubleshooting

### "Speech recognition not working"

- **Solution**: Use Chrome or Edge (Firefox/Safari unsupported).
- Check microphone permissions in browser settings.

### "Microphone access denied"

- **Solution**: Click the 🔒 icon in address bar → Allow microphone. On first visit, you must grant permission.

### "Database Connection Failed"

- **Solution**: Ensure your MongoDB Atlas IP Access List allows your current IP address (or `0.0.0.0/0`). Double-check your username and password in the `.env` file.

### "Scores aren't saving"

- **Solution**: Ensure you are logged in. The "Save Score" button requires a valid JWT token.

---

## 📄 License

MIT License — free to use and modify.

---
