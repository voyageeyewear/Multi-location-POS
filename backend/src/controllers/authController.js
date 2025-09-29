const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AppDataSource = require('../config/database');

class AuthController {
  // Register new user
  static async register(req, res, next) {
    try {
      const { firstName, lastName, email, password, phone, roleId, companyId } = req.body;

      // Check if user already exists
      const userRepository = AppDataSource.getRepository('User');
      const existingUser = await userRepository.findOne({ where: { email } });
      
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Verify role and company exist
      const roleRepository = AppDataSource.getRepository('Role');
      const companyRepository = AppDataSource.getRepository('Company');
      
      const [role, company] = await Promise.all([
        roleRepository.findOne({ where: { id: roleId, isActive: true } }),
        companyRepository.findOne({ where: { id: companyId, isActive: true } })
      ]);

      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role'
        });
      }

      if (!company) {
        return res.status(400).json({
          success: false,
          message: 'Invalid company'
        });
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');

      // Create user
      const user = userRepository.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        roleId,
        companyId,
        emailVerificationToken
      });

      await userRepository.save(user);

      // Generate JWT tokens
      const accessToken = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          roleId: user.roleId,
          companyId: user.companyId 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      );

      // Update user with refresh token
      await userRepository.update(user.id, { refreshToken });

      // Get user with relations for response
      const userWithRelations = await userRepository.findOne({
        where: { id: user.id },
        relations: ['role', 'company'],
        select: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar', 'isActive', 'emailVerified', 'createdAt']
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: userWithRelations,
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Login user
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Demo users for testing without database
      const demoUsers = {
        'superadmin@possystem.com': {
          id: '1',
          firstName: 'Super',
          lastName: 'Admin',
          email: 'superadmin@possystem.com',
          role: { name: 'super_admin', permissions: { users: { create: true, read: true, update: true, delete: true } } },
          company: { id: '1', name: 'Default Company' },
          userLocations: []
        },
        'admin@defaultcompany.com': {
          id: '2',
          firstName: 'Company',
          lastName: 'Admin',
          email: 'admin@defaultcompany.com',
          role: { name: 'admin', permissions: { users: { create: true, read: true, update: true, delete: false } } },
          company: { id: '1', name: 'Default Company' },
          userLocations: []
        },
        'cashier@defaultcompany.com': {
          id: '3',
          firstName: 'John',
          lastName: 'Cashier',
          email: 'cashier@defaultcompany.com',
          role: { name: 'cashier', permissions: { sales: { create: true, read: true, update: false, delete: false } } },
          company: { id: '1', name: 'Default Company' },
          userLocations: []
        }
      };

      // Check if user exists in demo data
      const user = demoUsers[email];
      if (!user || password !== 'admin123') {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT tokens
        const jwtSecret = process.env.JWT_SECRET || 'demo-secret';
        const accessToken = jwt.sign(
          {
            userId: user.id,
            email: user.email,
            roleId: user.role.name,
            companyId: user.company.id
          },
          jwtSecret,
          { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        const refreshToken = jwt.sign(
          { userId: user.id },
          jwtSecret,
          { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
        );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Refresh token
  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      
      const userRepository = AppDataSource.getRepository('User');
      const user = await userRepository.findOne({
        where: { id: decoded.userId, refreshToken, isActive: true },
        relations: ['role', 'company']
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          roleId: user.roleId,
          companyId: user.companyId 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken
        }
      });
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }
      next(error);
    }
  }

  // Logout user
  static async logout(req, res, next) {
    try {
      const userRepository = AppDataSource.getRepository('User');
      await userRepository.update(req.userId, { refreshToken: null });

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  static async getProfile(req, res, next) {
    try {
      // Demo users for testing without database
      const demoUsers = {
        '1': {
          id: '1',
          firstName: 'Super',
          lastName: 'Admin',
          email: 'superadmin@possystem.com',
          role: { name: 'super_admin', permissions: { users: { create: true, read: true, update: true, delete: true } } },
          company: { id: '1', name: 'Default Company' },
          userLocations: []
        },
        '2': {
          id: '2',
          firstName: 'Company',
          lastName: 'Admin',
          email: 'admin@defaultcompany.com',
          role: { name: 'admin', permissions: { users: { create: true, read: true, update: true, delete: false } } },
          company: { id: '1', name: 'Default Company' },
          userLocations: []
        },
        '3': {
          id: '3',
          firstName: 'John',
          lastName: 'Cashier',
          email: 'cashier@defaultcompany.com',
          role: { name: 'cashier', permissions: { sales: { create: true, read: true, update: false, delete: false } } },
          company: { id: '1', name: 'Default Company' },
          userLocations: []
        }
      };

      // Get user from demo data
      const user = demoUsers[req.userId];
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  // Change password
  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      const userRepository = AppDataSource.getRepository('User');
      const user = await userRepository.findOne({ where: { id: req.userId } });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await userRepository.update(req.userId, { password: hashedNewPassword });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Forgot password
  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      const userRepository = AppDataSource.getRepository('User');
      const user = await userRepository.findOne({ where: { email, isActive: true } });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Generate password reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour

      await userRepository.update(user.id, {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      });

      // TODO: Send email with reset token
      // For now, just return success (in production, send email)

      res.json({
        success: true,
        message: 'Password reset instructions sent to your email',
        // In development, include the token for testing
        ...(process.env.NODE_ENV === 'development' && { resetToken })
      });
    } catch (error) {
      next(error);
    }
  }

  // Reset password
  static async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;

      const userRepository = AppDataSource.getRepository('User');
      const user = await userRepository.findOne({
        where: {
          passwordResetToken: token,
          isActive: true
        }
      });

      if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password and clear reset token
      await userRepository.update(user.id, {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      });

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
