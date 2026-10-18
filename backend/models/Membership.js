const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  name: { type: String, required: true },
  durationMonths: { type: Number, required: true },
  price: { type: Number, required: true },
  description: String
});

module.exports = mongoose.model('Membership', membershipSchema);
