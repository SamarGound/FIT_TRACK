const Member = require('../models/Member');
const DietPlan = require('../models/DietPlan');

// Accept both `member` and `memberId` (same for trainer) from the frontend
const normalize = (body = {}) => {
  const { memberId, trainerId, ...rest } = body;
  return {
    ...rest,
    member: rest.member || memberId,
    ...(rest.trainer || trainerId ? { trainer: rest.trainer || trainerId } : {}),
  };
};

exports.list = async (req, res, next) => {
  try {
    const plans = await DietPlan.find().populate('member', 'name').populate('trainer', 'name');
    res.json(plans);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const plan = await DietPlan.create(normalize(req.body));
    res.status(201).json(plan);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const plan = await DietPlan.findByIdAndUpdate(req.params.id, normalize(req.body), { new: true });
    if (!plan) return res.status(404).json({ message: 'Diet plan not found' });
    res.json(plan);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const plan = await DietPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Diet plan not found' });
    res.json({ message: 'Diet plan deleted' });
  } catch (err) {
    next(err);
  }
};



exports.myDietPlans = async (req, res, next) => {
  try {
    const member = await Member.findOne({ user: req.user._id });

    if (!member) {
      return res.status(404).json({
        message: 'Member profile not found'
      });
    }

    const plans = await DietPlan.find({
      member: member._id
    }).populate('trainer', 'name');

    res.json(plans);
  } catch (err) {
    next(err);
  }
};
