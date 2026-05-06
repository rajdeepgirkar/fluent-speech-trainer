const express = require('express');
const Score = require('../models/Score');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All score routes are protected — user must be logged in
router.use(protect);

// ──────────────────────────────────────────────────
// POST /api/score
// Save a new score (protected)
// ──────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { module, accuracy, wpm, speedSetting, speedFeedback, details } =
      req.body;

    if (!module || accuracy === undefined) {
      return res
        .status(400)
        .json({ error: 'Module and accuracy are required' });
    }

    const score = await Score.create({
      userId: req.user._id,
      username: req.user.name,
      module,
      accuracy: Math.round(accuracy * 100) / 100,
      wpm: Math.round((wpm || 0) * 10) / 10,
      speedSetting: speedSetting || 'medium',
      speedFeedback: speedFeedback || '',
      details: details || {},
    });

    res.status(201).json({
      success: true,
      id: score._id,
    });
  } catch (error) {
    console.error('Save score error:', error.message);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

// ──────────────────────────────────────────────────
// GET /api/score
// Get current user's score history (last 20)
// ──────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const scores = await Score.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      history: scores,
      username: req.user.name,
    });
  } catch (error) {
    console.error('Get scores error:', error.message);
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

// ──────────────────────────────────────────────────
// GET /api/score/dashboard
// Get aggregated dashboard stats for current user
// ──────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all scores for this user
    const userScores = await Score.find({ userId }).sort({ createdAt: -1 });

    if (userScores.length === 0) {
      return res.json({
        username: req.user.name,
        totalSessions: 0,
        avgAccuracy: 0,
        bestAccuracy: 0,
        avgWpm: 0,
        bestWpm: 0,
        modules: {},
        recent: [],
        streak: 0,
        rank: null,
        feedbackDist: { Optimal: 0, 'Too Slow': 0, 'Too Fast': 0 },
        totalUsers: 0,
      });
    }

    // Calculate basic stats
    const accuracies = userScores.map((s) => s.accuracy);
    const wpms = userScores.filter((s) => s.wpm > 0).map((s) => s.wpm);

    const avgAccuracy =
      Math.round(
        (accuracies.reduce((a, b) => a + b, 0) / accuracies.length) * 10
      ) / 10;
    const bestAccuracy = Math.round(Math.max(...accuracies) * 10) / 10;
    const avgWpm = wpms.length
      ? Math.round((wpms.reduce((a, b) => a + b, 0) / wpms.length) * 10) / 10
      : 0;
    const bestWpm = wpms.length
      ? Math.round(Math.max(...wpms) * 10) / 10
      : 0;

    // Module breakdown
    const modules = {};
    userScores.forEach((s) => {
      const mod = s.module || 'unknown';
      if (!modules[mod]) {
        modules[mod] = { count: 0, totalAccuracy: 0 };
      }
      modules[mod].count++;
      modules[mod].totalAccuracy += s.accuracy;
    });
    Object.keys(modules).forEach((mod) => {
      modules[mod].avgAccuracy =
        Math.round((modules[mod].totalAccuracy / modules[mod].count) * 10) / 10;
      delete modules[mod].totalAccuracy;
    });

    // Calculate streak (consecutive days with a score)
    const uniqueDates = [
      ...new Set(
        userScores.map((s) => s.createdAt.toISOString().slice(0, 10))
      ),
    ].sort((a, b) => (a > b ? -1 : 1));

    let streak = 0;
    const today = new Date();
    let checkDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    for (const d of uniqueDates) {
      const scoreDate = new Date(d + 'T00:00:00');
      if (scoreDate.getTime() === checkDate.getTime()) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Global rank by best accuracy
    const allScores = await Score.aggregate([
      {
        $group: {
          _id: '$userId',
          bestAccuracy: { $max: '$accuracy' },
        },
      },
      { $sort: { bestAccuracy: -1 } },
    ]);

    const totalUsers = allScores.length;
    const userRankEntry = allScores.findIndex(
      (s) => s._id.toString() === userId.toString()
    );
    const rank = userRankEntry !== -1 ? userRankEntry + 1 : null;

    // Speed feedback distribution
    const feedbackDist = { Optimal: 0, 'Too Slow': 0, 'Too Fast': 0 };
    userScores.forEach((s) => {
      if (s.speedFeedback && feedbackDist[s.speedFeedback] !== undefined) {
        feedbackDist[s.speedFeedback]++;
      }
    });

    res.json({
      username: req.user.name,
      totalSessions: userScores.length,
      avgAccuracy,
      bestAccuracy,
      avgWpm,
      bestWpm,
      modules,
      recent: userScores.slice(0, 10),
      streak,
      rank,
      feedbackDist,
      totalUsers,
    });
  } catch (error) {
    console.error('Dashboard error:', error.message);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// ──────────────────────────────────────────────────
// GET /api/score/leaderboard
// Get top 20 scores across all users
// ──────────────────────────────────────────────────
router.get('/leaderboard', async (req, res) => {
  try {
    const scores = await Score.find()
      .sort({ accuracy: -1, wpm: -1, createdAt: -1 })
      .limit(20);

    const total = await Score.countDocuments();

    res.json({
      leaderboard: scores,
      total,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error.message);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
