require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const [name, email, password] = process.argv.slice(2);

if (!name || !email || !password) {
  console.log('Usage: node scripts/createAdmin.js "Admin Name" admin@gym.com password123');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gym-management');

    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      user.name = name;
      user.password = password;
      user.role = 'admin';
      await user.save();
      console.log(`Existing user ${email} promoted to admin`);
    } else {
      user = await User.create({ name, email, password, role: 'admin' });
      console.log(`Admin created: ${email}`);
    }
      const Member = require('../models/Member');
const existingMember = await Member.findOne({ user: user._id });
if (!existingMember) {
  await Member.create({ name, email, user: user._id });
  console.log('Linked member record created');
}

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }



})();
