const BMIProgress = require('../models/BMIProgress');
const Member = require('../models/Member');

exports.listMine = async (req, res, next) => {
  try {
    const member = await Member.findOne({ user: req.user._id });
    if (!member) return res.status(404).json({ message: 'Member profile not found' });
    const records = await BMIProgress.find({ member: member._id }).sort({ recordDate: 1 });
    res.json(records);
  } catch (err) {
    next(err);
  }
};

exports.listForAdmin = async (req, res, next) => {
  try {
    const records = await BMIProgress.find({ member: req.params.memberId }).sort({ recordDate: 1 });
    res.json(records);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    let memberId = req.body.memberId;
    if (req.user.role !== 'admin') {
      const member = await Member.findOne({ user: req.user._id });
      if (!member) return res.status(404).json({ message: 'Member profile not found' });
      memberId = member._id;
    }

    const recordDate = req.body.recordDate ? new Date(req.body.recordDate) : new Date();
    const year = recordDate.getFullYear();
    const month = recordDate.getMonth();

    const m = (req.body.height || 0) / 100;
    const bmi = req.body.weight && req.body.height ? +(req.body.weight / (m * m)).toFixed(2) : undefined;

    const record = await BMIProgress.findOneAndUpdate(
      { member: memberId, year, month },
      { ...req.body, member: memberId, recordDate, bmi },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const record = await BMIProgress.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'BMI record not found' });

    if (req.user.role !== 'admin') {
      const member = await Member.findOne({ user: req.user._id });
      if (!member || record.member.toString() !== member._id.toString()) {
        return res.status(403).json({ message: 'Not allowed to delete this record' });
      }
    }

    await record.deleteOne();
    res.json({ message: 'BMI record deleted' });
  } catch (err) {
    next(err);
  }
};
