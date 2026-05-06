const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename: rec_<uuid>.<ext>
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `rec_${uuidv4()}${ext}`);
  },
});

// File filter: only allow audio files
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'audio/webm',
    'audio/wav',
    'audio/mpeg',
    'audio/mp3',
    'audio/ogg',
    'text/plain',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only audio and text files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max
  },
});

// ──────────────────────────────────────────────────
// POST /api/upload
// Upload an audio recording file
// ──────────────────────────────────────────────────
router.post('/', upload.single('audio'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.status(201).json({
      success: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
    });
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Error handling for multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Max 50MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

module.exports = router;
