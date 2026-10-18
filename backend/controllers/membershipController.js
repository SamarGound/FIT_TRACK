const Membership = require('../models/Membership');
const MemberMembership = require('../models/MemberMembership');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');



exports.list = async (req, res, next) => {
  try {
    const plans = await Membership.find();
    res.json(plans);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const plan = await Membership.create(req.body);
    res.status(201).json(plan);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const plan = await Membership.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) return res.status(404).json({ message: 'Membership plan not found' });
    res.json(plan);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const plan = await Membership.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Membership plan not found' });
    res.json({ message: 'Membership plan deleted' });
  } catch (err) {
    next(err);
  }
};

exports.listAssigned = async (req, res, next) => {
  try {
    const assignments = await MemberMembership.find()
      .populate('member', 'name')
      .populate('membership', 'name')
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    next(err);
  }
};


exports.assign = async (req, res, next) => {
  try {
    const { memberId, membershipId, startDate } = req.body;
    if (!memberId || !membershipId) {
      return res.status(400).json({ message: 'memberId and membershipId are required' });
    }

    const plan = await Membership.findById(membershipId);
    if (!plan) return res.status(404).json({ message: 'Membership plan not found' });

    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + plan.durationMonths);

    const assignment = await MemberMembership.create({
      member: memberId,
      membership: membershipId,
      startDate: start,
      endDate: end,
      status: 'active'
    });

    await Payment.create({
      member: memberId,
      membership: membershipId,
      amount: plan.price,
      status: 'paid',
      paymentDate: start
    });

    await Notification.create({
      member: memberId,
      message: `Your "${plan.name}" membership is active until ${end.toDateString()}.`,
      type: 'info'
    });

    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const assignment = await MemberMembership.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!assignment) return res.status(404).json({ message: 'Membership assignment not found' });
    res.json(assignment);
  } catch (err) {
    next(err);
  }
};
