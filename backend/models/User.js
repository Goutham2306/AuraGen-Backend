const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
  },
  { timestamps: true }
);

// Synchronous pre-save hook (no next parameter needed in modern Mongoose)
userSchema.pre('save', function () {
  if (!this.username && this.name) {
    this.username = this.name;
  }
  if (!this.name && this.username) {
    this.name = this.username;
  }
});

module.exports = mongoose.model('User', userSchema);