const AppDataSource = require('../config/database');

class CompanyController {
  static async getAllCompanies(req, res, next) {
    try {
      const companyRepository = AppDataSource.getRepository('Company');
      const companies = await companyRepository.find();

      res.json({ success: true, data: companies });
    } catch (error) {
      next(error);
    }
  }

  static async getCompanyById(req, res, next) {
    try {
      const { id } = req.params;
      const companyRepository = AppDataSource.getRepository('Company');
      
      const company = await companyRepository.findOne({
        where: { id }
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        });
      }

      res.json({ success: true, data: company });
    } catch (error) {
      next(error);
    }
  }

  static async createCompany(req, res, next) {
    try {
      const companyRepository = AppDataSource.getRepository('Company');
      const company = companyRepository.create(req.body);
      
      await companyRepository.save(company);

      res.status(201).json({
        success: true,
        message: 'Company created successfully',
        data: company
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCompany(req, res, next) {
    try {
      const { id } = req.params;
      const companyRepository = AppDataSource.getRepository('Company');
      
      await companyRepository.update(id, req.body);
      const company = await companyRepository.findOne({ where: { id } });

      res.json({
        success: true,
        message: 'Company updated successfully',
        data: company
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCompany(req, res, next) {
    try {
      const { id } = req.params;
      const companyRepository = AppDataSource.getRepository('Company');
      
      await companyRepository.delete(id);

      res.json({
        success: true,
        message: 'Company deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCompanyStats(req, res, next) {
    try {
      res.json({
        success: true,
        message: 'Company stats coming soon'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCompanyUsers(req, res, next) {
    try {
      res.json({
        success: true,
        message: 'Company users coming soon'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCompanyLocations(req, res, next) {
    try {
      res.json({
        success: true,
        message: 'Company locations coming soon'
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCompanySettings(req, res, next) {
    try {
      res.json({
        success: true,
        message: 'Company settings coming soon'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CompanyController;
