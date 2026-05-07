const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Path to data files
const DATA_DIR = path.join(__dirname, '..', 'data');

/**
 * Load and parse a JSON file from the data directory.
 */
function loadJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

// ──────────────────────────────────────────────────
// GET /api/twisters
// Return all tongue twisters organized by category
// ──────────────────────────────────────────────────
router.get('/twisters', (req, res) => {
  try {
    const data = loadJSON('tongue_twisters.json');
    res.json(data);
  } catch (error) {
    console.error('Error loading tongue twisters:', error.message);
    res.status(500).json({ error: 'Failed to load tongue twisters' });
  }
});

// ──────────────────────────────────────────────────
// GET /api/twisters/session
// Return a randomized session of tongue twisters
// Query: ?category=communication|technical|tricky_fun|all  &count=5
// ──────────────────────────────────────────────────
router.get('/twisters/session', (req, res) => {
  try {
    const category = req.query.category || 'all';
    const count = Math.min(parseInt(req.query.count) || 5, 10);
    const data = loadJSON('tongue_twisters.json');

    let pool;
    if (category === 'all') {
      pool = Object.values(data).flat();
    } else if (data[category]) {
      pool = data[category];
    } else {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Shuffle and pick
    const shuffled = pool.sort(() => 0.5 - Math.random());
    const session = shuffled.slice(0, Math.min(count, pool.length));

    res.json({
      session,
      total: session.length,
      category,
    });
  } catch (error) {
    console.error('Error creating twister session:', error.message);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// ──────────────────────────────────────────────────
// GET /api/paragraphs
// Return all paragraphs organized by difficulty
// ──────────────────────────────────────────────────
router.get('/paragraphs', (req, res) => {
  try {
    const data = loadJSON('paragraphs.json');
    res.json(data);
  } catch (error) {
    console.error('Error loading paragraphs:', error.message);
    res.status(500).json({ error: 'Failed to load paragraphs' });
  }
});

// ──────────────────────────────────────────────────
// GET /api/paragraphs/random
// Return a random paragraph by difficulty
// Query: ?difficulty=easy|medium|hard
// ──────────────────────────────────────────────────
router.get('/paragraphs/random', (req, res) => {
  try {
    const difficulty = req.query.difficulty || 'medium';
    const data = loadJSON('paragraphs.json');

    if (!data[difficulty]) {
      return res.status(400).json({ error: 'Invalid difficulty level' });
    }

    const paragraphs = data[difficulty];
    const paragraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];

    res.json(paragraph);
  } catch (error) {
    console.error('Error loading random paragraph:', error.message);
    res.status(500).json({ error: 'Failed to load paragraph' });
  }
});

module.exports = router;
