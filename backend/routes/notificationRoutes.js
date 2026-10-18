const express = require('express');
const { listMine, markRead, markAllRead } = require('../controllers/notificationController');
const MemberMembership = require('../models/MemberMembership');
const Member = require('../models/Member');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/mine', protect, listMine);
router.put('/read-all', protect, markAllRead);
router.put('/:id/read', protect, markRead);

router.get('/expiry-alerts', protect, async (req, res, next) => {
  try {
    const member = await Member.findOne({ user: req.user._id });
    if (!member) return res.status(404).json({ message: 'Member profile not found' });

    const now = new Date();
    const in14Days = new Date();
    in14Days.setDate(in14Days.getDate() + 14);

    const alerts = await MemberMembership.find({
      member: member._id,
      status: 'active',
      endDate: { $gte: now, $lte: in14Days }
    }).populate('membership', 'name price');

    res.json(alerts);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
