# 🎤 Fluent Speech Trainer

<div align="center">

![MERN](https://img.shields.io/badge/MERN-Full%20Stack-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![NodeJS](https://img.shields.io/badge/Node.js-Express-success?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?style=for-the-badge&logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker)
![AWS](https://img.shields.io/badge/AWS-EC2-orange?style=for-the-badge&logo=amazonaws)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**A Production-Ready MERN Stack Speech Training Platform**

Improve communication skills through real-time speech recognition, pronunciation practice, fluency analysis, interactive speaking exercises, and comprehensive performance analytics.

---

**React • Node.js • Express • MongoDB Atlas • Docker • Docker Compose • Nginx • AWS EC2**

</div>

---

# 📖 Table of Contents

- Project Overview
- Project Objectives
- Key Features
- Technology Stack
- System Architecture
- High-Level Workflow
- Deployment Architecture
- Folder Structure

---

# 📌 Project Overview

**Fluent Speech Trainer** is a full-stack web application developed to help users improve their communication skills through structured speaking exercises.

The application provides an interactive environment where users can practice speaking using **Tongue Twisters**, **Paragraph Reading**, and **Custom Text Practice**, while receiving detailed feedback about their speech performance.

Unlike traditional communication learning platforms that only display reading material, Fluent Speech Trainer performs **real-time speech recognition**, evaluates the spoken text against the original content, calculates multiple communication metrics, and stores user performance history for future analysis.

The project follows a modern cloud-native architecture using the **MERN Stack**, with Dockerized services deployed on an AWS EC2 instance.

---

# 🎯 Project Objectives

The primary objectives of the project are:

- Improve pronunciation through repeated speaking exercises.
- Increase speaking fluency.
- Measure speaking speed using Words Per Minute (WPM).
- Improve articulation using tongue twisters.
- Track communication progress over time.
- Provide personalized analytics through a dashboard.
- Store performance history securely.
- Build a scalable cloud-ready web application.

---

# 🚀 Key Features

## 👤 User Authentication

- Secure User Registration
- Secure Login
- JWT Authentication
- Password Hashing using bcrypt
- Protected Routes
- Session Persistence

---

## 🎤 Speech Recognition

- Real-time Speech Recognition
- Continuous Listening
- Live Transcript Generation
- Automatic Restart
- Browser Microphone Integration

---

## 📖 Speaking Activities

### Tongue Twister Practice

- Communication
- Pronunciation
- Articulation
- Public Speaking
- Confidence Building

Random sessions are generated dynamically from the database.

---

### Paragraph Reading

Difficulty Levels

- Easy
- Medium
- Hard

Random paragraph generation.

---

### Custom Reading Practice

Users can

- Upload TXT files
- Paste their own text
- Practice any content

---

## 🎯 Real-Time Evaluation

The application evaluates

- Accuracy
- Correct Words
- Incorrect Words
- Missed Words
- Extra Words
- Words Per Minute
- Reading Speed
- Speaking Feedback

---

## 🟢 Live Word Highlighting

During speech recognition

🟢 Correct words

🔴 Incorrect words

🟡 Current word

This provides immediate visual feedback.

---

## 🎧 Audio Recording

Built using the browser MediaRecorder API.

Users can

- Record speech
- Download recordings
- Review practice sessions

---

## 📊 Dashboard

Each user gets a personalized dashboard containing

- Average Accuracy
- Average WPM
- Best Accuracy
- Best WPM
- Recent Activities
- Activity History
- Module-wise Statistics
- Streak Information
- Performance Distribution

---

## 🏆 Leaderboard

Global leaderboard displaying

- Username
- Accuracy
- WPM
- Module
- Rank

Leaderboard updates automatically whenever scores change.

---

## 🗑 Activity Management

Users can

- Delete activities
- Remove unwanted sessions
- Automatically update dashboard statistics
- Automatically update leaderboard

---

## 📁 File Upload

Supports

- TXT Upload
- Custom Paragraph Practice

---

## ☁ Cloud Deployment

Application is deployed using

- Docker
- Docker Compose
- Docker Hub
- MongoDB Atlas
- AWS EC2
- Nginx

---

# ⭐ Major Highlights

- Production Ready
- Responsive UI
- JWT Authentication
- MongoDB Atlas
- Dockerized Architecture
- Cloud Deployment
- Modern UI
- Speech Recognition
- Real-time Analytics
- Dashboard
- Leaderboard

---

# 🛠 Technology Stack

## Frontend

| Technology | Purpose |
|------------|----------|
| React | UI Development |
| Vite | Build Tool |
| React Router | Routing |
| Axios | API Communication |
| CSS3 | Styling |
| Web Speech API | Speech Recognition |
| MediaRecorder API | Audio Recording |

---

## Backend

| Technology | Purpose |
|------------|----------|
| Node.js | Runtime |
| Express.js | REST API |
| JWT | Authentication |
| bcrypt | Password Encryption |
| Multer | File Upload |
| dotenv | Environment Variables |

---

## Database

| Technology | Purpose |
|------------|----------|
| MongoDB Atlas | Cloud Database |
| Mongoose | ODM |

---

## DevOps

| Technology | Purpose |
|------------|----------|
| Docker | Containerization |
| Docker Compose | Multi-container Management |
| Docker Hub | Image Registry |
| Nginx | Static File Server & Reverse Proxy |
| AWS EC2 | Cloud Hosting |

---

# 🏗 High-Level Architecture

```text
                    +----------------------+
                    |      Web Browser     |
                    +----------+-----------+
                               |
                               |
                     HTTP / HTTPS Requests
                               |
                               |
                +--------------v---------------+
                |      React Frontend          |
                |      (Vite + Nginx)          |
                +--------------+---------------+
                               |
                      REST API Requests
                               |
                               |
                +--------------v---------------+
                |      Express Backend         |
                |      Node.js API Server      |
                +--------------+---------------+
                               |
                      Mongoose Queries
                               |
                               |
                +--------------v---------------+
                |      MongoDB Atlas           |
                |   Cloud NoSQL Database       |
                +------------------------------+
```

---

# ☁ Deployment Architecture

```text
                      Internet
                          │
                          │
                  Public IPv4 Address
                          │
                          ▼
                 AWS EC2 Ubuntu Instance
                          │
          ┌───────────────┴────────────────┐
          │                                │
          ▼                                ▼
   Frontend Container              Backend Container
   React + Nginx                   Node + Express
          │                                │
          └───────────────┬────────────────┘
                          │
                   Docker Network
                          │
                          ▼
                    MongoDB Atlas
```

---

# 🔄 Application Workflow

```text
User Opens Website
        │
        ▼
React Application Loads
        │
        ▼
User Logs In
        │
        ▼
JWT Generated
        │
        ▼
JWT Stored in Browser
        │
        ▼
User Starts Speaking
        │
        ▼
Speech Recognition Starts
        │
        ▼
Transcript Generated
        │
        ▼
Evaluation Algorithm
        │
        ▼
Accuracy + WPM Calculated
        │
        ▼
Results Saved
        │
        ▼
MongoDB Atlas
        │
        ▼
Dashboard Updated
        │
        ▼
Leaderboard Updated
```

---

# 📂 Project Folder Structure

```text
fluent-speech-trainer/
│
├── client/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── *.css
│   │
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   └── Score.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── speechRoutes.js
│   │   ├── scoreRoutes.js
│   │   └── uploadRoutes.js
│   │
│   ├── uploads/
│   ├── data/
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
│
├── README.md
│
└── .gitignore
```

---

# 📦 Project Modules

| Module | Description |
|----------|-------------|
| Authentication | User Signup/Login using JWT |
| Speech Recognition | Real-time speech processing |
| Tongue Twisters | Pronunciation practice |
| Paragraph Reading | Fluency practice |
| Dashboard | User analytics |
| Leaderboard | Global rankings |
| File Upload | Custom text practice |
| Score Engine | Accuracy & WPM calculation |
| Docker Deployment | Containerized application |
| Cloud Deployment | AWS EC2 + Docker Hub |

---

# 🎯 Design Principles

The application was designed with the following goals:

- Clean Architecture
- Modular Components
- Reusable Code
- Responsive Design
- Secure Authentication
- Scalable Deployment
- Cloud Native Infrastructure
- Production Ready
- Easy Maintenance
- Extensible Feature Set

---

# 💻 Local Development Setup

This section explains how to set up and run the Fluent Speech Trainer application on your local machine without Docker.

The project consists of two independent applications:

- **Frontend** – React + Vite
- **Backend** – Node.js + Express
- **Database** – MongoDB Atlas

---

# 📋 Prerequisites

Before running the project, make sure the following software is installed on your system.

| Software | Recommended Version |
|-----------|---------------------|
| Node.js | 20.x or later |
| npm | 10.x or later |
| Git | Latest |
| MongoDB Atlas Account | Required |
| VS Code | Recommended |

---

# 🔧 Verify Installation

Check whether Node.js and npm are installed.

```bash
node -v
```

Example

```text
v20.19.0
```

Check npm

```bash
npm -v
```

Example

```text
10.8.2
```

Check Git

```bash
git --version
```

---

# 📥 Clone Repository

Clone the project from GitHub.

```bash
git clone https://github.com/rajdeepgirkar/fluent-speech-trainer.git
```

Move into the project directory.

```bash
cd fluent-speech-trainer
```

Project structure

```text
fluent-speech-trainer/

├── client/
├── server/
├── docker-compose.yml
└── README.md
```

---

# 📦 Install Dependencies

The frontend and backend have separate dependencies.

## Backend

```bash
cd server
npm install
```

Example output

```text
added 200 packages
```

---

## Frontend

Open another terminal.

```bash
cd client
npm install
```

---

# 🔐 Environment Variables

The backend requires environment variables before starting.

Inside the **server** folder create a file named

```text
.env
```

Example

```env
MONGO_URI=<YOUR_MONGODB_ATLAS_CONNECTION_STRING>

PORT=5000

JWT_SECRET=<YOUR_SECRET_KEY>
```

Example

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/fluent

PORT=5000

JWT_SECRET=mySuperSecretJWTKey
```

> **⚠️ Never commit your `.env` file to GitHub.**  
> Ensure `.env` is included in `.gitignore`.

---

# ☁ MongoDB Atlas Setup

If you already have a MongoDB Atlas cluster, skip this section.

## Step 1

Create a MongoDB Atlas account.

https://www.mongodb.com/cloud/atlas

---

## Step 2

Create a new cluster.

Example

```text
Cluster0
```

---

## Step 3

Create a database user.

Example

```text
Username

speechUser
```

```text
Password

**********
```

---

## Step 4

Allow Network Access.

For development

```text
0.0.0.0/0
```

For production

```text
Only EC2 Public IP
```

---

## Step 5

Copy the connection string.

Example

```text
mongodb+srv://username:password@cluster.mongodb.net/database
```

Paste it inside

```text
server/.env
```

---

# ▶ Running the Backend

Move into the server folder.

```bash
cd server
```

Development mode

```bash
npm run dev
```

Output

```text
Server running on port 5000

MongoDB Connected

Fluent Speech Trainer API
```

Production mode

```bash
npm start
```

---

# ▶ Running the Frontend

Open another terminal.

```bash
cd client
```

Run

```bash
npm run dev
```

Output

```text
VITE v7.x.x

Local:

http://localhost:5173
```

Open

```text
http://localhost:5173
```

---

# 🌐 Default Application URLs

| Service | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |
| API Health | http://localhost:5000/api/health |

---

# 🧪 Testing Backend

Open your browser

```text
http://localhost:5000/api/health
```

Expected response

```json
{
  "status": "OK"
}
```

---

# 🔍 Testing Frontend

Open

```text
http://localhost:5173
```

You should see

- Home Page
- Login
- Signup
- Tongue Twisters
- Paragraph Practice
- Dashboard

---

# 👤 Create Your First User

Navigate to

```text
/signup
```

Fill in

- Name
- Email
- Password

Click

```text
Create Account
```

The application will

- Hash the password
- Save the user
- Generate JWT
- Log the user in

---

# 🔑 Login

Navigate to

```text
/ login
```

Enter

- Email
- Password

A JWT token is generated and stored in

```text
localStorage
```

Key

```text
sft_user
```

---

# 🎤 Test Speech Recognition

Navigate to

```text
Tongue Twister
```

Allow microphone access.

Click

```text
Start Practice
```

Speak the displayed sentence.

The application will

- Convert speech to text
- Compare with original text
- Highlight mistakes
- Calculate accuracy
- Calculate WPM
- Store score

---

# 📁 Upload Custom Text

Navigate to

```text
Custom Practice
```

Upload

```text
sample.txt
```

or paste your own content.

The application automatically creates a practice session.

---

# 📊 Dashboard

Navigate to

```text
Dashboard
```

The dashboard displays

- Average Accuracy
- Average WPM
- Best Accuracy
- Best WPM
- Recent Activity
- Performance History

---

# 🛠 Common Development Commands

## Install dependencies

Backend

```bash
cd server
npm install
```

Frontend

```bash
cd client
npm install
```

---

## Start Backend

```bash
npm run dev
```

---

## Start Frontend

```bash
npm run dev
```

---

## Production Backend

```bash
npm start
```

---

## Build Frontend

```bash
npm run build
```

---

## Preview Production Build

```bash
npm run preview
```

---

# 🧹 Clean Installation

If dependencies become corrupted.

Delete

```text
node_modules
```

Delete

```text
package-lock.json
```

Install again

```bash
npm install
```

---

# 🐞 Common Local Issues

## Port 5000 already in use

Find the process.

Windows

```bash
netstat -ano | findstr :5000
```

Linux

```bash
sudo lsof -i :5000
```

Kill the process.

---

## Port 5173 already in use

Stop the existing Vite server.

Or run

```bash
npm run dev -- --port 5174
```

---

## MongoDB Connection Failed

Check

- MongoDB Atlas Network Access
- Username
- Password
- Connection String
- Internet Connection

---

## JWT Authentication Failed

Verify

```env
JWT_SECRET
```

Restart backend after updating `.env`.

---

## Microphone Not Working

Ensure

- Browser permission is granted
- HTTPS is used in production
- Microphone is connected
- Browser supports Web Speech API

---

# ✅ Local Development Checklist

- Node.js Installed
- npm Installed
- Git Installed
- MongoDB Atlas Configured
- `.env` Created
- Backend Running
- Frontend Running
- MongoDB Connected
- User Registration Working
- Login Working
- Speech Recognition Working
- Dashboard Working
- Leaderboard Working

---

## 🎉 Congratulations!

Your Fluent Speech Trainer application is now running successfully in a local development environment without Docker.

---

# 🐳 Docker Deployment Guide

This section explains how to containerize, build, and deploy the Fluent Speech Trainer application using **Docker**, **Docker Compose**, **Docker Hub**, and **MongoDB Atlas**.

The application consists of two Docker containers:

- **Frontend Container**
  - React
  - Vite
  - Nginx

- **Backend Container**
  - Node.js
  - Express

MongoDB Atlas is hosted separately as a managed cloud database.

---

# 📦 Why Docker?

Docker allows the application to run in isolated containers, ensuring consistent behavior across development, testing, and production environments.

## Benefits

- Same environment everywhere
- Easy deployment
- No dependency conflicts
- Lightweight containers
- Fast deployment
- Easy updates
- Simple rollback
- Production-ready architecture

---

# 🏗 Docker Architecture

```text
                Docker Host
                     │
     ┌───────────────┴───────────────┐
     │                               │
     ▼                               ▼
Frontend Container             Backend Container
React + Nginx                  Node + Express
     │                               │
     └───────────────┬───────────────┘
                     │
             Docker Network
                     │
                     ▼
             MongoDB Atlas
```

---

# 📂 Docker Project Structure

```text
fluent-speech-trainer/

├── client/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── src/
│
├── server/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
│
├── docker-compose.yml
│
└── README.md
```

---

# 🐳 Frontend Dockerfile

Location

```text
client/Dockerfile
```

```dockerfile
# ---------- Stage 1 : Build ----------

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# ---------- Stage 2 : Production ----------

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx","-g","daemon off;"]
```

---

# 🔍 Frontend Dockerfile Explanation

### Stage 1

Uses Node.js to build the React application.

```dockerfile
FROM node:20-alpine AS builder
```

---

Creates the working directory.

```dockerfile
WORKDIR /app
```

---

Copies package files.

```dockerfile
COPY package*.json ./
```

---

Installs dependencies.

```dockerfile
RUN npm install
```

---

Copies the project.

```dockerfile
COPY . .
```

---

Builds the production bundle.

```dockerfile
RUN npm run build
```

This creates

```text
dist/
```

---

### Stage 2

Uses Nginx.

```dockerfile
FROM nginx:alpine
```

---

Copies React build files.

```dockerfile
COPY --from=builder /app/dist /usr/share/nginx/html
```

---

Copies custom Nginx configuration.

```dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

---

Exposes Port 80.

```dockerfile
EXPOSE 80
```

---

Starts Nginx.

```dockerfile
CMD ["nginx","-g","daemon off;"]
```

---

# 🌐 nginx.conf

Location

```text
client/nginx.conf
```

```nginx
server {

    listen 80;

    root /usr/share/nginx/html;

    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/api/ {
        rewrite ^/api/api/(.*)$ /api/$1 break;

        proxy_pass http://backend:5000;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /api/ {

        proxy_pass http://backend:5000;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

}
```

---

# 🔍 Nginx Reverse Proxy

Nginx serves two purposes.

## 1. Serve React Application

```text
Browser

↓

Nginx

↓

React Build
```

---

## 2. Proxy API Requests

```text
Browser

↓

/api

↓

Nginx

↓

backend:5000

↓

Express
```

This removes CORS issues and keeps the backend hidden from the public.

---

# 🐳 Backend Dockerfile

Location

```text
server/Dockerfile
```

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm","start"]
```

---

# 🔍 Backend Dockerfile Explanation

Creates Node.js container.

Installs dependencies.

Copies source code.

Exposes Port 5000.

Starts

```bash
npm start
```

---

# 🧱 Build Docker Images

From the project root.

## Backend

```bash
docker build -t rajdeep03/fluent-backend:latest ./server
```

---

## Frontend

```bash
docker build -t rajdeep03/fluent-frontend:latest ./client
```

---

# 🖼 Verify Images

```bash
docker images
```

Example

```text
REPOSITORY                     TAG       IMAGE ID

rajdeep03/fluent-backend       latest    xxxxxxxxx

rajdeep03/fluent-frontend      latest    xxxxxxxxx
```

---

# ▶ Run Containers Individually

Backend

```bash
docker run -d \
-p 5000:5000 \
--env-file server/.env \
rajdeep03/fluent-backend:latest
```

Frontend

```bash
docker run -d \
-p 80:80 \
rajdeep03/fluent-frontend:latest
```

---

# 🐳 Docker Compose

Instead of managing multiple containers manually, Docker Compose manages the complete application.

---

# docker-compose.yml

```yaml
services:

  backend:

    image: rajdeep03/fluent-backend:latest

    container_name: fluent-backend

    env_file:
      - .env

    restart: unless-stopped

    ports:
      - "5000:5000"

  frontend:

    image: rajdeep03/fluent-frontend:latest

    container_name: fluent-frontend

    depends_on:
      - backend

    restart: unless-stopped

    ports:
      - "80:80"
```

---

# 🔍 Docker Compose Explanation

## backend

Starts Express server.

Loads environment variables.

Restarts automatically.

---

## frontend

Starts Nginx.

Serves React.

Depends on backend.

Maps

```text
80 → 80
```

---

# ▶ Docker Compose Commands

Start containers

```bash
docker compose up
```

Detached mode

```bash
docker compose up -d
```

---

Stop

```bash
docker compose down
```

---

Restart

```bash
docker compose restart
```

---

View logs

```bash
docker compose logs
```

---

View logs continuously

```bash
docker compose logs -f
```

---

Container status

```bash
docker compose ps
```

---

List containers

```bash
docker ps
```

---

# 📦 Docker Hub

Docker Hub stores container images online.

Repository

```text
rajdeep03/fluent-backend

rajdeep03/fluent-frontend
```

---

# 🔑 Login

```bash
docker login
```

---

# 🏷 Tag Images

```bash
docker tag fluent-backend rajdeep03/fluent-backend:latest

docker tag fluent-frontend rajdeep03/fluent-frontend:latest
```

---

# ☁ Push Images

Backend

```bash
docker push rajdeep03/fluent-backend:latest
```

Frontend

```bash
docker push rajdeep03/fluent-frontend:latest
```

---

# 🌍 Pull Images

Any machine can download the images.

Backend

```bash
docker pull rajdeep03/fluent-backend:latest
```

Frontend

```bash
docker pull rajdeep03/fluent-frontend:latest
```

---

# 🔄 Updating the Application

Whenever code changes.

## Step 1

Rebuild

```bash
docker build -t rajdeep03/fluent-backend:latest ./server

docker build -t rajdeep03/fluent-frontend:latest ./client
```

---

## Step 2

Push

```bash
docker push rajdeep03/fluent-backend:latest

docker push rajdeep03/fluent-frontend:latest
```

---

## Step 3

On EC2

```bash
docker pull rajdeep03/fluent-backend:latest

docker pull rajdeep03/fluent-frontend:latest
```

---

## Step 4

Restart containers

```bash
docker compose up -d --force-recreate
```

---

# 📊 Docker Networking

Docker Compose automatically creates an internal network.

```text
Frontend

↓

backend:5000

↓

Express API
```

The frontend communicates with the backend using the service name:

```text
backend
```

instead of

```text
localhost
```

---

# 🔍 Verify Deployment

Check running containers.

```bash
docker ps
```

View logs.

```bash
docker compose logs
```

Inspect images.

```bash
docker images
```

Check Docker version.

```bash
docker --version
```

Check Compose version.

```bash
docker compose version
```

---

# 🧹 Docker Cleanup

Stop containers

```bash
docker compose down
```

Remove unused images

```bash
docker image prune
```

Remove unused containers

```bash
docker container prune
```

Remove everything unused

```bash
docker system prune -a
```

---

# ✅ Docker Deployment Checklist

- Docker Installed
- Docker Compose Installed
- Frontend Dockerfile Created
- Backend Dockerfile Created
- Nginx Configured
- Images Built Successfully
- Images Tagged
- Images Pushed to Docker Hub
- Containers Running
- MongoDB Atlas Connected
- React Accessible
- Backend API Accessible
- Docker Networking Working

---

## 🎉 Congratulations!

Your application is now fully containerized and ready to be deployed on any machine that supports Docker.

In the next section, you'll deploy these Docker images to an **AWS EC2 Ubuntu instance**, configure Docker on the server, pull images from Docker Hub, and run the application in a production environment.

---

# ☁️ AWS EC2 Deployment Guide (Production Deployment)

This section explains how to deploy the **Fluent Speech Trainer** application on an **AWS EC2 Ubuntu instance** using **Docker**, **Docker Compose**, **Docker Hub**, **MongoDB Atlas**, and **Nginx**.

By the end of this guide, your application will be accessible from the internet through your EC2 public IP.

---

# 📖 Deployment Overview

Deployment architecture:

```text
                    Internet
                         │
                         ▼
                 AWS EC2 Ubuntu Server
                         │
                 Docker Compose
          ┌──────────────┴──────────────┐
          │                             │
          ▼                             ▼
Frontend Container              Backend Container
 React + Nginx                 Node.js + Express
          │                             │
          └──────────────┬──────────────┘
                         │
                    Docker Network
                         │
                         ▼
                   MongoDB Atlas
```

---

# 📋 Prerequisites

Before deployment, ensure you have:

- AWS Account
- Docker Images pushed to Docker Hub
- MongoDB Atlas Cluster
- Docker Installed locally
- GitHub Repository
- SSH Key Pair (.pem)

---

# Step 1 — Create an AWS EC2 Instance

Login to AWS Console.

Navigate to

```text
EC2 Dashboard
```

Click

```text
Launch Instance
```

---

## Configure Instance

| Setting | Value |
|----------|------|
| Name | fluent-speech-trainer |
| AMI | Ubuntu Server 24.04 LTS |
| Instance Type | t2.micro (Free Tier) |
| Key Pair | Create New |
| Storage | 8 GB |
| Network | Default VPC |

---

# Step 2 — Create a Key Pair

Choose

```text
RSA
```

Private key format

```text
.pem
```

Download

```text
fluent-key.pem
```

Store it safely.

Never upload this key to GitHub.

---

# Step 3 — Configure Security Group

Allow the following inbound rules.

| Type | Port | Source |
|------|------|--------|
| SSH | 22 | My IP |
| HTTP | 80 | Anywhere |
| HTTPS | 443 | Anywhere |
| Custom TCP | 5000 *(Optional)* | Anywhere |

> **Note:** Port **5000** is only required for testing. Once Nginx is configured as a reverse proxy, it is recommended to remove this rule and keep only ports **22**, **80**, and **443** open.

---

# Step 4 — Launch Instance

Click

```text
Launch Instance
```

Wait until

```text
Running
```

---

# Step 5 — Connect via SSH

Locate

```text
Public IPv4 Address
```

Example

```text
54.xxx.xxx.xxx
```

Open PowerShell or Terminal.

Navigate to the folder containing the `.pem` file.

Windows

```powershell
cd "C:\Users\<USERNAME>\Downloads"
```

Linux/macOS

```bash
cd ~/Downloads
```

---

## Connect

```bash
ssh -i fluent-key.pem ubuntu@<PUBLIC-IP>
```

Example

```bash
ssh -i fluent-key.pem ubuntu@54.210.xxx.xxx
```

Successful login

```text
Welcome to Ubuntu
ubuntu@ip-172-31-xx-xx:~$
```

---

# Step 6 — Update Ubuntu

```bash
sudo apt update
sudo apt upgrade -y
```

---

# Step 7 — Install Docker

Download installation script

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
```

Install Docker

```bash
sudo sh get-docker.sh
```

Verify installation

```bash
docker --version
```

Example

```text
Docker version 28.x.x
```

---

# Step 8 — Add User to Docker Group

Without this step, every Docker command requires `sudo`.

```bash
sudo usermod -aG docker $USER
```

Refresh the group.

```bash
newgrp docker
```

Verify

```bash
docker ps
```

No permission errors should appear.

---

# Step 9 — Verify Docker Compose

```bash
docker compose version
```

Example

```text
Docker Compose version v2.x.x
```

---

# Step 10 — Create Project Directory

```bash
mkdir fluent-speech
```

Move into it

```bash
cd fluent-speech
```

---

# Step 11 — Create Environment File

```bash
nano .env
```

Example

```env
MONGO_URI=<YOUR_MONGODB_ATLAS_CONNECTION_STRING>

PORT=5000

JWT_SECRET=<YOUR_SECRET_KEY>
```

Save

```text
CTRL + O

ENTER

CTRL + X
```

---

# Step 12 — Create docker-compose.yml

```bash
nano docker-compose.yml
```

Paste

```yaml
services:

  backend:

    image: rajdeep03/fluent-backend:latest

    container_name: fluent-backend

    env_file:
      - .env

    restart: unless-stopped

    ports:
      - "5000:5000"

  frontend:

    image: rajdeep03/fluent-frontend:latest

    container_name: fluent-frontend

    depends_on:
      - backend

    restart: unless-stopped

    ports:
      - "80:80"
```

Save and exit.

---

# Step 13 — Pull Docker Images

Backend

```bash
docker pull rajdeep03/fluent-backend:latest
```

Frontend

```bash
docker pull rajdeep03/fluent-frontend:latest
```

Verify

```bash
docker images
```

Expected

```text
rajdeep03/fluent-backend

rajdeep03/fluent-frontend
```

---

# Step 14 — Start Containers

```bash
docker compose up -d
```

Verify

```bash
docker ps
```

Example

```text
CONTAINER ID

fluent-backend

fluent-frontend
```

---

# Step 15 — Verify Backend Logs

```bash
docker compose logs backend
```

Expected

```text
MongoDB Connected

Server running on port 5000
```

---

# Step 16 — Verify Frontend Logs

```bash
docker compose logs frontend
```

Expected

```text
nginx started
```

---

# Step 17 — Test Backend

SSH into the server and run

```bash
curl http://localhost:5000/api/health
```

Expected

```json
{
    "status":"OK"
}
```

---

# Step 18 — Open the Application

Open your browser.

```text
http://<EC2-PUBLIC-IP>
```

Example

```text
http://54.xxx.xxx.xxx
```

The Fluent Speech Trainer homepage should load.

---

# Step 19 — Verify Application

Test

- User Registration
- Login
- Tongue Twisters
- Paragraph Reading
- Dashboard
- Leaderboard
- Speech Recognition
- File Upload

---

# Step 20 — Verify MongoDB Atlas

Login to MongoDB Atlas.

Check

```text
Collections

↓

Users

Scores
```

New users and scores should appear after using the application.

---

# Updating the Application

Whenever code changes.

---

## Local Machine

Rebuild images

```bash
docker build -t rajdeep03/fluent-backend:latest ./server

docker build -t rajdeep03/fluent-frontend:latest ./client
```

Push

```bash
docker push rajdeep03/fluent-backend:latest

docker push rajdeep03/fluent-frontend:latest
```

---

## EC2 Server

Pull

```bash
docker pull rajdeep03/fluent-backend:latest

docker pull rajdeep03/fluent-frontend:latest
```

Restart

```bash
docker compose up -d --force-recreate
```

---

# Useful Docker Commands

Running containers

```bash
docker ps
```

Images

```bash
docker images
```

Logs

```bash
docker compose logs
```

Live logs

```bash
docker compose logs -f
```

Restart

```bash
docker compose restart
```

Stop

```bash
docker compose down
```

Shell inside frontend

```bash
docker exec -it fluent-frontend sh
```

Shell inside backend

```bash
docker exec -it fluent-backend sh
```

---

# Troubleshooting

## SSH Timeout

Check

- Instance is running
- Security Group allows port 22
- Correct public IP
- Correct `.pem` file permissions

---

## Docker Permission Denied

Run

```bash
sudo usermod -aG docker $USER

newgrp docker
```

---

## MongoDB Connection Failed

Verify

- Atlas connection string
- Username/password
- Network Access (IP whitelist)

---

## Frontend Loads but API Fails

Check

```bash
docker compose logs frontend

docker compose logs backend
```

Verify `nginx.conf` and ensure API requests are proxied correctly to the backend container.

---

## Containers Exit Immediately

Inspect logs

```bash
docker compose logs
```

---

## Recreate Containers

```bash
docker compose down

docker compose up -d --force-recreate
```

---

# Production Recommendations

- Remove port **5000** from the backend after verifying deployment.
- Expose only ports **80** and **443** publicly.
- Configure a custom domain.
- Enable HTTPS using **Let's Encrypt** and **Certbot**.
- Set up automated deployments using **GitHub Actions**.
- Regularly update Docker images and system packages.

---

# Deployment Checklist

- AWS EC2 Created
- Ubuntu Installed
- Security Group Configured
- Docker Installed
- Docker Compose Installed
- Docker Hub Images Pulled
- `.env` Configured
- Docker Compose Running
- Backend Connected to MongoDB Atlas
- Frontend Accessible
- Nginx Reverse Proxy Working
- Application Successfully Deployed

---

## 🎉 Congratulations!

Your **Fluent Speech Trainer** is now running as a production-ready application on **AWS EC2** using:

- ✅ Docker
- ✅ Docker Compose
- ✅ Docker Hub
- ✅ MongoDB Atlas
- ✅ Nginx Reverse Proxy
- ✅ AWS EC2 Ubuntu Server

You now have a cloud-hosted MERN application that can be accessed from anywhere through your EC2 public IP.


---

# 📚 API Documentation, Authentication Flow, Speech Recognition & Scoring Engine

This section explains the complete backend API, authentication process, speech recognition workflow, and the scoring algorithm used in **Fluent Speech Trainer**.

---

# 📌 API Overview

The backend is built using **Node.js** and **Express.js** and exposes RESTful APIs for:

- User Authentication
- User Profile
- Tongue Twisters
- Reading Paragraphs
- Speech Scoring
- Dashboard Analytics
- Leaderboard
- File Upload
- Health Check

Base URL (Development)

```text
http://localhost:5000
```

Base URL (Production)

```text
http://<EC2_PUBLIC_IP>
```

---

# API Architecture

```text
React Application

        │
        │ Axios
        ▼

Express Router

        │

───────────────

Auth Routes

Speech Routes

Score Routes

Upload Routes

───────────────

        │

Controllers

        │

Models

        │

MongoDB Atlas
```

---

# Authentication

The application uses **JWT (JSON Web Token)** authentication.

---

## Authentication Workflow

```text
User

↓

Signup

↓

Password Hashing

↓

MongoDB

↓

JWT Generated

↓

Returned to Client

↓

Stored in localStorage

↓

Every API Request

↓

Authorization Header

↓

JWT Verification

↓

Protected Route Access
```

---

# Password Encryption

Passwords are **never stored in plain text**.

During registration:

```text
Password

↓

bcrypt.hash()

↓

Hashed Password

↓

MongoDB
```

Example

```text
password123

↓

$2b$10$O4....

```

---

# JWT Authentication

After login

Backend returns

```json
{
    "token":"JWT_TOKEN",
    "user":{
        "name":"Rajdeep",
        "email":"rajdeep@example.com"
    }
}
```

Stored in browser

```text
localStorage

↓

sft_user
```

---

# Axios Configuration

The frontend automatically attaches the JWT token.

```javascript
API.interceptors.request.use((config) => {

    const userInfo = localStorage.getItem("sft_user");

    if(userInfo){

        const { token } = JSON.parse(userInfo);

        config.headers.Authorization =
            `Bearer ${token}`;

    }

    return config;

});
```

Every authenticated request includes

```http
Authorization: Bearer JWT_TOKEN
```

---

# Protected Routes

Protected APIs require JWT.

Example

```text
POST /api/score

GET /api/score/dashboard

DELETE /api/score/:id
```

---

# API Endpoints

---

## Health Check

### GET

```http
/api/health
```

Purpose

Verify backend availability.

Response

```json
{
    "status":"OK"
}
```

---

# Authentication APIs

---

## Signup

### POST

```http
/api/auth/signup
```

Body

```json
{
    "name":"Rajdeep",

    "email":"rajdeep@example.com",

    "password":"Password123"
}
```

Response

```json
{
    "token":"JWT_TOKEN",

    "user":{
        "id":"...",

        "name":"Rajdeep",

        "email":"rajdeep@example.com"
    }
}
```

---

## Login

### POST

```http
/api/auth/login
```

Body

```json
{
    "email":"rajdeep@example.com",

    "password":"Password123"
}
```

Response

```json
{
    "token":"JWT_TOKEN",

    "user":{

    }
}
```

---

# Tongue Twister APIs

---

## Get Categories

### GET

```http
/api/twisters/categories
```

Response

```json
[
    "communication",

    "pronunciation",

    "articulation"
]
```

---

## Random Practice Session

### GET

```http
/api/twisters/session
```

Query Parameters

```text
category=communication

count=5
```

Example

```http
/api/twisters/session?category=communication&count=5
```

---

# Paragraph APIs

---

## Random Paragraph

### GET

```http
/api/paragraphs/random
```

Parameters

```text
difficulty=easy
```

Example

```http
/api/paragraphs/random?difficulty=medium
```

---

# Upload APIs

---

## Upload TXT File

### POST

```http
/api/upload
```

Request

```text
multipart/form-data
```

Field

```text
file
```

Supported

- TXT

Response

```json
{
    "text":"Uploaded content..."
}
```

---

# Score APIs

---

## Save Score

### POST

```http
/api/score
```

Requires Authentication

Example

```json
{

    "accuracy":97,

    "wpm":118,

    "module":"Tongue Twister",

    "text":"She sells sea shells",

    "spokenText":"She sells sea shells"

}
```

Response

```json
{
    "message":"Saved Successfully"
}
```

---

## Dashboard

### GET

```http
/api/score/dashboard
```

Response

```json
{

    "averageAccuracy":95,

    "averageWPM":112,

    "bestAccuracy":100,

    "bestWPM":125

}
```

---

## Activity History

### GET

```http
/api/score/history
```

---

## Delete Activity

### DELETE

```http
/api/score/:id
```

---

## Leaderboard

### GET

```http
/api/score/leaderboard
```

Returns

- Username

- Accuracy

- WPM

- Rank

---

# HTTP Status Codes

| Code | Meaning |
|------|----------|
|200|Success|
|201|Created|
|400|Bad Request|
|401|Unauthorized|
|404|Not Found|
|500|Internal Server Error|

---

# Speech Recognition

The application uses the browser's **Web Speech API**.

---

## Speech Recognition Flow

```text
User Clicks Start

↓

Browser Requests Microphone

↓

SpeechRecognition Starts

↓

Voice Captured

↓

Speech Converted To Text

↓

Transcript Updated

↓

Compared With Original

↓

Scoring Algorithm

↓

Dashboard Updated
```

---

# Browser APIs Used

| API | Purpose |
|------|----------|
|SpeechRecognition|Speech to Text|
|MediaRecorder|Audio Recording|
|MediaDevices|getUserMedia()|

---

# Live Transcript

As the user speaks

```text
Original

The quick brown fox

↓

Transcript

The quick brown fox
```

Words are updated continuously.

---

# Live Word Highlighting

Correct

```text
🟢 green
```

Incorrect

```text
🔴 red
```

Current Word

```text
🟡 yellow
```

This provides instant feedback.

---

# Audio Recording

The application records speech using

```javascript
MediaRecorder
```

Workflow

```text
Microphone

↓

Audio Stream

↓

Chunks

↓

Blob

↓

Download
```

---

# Scoring Engine

The scoring engine compares

Original Text

with

Spoken Text

---

# Comparison Workflow

```text
Original Text

↓

Tokenization

↓

Spoken Text

↓

Word Comparison

↓

Statistics

↓

Score
```

---

# Metrics Calculated

The application calculates

- Accuracy
- Correct Words
- Incorrect Words
- Missed Words
- Extra Words
- Total Words
- Speaking Duration
- Words Per Minute

---

# Accuracy Formula

```text
Accuracy

=

Correct Words

───────────────

Original Words

×

100
```

Example

Original

```text
20 words
```

Correct

```text
18 words
```

Accuracy

```text
90%
```

---

# WPM Formula

```text
Words Per Minute

=

Words Spoken

────────────

Minutes
```

Example

```text
120 words

1 minute

↓

120 WPM
```

---

# Dashboard Analytics

The dashboard calculates

- Average Accuracy
- Average WPM
- Best Accuracy
- Best WPM
- Activity Count
- Recent Sessions
- Performance History

---

# Leaderboard

Scores are sorted using

```text
Highest Accuracy

↓

Highest WPM

↓

Newest Score
```

---

# Database Models

---

## User

Stores

- Name
- Email
- Password
- Created Date

---

## Score

Stores

- User ID
- Accuracy
- WPM
- Module
- Original Text
- Spoken Text
- Timestamp

---

# Data Flow

```text
User

↓

React

↓

Axios

↓

Express

↓

Authentication Middleware

↓

Controller

↓

Mongoose

↓

MongoDB Atlas

↓

Response

↓

React UI
```

---

# Security Features

- JWT Authentication
- Password Hashing
- Protected Routes
- Environment Variables
- MongoDB Authentication
- Input Validation
- Secure File Upload Handling

---

# Error Handling

The backend returns meaningful JSON responses.

Example

```json
{
    "message":"Invalid Credentials"
}
```

Example

```json
{
    "message":"Unauthorized"
}
```

Example

```json
{
    "message":"Validation Failed"
}
```

---

# API Testing

Recommended tools

- Postman
- Thunder Client
- Insomnia

Example

```http
POST

/api/auth/login
```

Headers

```text
Content-Type

application/json
```

---

# Performance Considerations

- Stateless JWT Authentication
- MongoDB Indexing
- Dockerized Backend
- Reverse Proxy using Nginx
- Lightweight Alpine Images
- Efficient Axios Communication
- Browser-side Speech Recognition
- Cloud Database

---

# Summary

The backend follows a modular REST architecture with secure JWT authentication, browser-based speech recognition, and a scoring engine that evaluates pronunciation practice in real time. Scores are stored in MongoDB Atlas and visualized through dashboards and leaderboards, providing users with continuous feedback on their speaking performance.

---

# 🛠 Troubleshooting, Updating the Application, CI/CD, Future Enhancements & License

This section covers common deployment issues, maintenance procedures, updating the application, continuous deployment concepts, future improvements, and licensing information.

---

# 🛠 Troubleshooting Guide

This section lists the most common issues encountered during local development, Docker deployment, and AWS EC2 hosting, along with their solutions.

---

# Docker Issues

## Docker Command Not Found

### Error

```text
docker: command not found
```

### Solution

Verify Docker installation.

```bash
docker --version
```

If Docker is not installed, install Docker.

Ubuntu

```bash
curl -fsSL https://get.docker.com -o get-docker.sh

sudo sh get-docker.sh
```

Windows

Install Docker Desktop.

---

## Permission Denied While Running Docker

### Error

```text
permission denied while trying to connect to Docker daemon
```

### Solution

Add the current user to the Docker group.

```bash
sudo usermod -aG docker $USER
```

Reload the group.

```bash
newgrp docker
```

Verify.

```bash
docker ps
```

---

## Docker Compose Not Found

### Error

```text
docker-compose: command not found
```

### Solution

Use the newer Docker Compose syntax.

```bash
docker compose version
```

Instead of

```bash
docker-compose
```

use

```bash
docker compose
```

---

# AWS EC2 Issues

## SSH Connection Timeout

### Error

```text
ssh: connect to host ... port 22: Connection timed out
```

### Possible Causes

- EC2 instance stopped
- Wrong public IP
- Port 22 blocked
- Incorrect security group

### Solution

Verify

- Instance is running
- Correct public IP
- Security Group allows SSH (Port 22)
- Internet Gateway is attached

---

## Invalid PEM File Permissions

### Error

```text
WARNING: UNPROTECTED PRIVATE KEY FILE!
```

### Windows Solution

Remove inherited permissions.

Allow access only to your user account.

### Linux/macOS Solution

```bash
chmod 400 fluent-key.pem
```

Reconnect.

```bash
ssh -i fluent-key.pem ubuntu@<PUBLIC-IP>
```

---

# MongoDB Atlas Issues

## Connection Failed

### Error

```text
MongoServerSelectionError
```

### Verify

- Username
- Password
- Cluster running
- Connection string
- Network Access

---

## Network Access Denied

Atlas only accepts requests from approved IP addresses.

Development

```text
0.0.0.0/0
```

Production

Whitelist only the EC2 public IP.

---

# React Issues

## Blank Screen

Possible reasons

- Build failed
- Missing assets
- Incorrect Nginx configuration
- React Router not configured

Check

```bash
docker compose logs frontend
```

---

## React Refreshes Return 404

Example

```text
http://IP/dashboard
```

Returns

```text
404
```

Solution

Configure Nginx.

```nginx
location / {

    try_files $uri /index.html;

}
```

---

# Backend Issues

## API Returning 404

Check

```bash
docker compose logs backend
```

Verify

```text
/api/*
```

routes exist.

---

## MongoDB Connected but API Fails

Verify

- Route registration
- Middleware
- JWT validation
- Controller logic

---

# Frontend Cannot Reach Backend

Symptoms

- Login fails
- Signup fails
- Dashboard empty

Verify

Nginx proxy.

```nginx
location /api/ {

    proxy_pass http://backend:5000;

}
```

Ensure the frontend uses relative API URLs (for example, `/api`) in production.

---

# Speech Recognition Issues

## Microphone Permission Denied

Allow browser microphone access.

Chrome

Settings

↓

Privacy

↓

Microphone

---

## Speech Recognition Stops Automatically

Some browsers stop recognition after silence.

Restart recognition when

```javascript
onend
```

fires.

---

## Speech Recognition Unsupported

Supported browsers

- Google Chrome
- Microsoft Edge

Limited support

- Firefox
- Safari

---

# File Upload Issues

Ensure uploaded files are

```text
TXT
```

Maximum size should match the Multer configuration.

---

# Useful Docker Commands

Running containers

```bash
docker ps
```

All containers

```bash
docker ps -a
```

Docker images

```bash
docker images
```

View logs

```bash
docker compose logs
```

Follow logs

```bash
docker compose logs -f
```

Restart services

```bash
docker compose restart
```

Stop services

```bash
docker compose down
```

Remove unused resources

```bash
docker system prune -a
```

---

# Updating the Application

Whenever changes are made to the project, rebuild the Docker images, push them to Docker Hub, and redeploy on the EC2 instance.

---

## Step 1 — Modify Source Code

Make changes in either

```text
client/
```

or

```text
server/
```

Commit changes.

```bash
git add .

git commit -m "Updated application"

git push origin main
```

---

## Step 2 — Build New Images

Backend

```bash
docker build -t rajdeep03/fluent-backend:latest ./server
```

Frontend

```bash
docker build -t rajdeep03/fluent-frontend:latest ./client
```

---

## Step 3 — Push Images to Docker Hub

Backend

```bash
docker push rajdeep03/fluent-backend:latest
```

Frontend

```bash
docker push rajdeep03/fluent-frontend:latest
```

---

## Step 4 — Update EC2

Connect to the server.

```bash
ssh -i fluent-key.pem ubuntu@<PUBLIC-IP>
```

Move to the project directory.

```bash
cd fluent-speech
```

Pull updated images.

```bash
docker pull rajdeep03/fluent-backend:latest

docker pull rajdeep03/fluent-frontend:latest
```

Restart the application.

```bash
docker compose up -d --force-recreate
```

Verify.

```bash
docker ps
```

---

# Backup Strategy

Although MongoDB Atlas stores the application data, it is recommended to back up important configuration files.

Suggested backups

- `.env`
- `docker-compose.yml`
- `nginx.conf`
- Source Code Repository

MongoDB Atlas also provides automated cloud backups on supported plans.

---

# CI/CD Overview

Continuous Integration and Continuous Deployment (CI/CD) automate the build and deployment process whenever new code is pushed to GitHub.

---

# Recommended CI/CD Workflow

```text
Developer

        │

git push

        │

GitHub Repository

        │

GitHub Actions

        │

Build Docker Images

        │

Push Images to Docker Hub

        │

SSH into EC2

        │

Pull Latest Images

        │

Restart Docker Compose

        │

Production Updated
```

---

# GitHub Actions (Future Enhancement)

A GitHub Actions workflow can automate the following:

- Install dependencies
- Run linting and tests
- Build frontend and backend Docker images
- Push images to Docker Hub
- Connect to EC2 using SSH
- Pull the latest images
- Restart Docker Compose

This removes the need to manually deploy updates after every code change.

---

# Security Recommendations

For production deployments:

- Store secrets only in `.env`
- Never commit `.env` files to GitHub
- Use strong JWT secrets
- Restrict MongoDB Atlas IP access
- Remove unnecessary open ports
- Enable HTTPS using Let's Encrypt
- Keep Docker images updated
- Regularly update Ubuntu packages

---

# Performance Optimizations

Recommended improvements:

- Enable Nginx compression (Gzip)
- Use browser caching
- Compress frontend assets
- Optimize MongoDB queries
- Add indexes for frequently queried collections
- Implement rate limiting on APIs
- Use a CDN for static assets
- Monitor application logs

---

# Future Enhancements

The project can be extended with several additional features.

## Authentication

- Google OAuth
- GitHub Login
- Forgot Password
- Email Verification
- Two-Factor Authentication

---

## Speech Analysis

- AI-based pronunciation scoring
- Grammar correction
- Accent detection
- Emotion analysis
- Confidence score
- Pause analysis
- Filler word detection

---

## Dashboard

- Monthly reports
- Weekly analytics
- Progress graphs
- Achievement badges
- Learning streaks

---

## Learning Modules

- Interview preparation
- Public speaking practice
- Debate exercises
- Presentation mode
- Vocabulary builder

---

## Cloud Features

- Custom domain
- HTTPS support
- AWS Load Balancer
- Auto Scaling
- CloudWatch monitoring
- S3 for file storage

---

## Mobile Support

- React Native application
- Offline practice mode
- Push notifications

---

# Project Highlights

- MERN Stack Architecture
- JWT Authentication
- Real-Time Speech Recognition
- Speech Performance Evaluation
- MongoDB Atlas Integration
- Dockerized Deployment
- Docker Hub Image Distribution
- AWS EC2 Hosting
- Nginx Reverse Proxy
- Responsive User Interface
- Dashboard Analytics
- Leaderboard
- Cloud-Native Deployment

---

# Learning Outcomes

This project demonstrates practical knowledge of:

- Full-Stack Web Development
- REST API Design
- Authentication and Authorization
- MongoDB Database Design
- React Development
- Express.js Development
- Docker Containerization
- Docker Compose
- Reverse Proxy Configuration
- Cloud Deployment on AWS
- Environment Variable Management
- Production Deployment Practices

---

# Contributing

Contributions are welcome.

To contribute:

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/new-feature
```

3. Commit your changes.

```bash
git commit -m "Add new feature"
```

4. Push the branch.

```bash
git push origin feature/new-feature
```

5. Open a Pull Request.

---

# License

This project is licensed under the **MIT License**.

You are free to:

- Use
- Modify
- Distribute
- Fork

the project under the terms of the MIT License.

---

# Author

**Rajdeep Girkar**

GitHub

```text
https://github.com/rajdeepgirkar
```

Docker Hub

```text
https://hub.docker.com/u/rajdeep03
```

---

# Acknowledgements

This project makes use of the following technologies and services:

- React
- Vite
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- bcrypt
- Axios
- Docker
- Docker Compose
- Docker Hub
- Nginx
- AWS EC2
- Web Speech API
- MediaRecorder API

---

# Final Summary

**Fluent Speech Trainer** is a complete, cloud-ready MERN stack application that demonstrates modern full-stack development and deployment practices. It combines React, Node.js, Express, and MongoDB Atlas with Docker containerization and AWS EC2 hosting to deliver a scalable speech training platform. Features such as JWT authentication, real-time speech recognition, automated speech scoring, analytics dashboards, and production-ready deployment provide a comprehensive learning resource for building and deploying enterprise-grade web applications.
