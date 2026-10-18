const Payment = require('../models/Payment');

// Accept both `member` and `memberId` (same for membership) from the frontend
const normalize = (body = {}) => {
  const { memberId, membershipId, ...rest } = body;
  return {
    ...rest,
    member: rest.member || memberId,
    ...(rest.membership || membershipId ? { membership: rest.membership || membershipId } : {}),
  };
};

exports.list = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('member', 'name')
      .populate('membership', 'name')
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const payment = await Payment.create(normalize(req.body));
    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, normalize(req.body), { new: true });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    next(err);
  }
};
