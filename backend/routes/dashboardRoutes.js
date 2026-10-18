const express = require('express');
const { getAdminStats, getMemberStats } = require('../controllers/dashboardController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/admin', protect, adminOnly, getAdminStats);
router.get('/member', protect, getMemberStats);

module.exports = router;
