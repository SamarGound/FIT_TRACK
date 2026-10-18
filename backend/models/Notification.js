const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'warning', 'alert'], default: 'info' },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
