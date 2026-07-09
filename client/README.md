# 🎤 Fluent Speech Trainer — Client

React frontend for the Fluent Speech Trainer, built with **Vite** and **React 19**.

---

## 🛠️ Tech Stack

| Technology            | Purpose                                   |
| --------------------- | ----------------------------------------- |
| **React 19**          | UI framework with hooks & context         |
| **Vite**              | Fast dev server & production bundler      |
| **React Router DOM**  | Client-side routing with protected routes |
| **Axios**             | HTTP client with JWT interceptor          |
| **Web Speech API**    | Real-time speech recognition              |
| **MediaRecorder API** | Audio recording & download                |
| **Vanilla CSS**       | Custom design system with CSS variables   |

---

## 📁 Source Structure

```
src/
├── api/
│   └── axios.js                # Axios instance with auto JWT attachment
├── components/
│   ├── Navbar.jsx              # Responsive nav with hamburger menu
│   ├── ProtectedRoute.jsx      # Auth-gated route wrapper
│   └── Toast.jsx               # Toast notification system
├── context/
│   └── AuthContext.jsx          # Auth state (login, logout, token management)
├── hooks/
│   ├── useSpeechRecognition.js  # Web Speech API wrapper (continuous mode)
│   └── useRecorder.js           # MediaRecorder hook for audio capture
├── pages/
│   ├── Home.jsx                 # Landing page with feature cards
│   ├── Login.jsx                # Login form with validation
│   ├── Signup.jsx               # Registration form
│   ├── Dashboard.jsx            # Personal analytics, KPIs & activity management
│   ├── Leaderboard.jsx          # Global rankings with color-coded accuracy
│   ├── TongueTwister.jsx        # Tongue twister practice module
│   └── Paragraph.jsx            # Paragraph reading module (upload/type/select)
├── utils/
│   └── speechUtils.js           # Levenshtein distance, number normalization
├── App.jsx                      # React Router configuration
├── main.jsx                     # App entry point
├── index.css                    # Design tokens, global styles, leaderboard CSS
├── home.css                     # Home page styles
├── activity.css                 # Practice activity styles
├── dashboard.css                # Dashboard, history table & delete button styles
└── App.css                      # App layout styles
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs at `http://localhost:5173` by default.

> **Requires the backend** running at `http://localhost:5000` (or set `VITE_API_URL` in `.env`).

---

## 📄 Pages

### 🏠 Home (`/`)

Landing page showcasing app features with animated cards and call-to-action buttons.

### 🔐 Login (`/login`) & Signup (`/signup`)

JWT-based authentication forms with error handling and redirect on success.

### 📊 Dashboard (`/dashboard`) — _Protected_

Personal analytics hub showing:

- **KPI Strip**: Avg Accuracy, Best Score, Avg WPM, Total Sessions, Day Streak, Global Rank
- **Module Breakdown**: Per-module session count and average accuracy with visual bars
- **Speed Feedback Distribution**: Optimal / Too Slow / Too Fast counts with proportional bars
- **Recent Activity**: Last 10 sessions in a table with:
  - Date (dd/mm/yyyy format), Module, Accuracy (color-coded), WPM, Speed Setting, Feedback
  - 🗑️ **Delete button** per row — removes the activity from MongoDB Atlas with confirmation, then auto-refreshes all dashboard stats and rankings

### 🏆 Leaderboard (`/leaderboard`) — _Protected_

Global top 20 scores across all users with:

- Filterable by module (All / Tongue Twister / Paragraph)
- Color-coded accuracy: 🟢 ≥85% mint, 🟡 ≥65% gold, 🔴 <65% coral
- Medal icons for top 3 (🥇🥈🥉)

### 👅 Tongue Twister (`/tongue-twister`) — _Protected_

Interactive practice with real-time speech recognition, word highlighting, WPM pacer, and audio recording.

### 📖 Paragraph Reading (`/paragraph`) — _Protected_

Read paragraphs with speech recognition feedback. Supports:

- Random paragraph selection by difficulty
- Custom text upload (`.txt` file)
- Direct text input via textarea

---

## 🎨 Design System

Pure **Vanilla CSS** with CSS Custom Properties:

| Token           | Value                    | Usage                                        |
| --------------- | ------------------------ | -------------------------------------------- |
| `--mint`        | `#00d4aa`                | Success, correct words, primary CTA          |
| `--coral`       | `#ff6b6b`                | Errors, incorrect words, low accuracy        |
| `--gold`        | `#ffc857`                | Highlights, medium accuracy, active elements |
| `--blue-accent` | `#4d7cff`                | Links, "Too Slow" feedback                   |
| `--bg-dark`     | `#0a0a1a`                | Page background                              |
| `--bg-card`     | `rgba(255,255,255,0.04)` | Card backgrounds                             |
| `--bg-glass`    | `rgba(255,255,255,0.06)` | Glassmorphism panels                         |

---

## 🔧 Environment Variables

Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:5000
```

---

## 📦 Build for Production

```bash
npm run build
```

Output is generated in the `dist/` directory.

---

## ⚠️ Browser Requirements

- **Google Chrome** or **Microsoft Edge** (recommended)
- Web Speech API is **not supported** in Firefox or Safari
- Microphone access must be granted for speech recognition features
