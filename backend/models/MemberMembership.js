const mongoose = require('mongoose');

const memberMembershipSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    membership: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership', required: true },
    startDate: { type: Date, required: true },
    endDate: Date,
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MemberMembership', memberMembershipSchema);
