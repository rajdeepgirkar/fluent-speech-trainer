const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      required: true,
      enum: ['tongue_twister', 'paragraph'],
    },
    accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    wpm: {
      type: Number,
      default: 0,
      min: 0,
    },
    speedSetting: {
      type: String,
      default: 'medium',
    },
    speedFeedback: {
      type: String,
      enum: ['Optimal', 'Too Slow', 'Too Fast', 'No speech detected', ''],
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // createdAt serves as the score timestamp
  }
);

// Index for fast queries by user
scoreSchema.index({ userId: 1, createdAt: -1 });

const Score = mongoose.model('Score', scoreSchema);

module.exports = Score;
