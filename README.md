# 🎤 Speech Fluency Trainer

> 🚧 **Project Status: Under Active Development**
>
> ✅ Core features are now functional:
>
> * 🏆 Leaderboard implemented
> * 👤 User Dashboard available
> * 🔊 Audio Playback working
> * 💾 Score Saving functional
>
> 🌐 Deployment:
>
> * ⏳ GitHub Pages deployment — **Pending**
>
> 📝 This is now a **multi-page web application** built using **Flask (backend APIs)** and dynamic frontend templates.

---

## 💡 Overview

A web application designed to improve communication and speaking skills through interactive activities like tongue twisters and paragraph reading — powered by real-time speech recognition, instant feedback, and performance tracking.

---

## ✨ Features

<p align="center">

![Speech Recognition](https://img.shields.io/badge/Speech-Real--Time-blue?style=for-the-badge)
![Accuracy](https://img.shields.io/badge/Accuracy-Tracking-green?style=for-the-badge)
![WPM](https://img.shields.io/badge/WPM-Pacer-orange?style=for-the-badge)
![Recording](https://img.shields.io/badge/Audio-Recording-red?style=for-the-badge)
![Leaderboard](https://img.shields.io/badge/Leaderboard-Live-purple?style=for-the-badge)

</p>

| Feature                         | Details                                     |
| ------------------------------- | ------------------------------------------- |
| 👅 Tongue Twisters              | 5-twister sessions across 3 categories      |
| 📖 Paragraph Reading            | Easy / Medium / Hard + custom text upload   |
| 🎤 Real-time Speech Recognition | Web Speech API with word-by-word comparison |
| 🟢🔴 Live Highlighting          | Green = correct, Red = incorrect            |
| ⏱ WPM Pacer                     | 50 / 100 / 150 WPM visual guide             |
| 🎯 Accuracy Score               | Real-time percentage calculation            |
| ⚡ Speed Feedback                | Too Slow / Optimal / Too Fast               |
| 🎙️ Audio Recording             | Record, download, and playback audio        |
| 🏆 Leaderboard                  | Top 20 users based on accuracy              |
| 👤 User Dashboard               | View personal performance & history         |
| ⭐ Daily Challenge               | Same challenge for all users (date-based)   |
| 💾 Score Saving                 | Persistent storage using JSON               |

---

## 🗂 Project Structure

```
fluent-speech-trainer/
├── app.py
├── data/
│   ├── paragraphs.json
│   ├── scores.json
│   └── tongue_twisters.json
├── README.md
├── recordings/
├── requirements.txt
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── common.js
│       ├── daily.js
│       ├── para.js
│       ├── recorder.js
│       ├── speech.js
│       └── tt.js
├── templates/
│   ├── base.html
│   ├── daily_challenge.html
│   ├── dashboard.html
│   ├── home.html
│   ├── leaderboard.html
│   ├── paragraph.html
│   └── tongue_twister.html
└── uploads/
    └── sample.txt
```

---

## 🚀 Installation & Setup

### 🔹 1. Clone the Repository

```bash
git clone https://github.com/your-username/fluent-speech-trainer.git
cd fluent-speech-trainer
```

---

### 🔹 2. Install Dependencies (pip)

```bash
pip install -r requirements.txt
```

> 💡 Recommended: Use a virtual environment

```bash
python -m venv venv
venv\Scripts\activate   # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

---

### 🔹 3. Run the Application

```bash
python app.py
```

---

### 🔹 4. Open in Browser

👉 **http://localhost:5000**

> ⚠️ Use **Google Chrome / Microsoft Edge** (required for Web Speech API)

---

## 🧠 Core Functionality

### 🎤 Speech Recognition

* Real-time voice input using Web Speech API
* Continuous listening with auto-restart
* Word-by-word comparison
* Fuzzy matching support

---

### 🎨 Live Feedback

```diff
+ Correct words → Green
- Incorrect words → Red
```

---

### ⏱ Performance Tracking

* Accuracy (%) calculation
* Words Per Minute (WPM)
* Speed classification (Slow / Optimal / Fast)

---

## 🎙 Audio Features

* Record voice using MediaRecorder API
* Download recordings as `.webm`
* Playback directly in browser
* Optional server-side storage

---

## 🏆 Leaderboard & Dashboard

* 🥇 Top 20 users ranked by accuracy
* 👤 Individual user dashboard
* 📊 Track past performance
* 💾 Persistent score storage (JSON-based)

---

## 🔌 API Endpoints

| Method | Endpoint               | Description            |
| ------ | ---------------------- | ---------------------- |
| GET    | `/`                    | Home page              |
| GET    | `/tongue-twister`      | Tongue twister page    |
| GET    | `/paragraph`           | Paragraph reading page |
| GET    | `/leaderboard`         | Leaderboard UI         |
| GET    | `/dashboard`           | User dashboard         |
| GET    | `/daily-challenge`     | Daily challenge page   |
| GET    | `/api/tongue-twisters` | Fetch twisters         |
| GET    | `/api/paragraphs`      | Fetch paragraphs       |
| GET    | `/api/daily-challenge` | Daily challenge data   |
| POST   | `/api/upload-text`     | Upload text            |
| GET    | `/api/scores`          | Get leaderboard        |
| POST   | `/api/scores`          | Save score             |
| GET    | `/api/audio`           | Fetch audio            |
| POST   | `/api/audio`           | Save audio             |
| GET    | `/api/health`          | Health check           |

---

## ⚙️ Configuration

### Python (`app.py`)

```python
ALLOWED_TEXT  = {'txt'}
ALLOWED_AUDIO = {'wav', 'webm', 'ogg', 'mp3'}
```

---

### JavaScript

```javascript
const WPM_TARGETS = { slow: 50, medium: 100, fast: 150 };
const TT_SESSION_SIZE = 5;
```

---

## 🔮 Future Scope

* AI pronunciation feedback (Whisper / Wav2Vec)
* Authentication system
* GitHub Pages / Vercel Deployment
* Mobile responsiveness improvements

---

## 📝 License

MIT License — free to use and modify.
