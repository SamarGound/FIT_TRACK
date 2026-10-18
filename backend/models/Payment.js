const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  membership: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership' },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'paid' },
  paymentDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
