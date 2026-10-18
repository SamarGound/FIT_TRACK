const express = require('express');
const { list, create, remove } = require('../controllers/attendanceController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, adminOnly, list);
router.post('/', protect, adminOnly, create);
router.delete('/:id', protect, adminOnly, remove);

module.exports = router;
