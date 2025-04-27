const mongoose = require('mongoose');

const publicHolidaySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  year: {
    type: Number,
    required: true
  }
});

// Create a compound index for unique date-year combination
publicHolidaySchema.index({ date: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('PublicHoliday', publicHolidaySchema); 