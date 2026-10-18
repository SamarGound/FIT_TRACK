const Attendance = require('../models/Attendance');

exports.list = async (req, res, next) => {
  try {
    const records = await Attendance.find().populate('member', 'name').sort({ date: -1 });
    res.json(records);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const record = await Attendance.create(req.body);
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: 'Attendance record not found' });
    res.json({ message: 'Attendance record deleted' });
  } catch (err) {
    next(err);
  }
};
