const Trainer = require('../models/Trainer');

exports.list = async (req, res, next) => {
  try {
    const trainers = await Trainer.find();
    res.json(trainers);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const trainer = await Trainer.create(req.body);
    res.status(201).json(trainer);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const trainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
    res.json(trainer);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const trainer = await Trainer.findByIdAndDelete(req.params.id);
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
    res.json({ message: 'Trainer deleted' });
  } catch (err) {
    next(err);
  }
};
