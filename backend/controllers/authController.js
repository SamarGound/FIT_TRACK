const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Member = require('../models/Member');

const signToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });

const userData = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role: 'member' });
    await Member.create({ name, email, user: user._id });

    res.status(201).json({ token: signToken(user), user: userData(user) });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({ token: signToken(user), user: userData(user) });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    res.json({ user: userData(req.user) });
  } catch (err) {
    next(err);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const { name, phone, dob, address } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    await user.save();

    const member = await Member.findOne({ user: user._id });
    if (member) {
      if (name) member.name = name;
      if (phone !== undefined) member.phone = phone;
      if (dob) member.dob = dob;
      if (address !== undefined) member.address = address;
      await member.save();
    }

    res.json({ user: userData(user) });
  } catch (err) {
    next(err);
  }
};
