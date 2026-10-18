const User = require('../models/User');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const Membership = require('../models/Membership');
const MemberMembership = require('../models/MemberMembership');
const Workout = require('../models/Workout');
const DietPlan = require('../models/DietPlan');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const BMIProgress = require('../models/BMIProgress');
const Notification = require('../models/Notification');

exports.getAdminStats = async (req, res, next) => {
  try {
    const [members, trainers, plans, workouts, dietPlans, attendance] = await Promise.all([
      Member.countDocuments(),
      Trainer.countDocuments(),
      Membership.countDocuments(),
      Workout.countDocuments(),
      DietPlan.countDocuments(),
      Attendance.countDocuments()
    ]);

    const revenueAgg = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);

    const expiring = await MemberMembership.find({
      status: 'active',
      endDate: { $gte: now, $lte: in30Days }
    })
      .populate('member', 'name')
      .populate('membership', 'name');

    const monthlyAgg = await Payment.aggregate([
      { $match: { status: 'paid', paymentDate: { $gte: new Date(now.getFullYear(), 0, 1) } } },
      {
        $group: {
          _id: { $month: '$paymentDate' },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: (monthlyAgg.find((m) => m._id === i + 1) || {}).total || 0
    }));

    res.json({
      counts: { members, trainers, plans, workouts, dietPlans, attendance },
      totalRevenue: revenueAgg.length ? revenueAgg[0].total : 0,
      expiringMemberships: expiring,
      monthlyRevenue
    });
  } catch (err) {
    next(err);
  }
};

exports.getMemberStats = async (req, res, next) => {
  try {
    const member = await Member.findOne({ user: req.user._id });
    if (!member) return res.status(404).json({ message: 'Member profile not found' });

    const latest = await MemberMembership.findOne({ member: member._id, status: 'active' })
      .sort({ startDate: -1 })
      .populate('membership', 'name price durationMonths');

    const [attendanceTotal, attendancePresent] = await Promise.all([
      Attendance.countDocuments({ member: member._id }),
      Attendance.countDocuments({ member: member._id, status: 'present' })
    ]);

    const paidAgg = await Payment.aggregate([
      { $match: { member: member._id, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const [workouts, dietPlans, latestBmi, unread, bmiHistory] = await Promise.all([
      Workout.countDocuments({ member: member._id }),
      DietPlan.countDocuments({ member: member._id }),
      BMIProgress.findOne({ member: member._id }).sort({ recordDate: -1 }),
      Notification.countDocuments({ member: member._id, isRead: false }),
      BMIProgress.find({ member: member._id }).sort({ recordDate: 1 }).select('recordDate bmi')
    ]);

    res.json({
      member,
      currentMembership: latest,
      attendance: { total: attendanceTotal, present: attendancePresent },
      totalPaid: paidAgg.length ? paidAgg[0].total : 0,
      workouts,
      dietPlans,
      latestBmi,
      bmiHistory,
      unreadNotifications: unread
    });
  } catch (err) {
    next(err);
  }
};
