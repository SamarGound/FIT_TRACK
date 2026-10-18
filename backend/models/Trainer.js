const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: String,
  phone: String,
  email: String,
  experience: Number
});

module.exports = mongoose.model('Trainer', trainerSchema);
