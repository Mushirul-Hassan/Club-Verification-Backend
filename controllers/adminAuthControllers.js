import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import 'dotenv/config';

/**
 * Handles initial login credential matching and sets tokens
 */
export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password' });
    }

    // Explicitly query the hidden password field using .select('+password')
    const normalizedUsername = username.toLowerCase().trim();
    const admin = await Admin.findOne({ username: normalizedUsername }).select('+password');

    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or account deactivated' });
    }

    // Compare text input with stored cryptographic salt hash
    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Create short-lived Access Token (15m)
    const accessToken = jwt.sign(
      { adminId: admin._id, role: admin.role, fullName: admin.fullName },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' }
    );

    // Create long-lived Refresh Token (7d)
    const refreshToken = jwt.sign(
      { adminId: admin._id, role: admin.role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
    );

    // 🔒 Lock Refresh Token into an unreadable HttpOnly Cookie
    res.cookie('jwt_refresh', refreshToken, {
      httpOnly: true, // Blocks JavaScript injection/XSS stealing the token
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'Strict', // Blocks Cross-Site Request Forgery (CSRF)
      signed: true, // Cryptographically signs the cookie values
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days matching token validation span
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken: accessToken,
      admin: {
        fullName: admin.fullName,
        role: admin.role
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server login execution error', error: error.message });
  }
};

/**
 * Dynamic Silent Token Refresh: Re-issues access tokens using the cookie key
 */
export const refreshAdminSession = async (req, res) => {
  try {
    // Read the signed cookies object populated by cookie-parser middleware
    const cookieToken = req.signedCookies.jwt_refresh;
    if (!cookieToken) {
      return res.status(401).json({ success: false, message: 'Session expired or missing context' });
    }

    // Validate the refresh token cryptographic signature
    const decoded = jwt.verify(cookieToken, process.env.REFRESH_TOKEN_SECRET);

    // Ensure the admin account remains active in the system database
    const admin = await Admin.findById(decoded.adminId);
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Access revoked' });
    }

    // Generate a fresh 15-minute access token
    const newAccessToken = jwt.sign(
      { adminId: admin._id, role: admin.role, fullName: admin.fullName },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' }
    );

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken
    });

  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid session renewal key' });
  }
};

/**
 * Standard Session Logout: Purges HttpOnly verification cookie records
 */
export const logoutAdmin = (req, res) => {
  res.clearCookie('jwt_refresh', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    signed: true
  });
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};