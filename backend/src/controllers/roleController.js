const AppDataSource = require('../config/database');

class RoleController {
  static async getAllRoles(req, res, next) {
    try {
      const roleRepository = AppDataSource.getRepository('Role');
      const roles = await roleRepository.find({
        where: req.user?.role?.name === 'super_admin' ? {} : { companyId: req.companyId }
      });

      res.json({ success: true, data: roles });
    } catch (error) {
      next(error);
    }
  }

  static async getRoleById(req, res, next) {
    try {
      const { id } = req.params;
      const roleRepository = AppDataSource.getRepository('Role');
      
      const role = await roleRepository.findOne({
        where: { id }
      });

      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      res.json({ success: true, data: role });
    } catch (error) {
      next(error);
    }
  }

  static async createRole(req, res, next) {
    try {
      const roleRepository = AppDataSource.getRepository('Role');
      const role = roleRepository.create({
        ...req.body,
        companyId: req.body.companyId || req.companyId
      });
      
      await roleRepository.save(role);

      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: role
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateRole(req, res, next) {
    try {
      const { id } = req.params;
      const roleRepository = AppDataSource.getRepository('Role');
      
      await roleRepository.update(id, req.body);
      const role = await roleRepository.findOne({ where: { id } });

      res.json({
        success: true,
        message: 'Role updated successfully',
        data: role
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteRole(req, res, next) {
    try {
      const { id } = req.params;
      const roleRepository = AppDataSource.getRepository('Role');
      
      await roleRepository.delete(id);

      res.json({
        success: true,
        message: 'Role deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPermissionsTemplate(req, res, next) {
    try {
      const permissions = {
        users: { create: false, read: false, update: false, delete: false },
        products: { create: false, read: false, update: false, delete: false },
        locations: { create: false, read: false, update: false, delete: false },
        sales: { create: false, read: false, update: false, delete: false },
        reports: { create: false, read: false, update: false, delete: false },
        companies: { create: false, read: false, update: false, delete: false },
        roles: { create: false, read: false, update: false, delete: false },
        backups: { create: false, read: false, update: false, delete: false }
      };

      res.json({
        success: true,
        data: permissions
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRoleUsers(req, res, next) {
    try {
      res.json({
        success: true,
        message: 'Role users coming soon'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RoleController;
