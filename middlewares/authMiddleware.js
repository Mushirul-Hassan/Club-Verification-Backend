import jwt from 'jsonwebtoken';
import { tokenConfig } from '../config/tokens.config.js';

/**
 * Authentication Middleware: Validates the 15-minute Access Token
 */
export const verifyAdminToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied: Session missing' });
    }

    const token = authHeader.split(' ')[1];
    
    // Uses the centralized configuration secret key 🔑
    const decoded = jwt.verify(token, tokenConfig.access.secret);
    
    // Standardizes the admin payload so it's SaaS-ready down the line
    req.admin = {
      id: decoded.adminId,
      role: decoded.role,
      companyId: decoded.companyId // Ready for multi-club isolation
    };

    next();
  } catch (error) {
    // 401 signals the frontend to trigger the silent refresh token loop
    return res.status(401).json({ success: false, message: 'Session expired or invalid token' });
  }
};

/**
 * Authorization Middleware: Blocks roles that lack clearance (e.g., Bouncers seeing Admin settings)
 */
export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin || !allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access Forbidden: Insufficient clearance' 
      });
    }
    next();
  };
};