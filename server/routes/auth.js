import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User, PasswordResetToken, Asset, AssetCustodyHistory } from '../models/index.js';

const router = express.Router();

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', { 
    expiresIn: process.env.JWT_EXPIRES_IN || '30d' 
  });
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, managerId } = req.body;
    const userExists = await User.findOne({ where: { email } });

    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'employee',
      department,
      managerId: managerId || null
    });

    // Default asset assignment: every employee gets one laptop.
    if (user.role === 'employee') {
      const existingLaptop = await Asset.findOne({
        where: { assignedEmployeeId: user.id, assetType: 'Laptop' }
      });

      if (!existingLaptop) {
        const asset = await Asset.create({
          assetType: 'Laptop',
          assignedEmployeeId: user.id,
          status: 'Assigned',
          assignedDate: new Date()
        });
        await AssetCustodyHistory.create({
          assetId: asset.id,
          employeeId: user.id,
          assignedAt: new Date(),
          releasedAt: null,
          reason: 'Default laptop assignment on employee onboarding'
        });
      }
    }

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.role),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Forgot password (backend only; frontend UI needs to be added separately)
// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: 'email is required' });

    const user = await User.findOne({ where: { email } });

    // Avoid account enumeration
    if (!user) {
      return res.json({ message: 'If the account exists, a reset token has been generated.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await PasswordResetToken.create({
      tokenHash,
      userId: user.id,
      expiresAt,
      used: false,
      usedAt: null
    });

    // NOTE: Without email sending, the token is returned to the client for now.
    // In production, you should email the reset link/token instead.
    return res.json({
      message: 'If the account exists, a reset token has been generated.',
      resetToken: token
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Reset password
// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body || {};
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'resetToken and newPassword are required' });
    }

    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const tokenRecord = await PasswordResetToken.findOne({ where: { tokenHash } });

    if (!tokenRecord || tokenRecord.used) {
      return res.status(400).json({ message: 'Invalid or already used reset token' });
    }

    if (new Date(tokenRecord.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.update(
      { password: hashedPassword },
      { where: { id: tokenRecord.userId } }
    );

    tokenRecord.used = true;
    tokenRecord.usedAt = new Date();
    await tokenRecord.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
