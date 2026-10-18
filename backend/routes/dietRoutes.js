const express = require('express');
const { list, create, update, remove,myDietPlans } = require('../controllers/dietController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Member: view their own diet plans
router.get('/my', protect, myDietPlans);

router.get('/', protect, adminOnly, list);
router.post('/', protect, adminOnly, create);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, remove);

module.exports = router;
