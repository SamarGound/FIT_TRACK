
const express = require('express');
const router = express.Router();

const {
  list,
  create,
  update,
  remove,
  myWorkouts,
} = require('../controllers/workoutController');

const { protect, adminOnly } = require('../middleware/auth');

// Member dashboard: get logged-in member's workouts
router.get('/my', protect, myWorkouts);

// Admin workout management
router.get('/', protect, adminOnly, list);
router.post('/', protect, adminOnly, create);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, remove);

module.exports = router;
