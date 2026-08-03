const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false, // Password default me retrieve nahi hoga
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'Trans'],
    required: true,
  },
  userType: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Password ko hash karna save se pehle
UserSchema.pre('save', async function (next) {
  // Agar password change nahi hua to aage badhao
  if (!this.isModified('password')) {
    next();
  }

  // Password ko hash karo
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Password ko match karne ke liye method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
