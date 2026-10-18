const express = require('express');
const { listMine, listForAdmin, create, remove } = require('../controllers/bmiController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/mine', protect, listMine);
router.get('/member/:memberId', protect, adminOnly, listForAdmin);
router.post('/', protect, create);
router.delete('/:id', protect, remove);

module.exports = router;
