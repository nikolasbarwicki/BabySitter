const mongoose = require('mongoose');
const geocoder = require('../utils/geocoder');
const moment = require('moment');

const SitterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  address: {
    type: String,
    required: true,
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
      index: '2dsphere',
    },
    street: String,
    city: String,
    state: String,
    country: String,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  age: {
    type: Number,
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
    type: Number,
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

// Geocode & create location field + calculate age
SitterSchema.pre('save', async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };

  const calculateAge = moment().diff(this.dateOfBirth, 'years');
  this.age = calculateAge;

  // Do not save address in DB
  this.address = undefined;
  next();
});

module.exports = mongoose.model('sitter', SitterSchema);
