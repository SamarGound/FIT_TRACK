const express = require('express');
const { list, create, update, remove } = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, adminOnly, list);
router.post('/', protect, adminOnly, create);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, remove);

module.exports = router;
