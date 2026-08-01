const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register Controller
exports.register = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;

    const displayName = username || name;

    // 1. Validation check
    if (!displayName || !email || !password) {
      return res.status(400).json({ 
        message: 'Please provide a name/username, email, and password.' 
      });
    }

    // 2. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email already exists.' 
      });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create new user
    const newUser = new User({
      username: displayName,
      name: displayName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // 5. Generate JWT Token
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_12345';
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 6. Terminal Log & Response
    console.log(`✅ User registered successfully: ${newUser.email}`);

    res.status(201).json({
      message: 'User registered successfully!',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('❌ Register Error:', error);
    res.status(500).json({
      message: error.message || 'Server Internal Error',
      error: error.message,
    });
  }
};

// Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_12345';
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`🔑 User logged in successfully: ${user.email}`);

    res.status(200).json({
      message: 'Logged in successfully!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({
      message: error.message || 'Server Internal Error',
    });
  }
};