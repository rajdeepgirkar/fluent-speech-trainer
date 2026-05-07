# 🎤 Fluent Speech Trainer — MERN Stack

A professional full-stack web application for improving communication skills through interactive speaking activities — featuring real-time speech recognition, word-by-word highlighting, audio recording, comprehensive performance analytics, activity management, and secure user authentication.

---

## 📁 Complete Folder Structure

```
comm_v6/
├── client/                         # React Frontend (Vite)
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── api/                    # Axios instance & API configuration
│   │   │   └── axios.js            # Axios with JWT interceptor
│   │   ├── components/             # Reusable React components
│   │   │   ├── Navbar.jsx          # Navigation bar with responsive hamburger menu
│   │   │   ├── ProtectedRoute.jsx  # Auth-gated route wrapper
│   │   │   └── Toast.jsx           # Toast notification component
│   │   ├── context/                # React Context
│   │   │   └── AuthContext.jsx     # Authentication state management
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useRecorder.js      # MediaRecorder API wrapper for audio capture
│   │   │   └── useSpeechRecognition.js  # Web Speech API wrapper with continuous mode
│   │   ├── pages/                  # Route views
│   │   │   ├── Home.jsx            # Landing page with feature showcase
│   │   │   ├── Login.jsx           # User login form
│   │   │   ├── Signup.jsx          # User registration form
│   │   │   ├── Dashboard.jsx       # Personal analytics with activity management
│   │   │   ├── Leaderboard.jsx     # Global rankings with color-coded accuracy
│   │   │   ├── TongueTwister.jsx   # Tongue twister practice module
│   │   │   └── Paragraph.jsx       # Paragraph reading practice module
│   │   ├── utils/                  # Shared utilities
│   │   │   └── speechUtils.js      # Levenshtein distance & number normalization
│   │   ├── App.jsx                 # Main application router
│   │   ├── main.jsx                # Entry point
│   │   ├── index.css               # Global styles, design tokens & leaderboard styles
│   │   ├── home.css                # Home page styles
│   │   ├── activity.css            # Activity module styles
│   │   ├── dashboard.css           # Dashboard & activity table styles
│   │   └── App.css                 # App-level layout styles
│   ├── index.html                  # HTML entry point
│   ├── package.json                # Frontend dependencies
│   └── vite.config.js              # Vite bundler configuration
│
├── server/                         # Express.js Backend
│   ├── config/                     # Database configuration
│   │   └── db.js                   # MongoDB connection setup
│   ├── data/                       # JSON seed data
│   │   ├── tongue_twisters.json    # Tongue twister content by category
│   │   └── paragraphs.json         # Paragraph content by difficulty
│   ├── middleware/                  # Custom middleware
│   │   └── authMiddleware.js       # JWT verification & route protection
│   ├── models/                     # Mongoose Schemas
│   │   ├── User.js                 # User model with bcrypt password hashing
│   │   └── Score.js                # Score model with accuracy, WPM, speed feedback
│   ├── routes/                     # Express API routers
│   │   ├── authRoutes.js           # Signup & login endpoints
│   │   ├── speechRoutes.js         # Twisters & paragraphs content endpoints
│   │   ├── scoreRoutes.js          # Score CRUD, dashboard analytics & leaderboard
│   │   └── uploadRoutes.js         # File upload endpoint
│   ├── uploads/                    # User audio recordings (auto-created)
│   ├── server.js                   # Express application entry point
│   └── package.json                # Backend dependencies
│
└── README.md                       # This file
```

---

## ✨ Features Overview

| Feature                          | Implementation                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| **Multi-page SPA**               | React Router DOM with protected routes                                                      |
| **Authentication**               | Secure JWT-based login/signup with Bcrypt hashing                                           |
| **Real-time Speech Recognition** | Web Speech API with continuous mode via custom React hook                                   |
| **Number Normalization**         | Spoken digits ("3") → words ("three") for accurate matching                                 |
| **Word Highlighting**            | 🟢 Green = correct, 🔴 Red = incorrect, 🟡 Yellow = current                                 |
| **WPM Pacer**                    | Visual guide at adjustable speeds (Slow/Medium/Fast/Custom)                                 |
| **Audio Recording**              | MediaRecorder API via custom hook → downloadable `.webm`                                    |
| **File Upload**                  | Upload `.txt` files to practice reading custom paragraphs                                   |
| **Typed Text Input**             | Direct textarea input with live word count                                                  |
| **Leaderboard**                  | Filterable by module, sorted by accuracy with color-coded scores                            |
| **User Dashboard**               | KPIs, module breakdown, streak tracking, activity history                                   |
| **Activity Management**          | Delete individual activities from dashboard with confirmation                               |
| **Score Persistence**            | MongoDB Atlas storage linked to authenticated users                                         |
| **Color-coded Accuracy**         | 🟢 ≥85% (mint), 🟡 ≥65% (gold), 🔴 <65% (coral) — consistent across Dashboard & Leaderboard |

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

| Method | Endpoint       | Description                                                                               |
| ------ | -------------- | ----------------------------------------------------------------------------------------- |
| POST   | `/`            | Save a new practice session score                                                         |
| GET    | `/`            | Get recent score history (last 20) for the authenticated user                             |
| GET    | `/dashboard`   | Get aggregated dashboard stats (KPIs, streaks, rank, module breakdown, recent activity)   |
| GET    | `/leaderboard` | Get top 20 scores across all users, sorted by accuracy & WPM                              |
| DELETE | `/:id`         | Delete a specific activity (own scores only) — reflects in Dashboard, Leaderboard & Atlas |

### Upload (`/api/upload`)

| Method | Endpoint | Description                                        |
| ------ | -------- | -------------------------------------------------- |
| POST   | `/`      | Upload a `.txt` file for custom paragraph practice |

### Health (`/api/health`)

| Method | Endpoint | Description                                       |
| ------ | -------- | ------------------------------------------------- |
| GET    | `/`      | Server health check with WPM target configuration |

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

### Activity Management

1. **Dashboard View**: The "Recent Activity" section displays the last 10 sessions in a table with Date, Module, Accuracy, WPM, Speed, Feedback, and a delete action per row.
2. **Delete Flow**: Clicking the 🗑️ button shows a confirmation dialog. On confirmation, a `DELETE /api/score/:id` request is sent.
3. **Backend Validation**: The server verifies the score exists and belongs to the requesting user (ownership check via `userId`).
4. **Atlas Sync**: The score document is permanently removed from MongoDB Atlas using `findByIdAndDelete`.
5. **Dashboard Refresh**: After deletion, the entire dashboard reloads — recalculating all KPIs (avg accuracy, avg WPM, best scores, streak, global rank, module breakdown, speed feedback distribution).
6. **Leaderboard Reflection**: Since the leaderboard queries MongoDB on each page load, deleted scores are automatically excluded from rankings.

---

## 📊 Scoring System

### Accuracy

```
(correct_words / total_words) × 100
```

### Color-coded Accuracy Display

| Accuracy Range | Color         | CSS Class    |
| -------------- | ------------- | ------------ |
| ≥ 85%          | 🟢 Mint Green | `text-mint`  |
| ≥ 65%          | 🟡 Gold       | `text-gold`  |
| < 65%          | 🔴 Coral Red  | `text-coral` |

This color scheme is applied consistently across the **Dashboard** (Recent Activity table) and the **Leaderboard** (global rankings).

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

## 🔮 Future Enhancements

- [ ] AI pronunciation feedback (Whisper API integration)
- [ ] Multi-language support (es, fr, de, hi)
- [ ] Advanced Progress charts (accuracy over time with Chart.js)
- [ ] Difficulty auto-adjustment based on user history
- [ ] Voice analysis (pitch, pace, pauses)

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
