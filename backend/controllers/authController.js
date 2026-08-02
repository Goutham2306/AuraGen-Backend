const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ================= REGISTER =================

exports.register = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;

    const displayName = username || name;

    if (!displayName || !email || !password) {
      return res.status(400).json({
        message: 'Please provide a name/username, email, and password.',
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username: displayName,
      name: displayName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const JWT_SECRET =
      process.env.JWT_SECRET || 'fallback_secret_key_12345';

    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
      },
      JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    console.log('✅ User Registered:', newUser.email);

    res.status(201).json({
      success: true,
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
      success: false,
      message: 'Server Internal Error',
      error: error.message,
    });
  }
};

// ================= LOGIN =================

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('\n================ LOGIN REQUEST ================');
    console.log('📥 Request Body:', req.body);

    if (!email || !password) {
      console.log('❌ Email or Password Missing');

      return res.status(400).json({
        success: false,
        message: 'Please enter email and password.',
      });
    }

    const user = await User.findOne({ email });

    console.log('👤 User Found:', user);

    if (!user) {
      console.log('❌ User Not Found');

      return res.status(400).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    console.log('🔑 Password Match:', isMatch);

    if (!isMatch) {
      console.log('❌ Incorrect Password');

      return res.status(400).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    const JWT_SECRET =
      process.env.JWT_SECRET || 'fallback_secret_key_12345';

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    console.log('✅ Login Successful:', user.email);

    res.status(200).json({
      success: true,
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
      success: false,
      message: 'Server Internal Error',
      error: error.message,
    });
  }
};