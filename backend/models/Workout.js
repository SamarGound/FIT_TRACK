const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
  title: { type: String, required: true },
  description: String,
  exercises: String
});

module.exports = mongoose.model('Workout', workoutSchema);
