const mongoose = require('mongoose');

const dietPlanSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
  title: { type: String, required: true },
  description: String,
  meals: String,
  calories: Number
});

module.exports = mongoose.model('DietPlan', dietPlanSchema);
