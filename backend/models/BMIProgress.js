const mongoose = require('mongoose');

const bmiProgressSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  recordDate: { type: Date, default: Date.now },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  bmi: Number,
  year: Number,
  month: Number
});

bmiProgressSchema.pre('save', function (next) {
  const d = this.recordDate || new Date();
  this.year = d.getFullYear();
  this.month = d.getMonth();
  if (!this.bmi && this.height && this.weight) {
    const m = this.height / 100;
    this.bmi = +(this.weight / (m * m)).toFixed(2);
  }
  next();
});

bmiProgressSchema.index({ member: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('BMIProgress', bmiProgressSchema);
