const express = require('express');
const { list, detail, remove } = require('../controllers/memberController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/', list);
router.get('/:id', detail);
router.delete('/:id', remove);

module.exports = router;
