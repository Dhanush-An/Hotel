const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register user
const registerUser = async (req, res) => {
  const { name, email, mobile, password, role } = req.body;

  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!strongPasswordRegex.test(password)) {
    return res.status(400).json({ 
      message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one special character' 
    });
  }

  try {
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      mobile,
      password,
      role: role || 'receptionist'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        photo: user.photo,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Login user
const authUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = (email || '').trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // ✅ Compare hashed password correctly using the model's method 
    // or manual bcrypt.compare as suggested
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // ✅ Generate JWT with the key in .env
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      photo: user.photo,
      role: user.role
    });

  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

module.exports = { registerUser, authUser };
