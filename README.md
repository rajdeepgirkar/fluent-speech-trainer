# 🎤 Speech Fluency Trainer

> 🚧 **Project Status: Under Development**
>
> ⚠️ Some features are not fully implemented yet:
>
> * 🏆 Leaderboard and 👤 User Dashboard are **in progress**
> * 🔊 Play Audio and 💾 Save Scores may **not work as intended**
>
> 📝 This is currently a **single-page static web application (SPA)** with a Flask backend for APIs.

---

## 💡 Overview

A web application designed to improve communication and speaking skills through interactive activities like tongue twisters and paragraph reading — powered by real-time speech recognition and instant feedback.

---

## ✨ Features

<p align = "center">

![Speech Recognition](https://img.shields.io/badge/Speech-Real--Time-blue?style=for-the-badge)
![Accuracy](https://img.shields.io/badge/Accuracy-Tracking-green?style=for-the-badge)
![WPM](https://img.shields.io/badge/WPM-Pacer-orange?style=for-the-badge)
![Recording](https://img.shields.io/badge/Audio-Recording-red?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Development-yellow?style=for-the-badge)

</p>

| Feature                         | Details                                   |
| ------------------------------- | ----------------------------------------- |
| 👅 Tongue Twisters              | 5-twister sessions across 3 categories    |
| 📖 Paragraph Reading            | Easy / Medium / Hard + custom text upload |
| 🎤 Real-time Speech Recognition | Web Speech API, word-by-word comparison   |
| 🟢🔴 Live Highlighting          | Green = correct, Red = incorrect          |
| ⏱ WPM Pacer                     | 80 / 130 / 200 WPM visual guide           |
| 🎯 Accuracy Score               | Per-session percentage                    |
| ⚡ Speed Feedback                | Too Slow / Optimal / Too Fast             |
| 🎙️ Audio Recording               | MediaRecorder API (.webm download)        |
| 🏆 Leaderboard                  | ⚠️ Under development                      |
| ⭐ Daily Challenge               | Same for all users (date-based)           |

---

## 🗂 Project Structure

```
speech-fluency-trainer/
├── app.py
├── requirements.txt
├── README.md
├── data/
│   ├── tongue_twisters.json
│   ├── paragraphs.json
│   └── scores.json
├── uploads/
├── recordings/
├── templates/
│   └── index.html   # Single Page App
└── static/
    ├── css/
    └── js/
```

---

## 🚀 Installation & Setup

### 🔹 1. Clone the Repository

```bash
git clone https://github.com/your-username/speech-fluency-trainer.git
cd speech-fluency-trainer
```

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

👉 **<http://localhost:5000>**

> ⚠️ Use **Google Chrome / Microsoft Edge** (Web Speech API required)

---

## 🧠 Core Functionality

### 🎤 Speech Recognition

* Real-time voice input using Web Speech API
* Continuous listening with auto-restart
* Word-by-word comparison
* Fuzzy matching support

### 🎨 Live Feedback

```diff
+ Correct words → Green
- Incorrect words → Red
```

### ⏱ Performance Tracking

* Accuracy (%) calculation
* Words Per Minute (WPM)
* Speed classification

---

## 🎙 Audio Features (Experimental)

* Record voice using MediaRecorder API
* Download recording as `.webm`
* ⚠️ Playback & server upload may be unstable

---

## 🔌 API Endpoints

| Method | Endpoint               | Description          |
| ------ | ---------------------- | -------------------- |
| GET    | `/`                    | Serve SPA            |
| GET    | `/api/tongue-twisters` | Fetch twisters       |
| GET    | `/api/paragraphs`      | Fetch paragraphs     |
| GET    | `/api/daily-challenge` | Daily challenge      |
| POST   | `/api/upload-text`     | Upload text          |
| GET    | `/api/scores`          | ⚠️ Leaderboard (WIP) |
| POST   | `/api/audio`           | Save audio           |
| GET    | `/api/health`          | Health check         |

---

## ⚙️ Configuration

### Python (`app.py`)

```python
ALLOWED_TEXT  = {'txt'}
ALLOWED_AUDIO = {'wav', 'webm', 'ogg', 'mp3'}
```

### JavaScript (`app.js`)

```javascript
const WPM_TARGETS = { slow: 80, medium: 130, fast: 200 };
const TT_SESSION_SIZE = 5;
```

---

## 🚧 Known Limitations

* Leaderboard not fully functional
* User tracking/dashboard not implemented
* Audio playback may fail in some browsers
* Score saving may not persist correctly

---

## 🔮 Future Scope

* AI pronunciation feedback
* User authentication & dashboard
* Progress tracking
* Multiplayer / competitive mode
* Mobile optimization

---

## 📝 License

MIT License — free to use and modify.
