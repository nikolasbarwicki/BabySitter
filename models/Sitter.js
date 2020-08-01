const mongoose = require('mongoose');

const SitterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  city: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  experienceAges: {
    baby: { type: Boolean, default: false },
    toddler: { type: Boolean, default: false },
    preschooler: { type: Boolean, default: false },
    gradeschooler: { type: Boolean, default: false },
    teenager: { type: Boolean, default: false },
  },
  hourlyRate: {
    type: String,
    required: true,
  },
  skills: {
    crafting: { type: Boolean, default: false },
    drawing: { type: Boolean, default: false },
    reading: { type: Boolean, default: false },
    music: { type: Boolean, default: false },
    language: { type: Boolean, default: false },
    games: { type: Boolean, default: false },
  },
  comfortableWith: {
    pets: { type: Boolean, default: false },
    cooking: { type: Boolean, default: false },
    chores: { type: Boolean, default: false },
  },
  contactPhone: {
    type: String,
    required: true,
  },
  contactEmail: {
    type: String,
    required: true,
  },
  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('sitter', SitterSchema);
