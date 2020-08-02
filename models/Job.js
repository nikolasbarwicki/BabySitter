const mongoose = require('mongoose');
const geocoder = require('../utils/geocoder');

const JobSchema = new mongoose.Schema({
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
  description: {
    type: String,
    required: true,
  },
  numberOfChildren: {
    type: Number,
    required: true,
  },
  ageOfChildren: {
    type: [Number],
    required: true,
  },
  hourlyRate: {
    type: Number,
    required: true,
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

// Geocode & create location field
JobSchema.pre('save', async function (next) {
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

  // Do not save address in DB
  this.address = undefined;
  next();
});

module.exports = mongoose.model('job', JobSchema);
