const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Header se token check karo
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Token check karo
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    // Token verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');

    // User find karo
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};
