const express = require('express');
const {
  list,
  create,
  update,
  remove,
  listAssigned,
  assign,
  cancel
} = require('../controllers/membershipController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, list);
router.get('/assigned', protect, adminOnly, listAssigned);
router.post('/', protect, adminOnly, create);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, remove);
router.post('/assign', protect, adminOnly, assign);
router.put('/member-memberships/:id/cancel', protect, adminOnly, cancel);

module.exports = router;
