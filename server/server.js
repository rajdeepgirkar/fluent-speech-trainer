/**
 * Fluent Speech Trainer — Express.js Server
 * ==========================================
 * MERN Stack Backend with JWT Auth + MongoDB
 *
 * Run: npm run dev  (nodemon)
 * Run: npm start    (production)
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ─── API Routes ───────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const speechRoutes = require('./routes/speechRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', speechRoutes);         // /api/twisters, /api/paragraphs
app.use('/api/score', scoreRoutes);     // /api/score (protected)
app.use('/api/upload', uploadRoutes);   // /api/upload

// ─── Health Check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    wpmTargets: { slow: 50, medium: 100, fast: 150 },
  });
});

// ─── Error Handler ────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start Server ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🎤  Fluent Speech Trainer API — http://localhost:${PORT}`);
  console.log(`    Auth:     POST /api/auth/signup, /api/auth/login`);
  console.log(`    Content:  GET  /api/twisters, /api/paragraphs`);
  console.log(`    Scores:   POST /api/score, GET /api/score/dashboard`);
  console.log(`    Upload:   POST /api/upload`);
  console.log(`    Health:   GET  /api/health`);
});
