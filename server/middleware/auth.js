import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Log for debugging
      console.log('Verifying token...');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
      console.log('Token decoded, ID:', decoded.id);

      req.user = await User.findByPk(decoded.id, {
        attributes: [
          'id',
          'name',
          'email',
          'role',
          'department',
          'totalLeaves',
          'usedLeaves',
          'managerId',
          'archived',
          'archivedAt'
        ]
      });
      
      if (!req.user) {
        console.log('User not found in DB for ID:', decoded.id);
        return res.status(401).json({ message: 'User not found in current database' });
      }

      if (req.user.archived) {
        return res.status(401).json({ message: 'Account is archived' });
      }

      console.log('Auth successful for:', req.user.name);
      next();
    } catch (error) {
      console.error('Auth Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed: ' + error.message });
    }
  } else {
    console.log('No token provided in headers');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role (${req.user.role}) is not allowed to access this resource` });
    }
    next();
  };
};
