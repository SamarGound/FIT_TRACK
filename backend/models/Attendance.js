const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['present', 'absent'], default: 'present' }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
