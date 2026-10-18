const Member = require('../models/Member');
const User = require('../models/User');
const MemberMembership = require('../models/MemberMembership');
const BMIProgress = require('../models/BMIProgress');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const Workout = require('../models/Workout');
const DietPlan = require('../models/DietPlan');

exports.list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.search) {
      filter.name = new RegExp(req.query.search, 'i');
    }
    const members = await Member.find(filter).sort({ name: 1 });
    res.json(members);
  } catch (err) {
    next(err);
  }
};

exports.detail = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const [memberships, bmi, payments, latestAttendance] = await Promise.all([
      MemberMembership.find({ member: member._id }).populate('membership', 'name price durationMonths'),
      BMIProgress.find({ member: member._id }).sort({ recordDate: 1 }),
      Payment.find({ member: member._id }).populate('membership', 'name'),
      Attendance.findOne({ member: member._id }).sort({ date: -1 })
    ]);

    res.json({ member, memberships, bmi, payments, latestAttendance });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    if (member.user) await User.findByIdAndDelete(member.user);
    await member.deleteOne();

    res.json({ message: 'Member and linked user deleted' });
  } catch (err) {
    next(err);
  }
};
