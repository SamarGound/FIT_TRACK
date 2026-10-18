const Member = require('../models/Member');
const Workout = require('../models/Workout');


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
    const workouts = await Workout.find().populate('member', 'name').populate('trainer', 'name');
    res.json(workouts);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const workout = await Workout.create(normalize(req.body));
    res.status(201).json(workout);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const workout = await Workout.findByIdAndUpdate(req.params.id, normalize(req.body), { new: true });
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    res.json(workout);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const workout = await Workout.findByIdAndDelete(req.params.id);
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    res.json({ message: 'Workout deleted' });
  } catch (err) {
    next(err);
  }
};




exports.myWorkouts = async (req, res, next) => {
  try {
    // Find this user's Member profile
    const conditions = [{ user: req.user._id }];

    if (req.user.email) {
      conditions.push({ email: req.user.email.toLowerCase() });
    }

    const member = await Member.findOne({ $or: conditions });

    if (!member) {
      return res.status(404).json({
        message: 'Member profile not linked to this account',
      });
    }

    // Fetch workouts assigned to this exact Member ID
    const workouts = await Workout.find({
      member: member._id,
    }).populate('trainer', 'name');

    res.json(workouts);
  } catch (err) {
    next(err);
  }
};