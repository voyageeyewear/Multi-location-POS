require('reflect-metadata');
require('dotenv').config();

const bcrypt = require('bcryptjs');
const AppDataSource = require('../config/database');

const seedDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    const companyRepository = AppDataSource.getRepository('Company');
    const roleRepository = AppDataSource.getRepository('Role');
    const userRepository = AppDataSource.getRepository('User');
    const locationRepository = AppDataSource.getRepository('Location');
    const productRepository = AppDataSource.getRepository('Product');
    const productLocationRepository = AppDataSource.getRepository('ProductLocation');

    // Create default company
    let company = await companyRepository.findOne({ where: { name: 'Default Company' } });
    if (!company) {
      company = companyRepository.create({
        name: 'Default Company',
        description: 'Default company for POS system',
        address: '123 Main Street, City, State 12345',
        phone: '+1-555-0123',
        email: 'admin@defaultcompany.com',
        website: 'https://defaultcompany.com',
        settings: {
          currency: 'USD',
          timezone: 'America/New_York',
          dateFormat: 'MM/DD/YYYY',
          taxRate: 0.08
        }
      });
      company = await companyRepository.save(company);
      console.log('✅ Default company created');
    }

    // Create default roles
    const roles = [
      {
        name: 'super_admin',
        description: 'Super Administrator with full system access',
        permissions: {
          users: { create: true, read: true, update: true, delete: true },
          companies: { create: true, read: true, update: true, delete: true },
          roles: { create: true, read: true, update: true, delete: true },
          products: { create: true, read: true, update: true, delete: true },
          locations: { create: true, read: true, update: true, delete: true },
          sales: { create: true, read: true, update: true, delete: true },
          reports: { create: true, read: true, update: true, delete: true },
          backups: { create: true, read: true, update: true, delete: true }
        },
        isSystemRole: true
      },
      {
        name: 'admin',
        description: 'Company Administrator',
        permissions: {
          users: { create: true, read: true, update: true, delete: false },
          products: { create: true, read: true, update: true, delete: true },
          locations: { create: true, read: true, update: true, delete: true },
          sales: { create: true, read: true, update: true, delete: true },
          reports: { create: true, read: true, update: true, delete: true },
          backups: { create: true, read: true, update: false, delete: false }
        },
        isSystemRole: false,
        companyId: company.id
      },
      {
        name: 'manager',
        description: 'Store Manager',
        permissions: {
          products: { create: false, read: true, update: true, delete: false },
          locations: { create: false, read: true, update: true, delete: false },
          sales: { create: true, read: true, update: true, delete: false },
          reports: { create: false, read: true, update: false, delete: false }
        },
        isSystemRole: false,
        companyId: company.id
      },
      {
        name: 'cashier',
        description: 'Cashier/Client',
        permissions: {
          products: { create: false, read: true, update: false, delete: false },
          locations: { create: false, read: true, update: false, delete: false },
          sales: { create: true, read: true, update: false, delete: false },
          reports: { create: false, read: false, update: false, delete: false }
        },
        isSystemRole: false,
        companyId: company.id
      }
    ];

    const createdRoles = {};
    for (const roleData of roles) {
      let role = await roleRepository.findOne({ where: { name: roleData.name } });
      if (!role) {
        role = roleRepository.create(roleData);
        role = await roleRepository.save(role);
        console.log(`✅ Role '${roleData.name}' created`);
      }
      createdRoles[roleData.name] = role;
    }

    // Create default super admin user
    let superAdmin = await userRepository.findOne({ where: { email: 'superadmin@possystem.com' } });
    if (!superAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      superAdmin = userRepository.create({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@possystem.com',
        password: hashedPassword,
        phone: '+1-555-0001',
        roleId: createdRoles.super_admin.id,
        companyId: company.id,
        emailVerified: true
      });
      superAdmin = await userRepository.save(superAdmin);
      console.log('✅ Super admin user created');
    }

    // Create default admin user
    let admin = await userRepository.findOne({ where: { email: 'admin@defaultcompany.com' } });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      admin = userRepository.create({
        firstName: 'Company',
        lastName: 'Admin',
        email: 'admin@defaultcompany.com',
        password: hashedPassword,
        phone: '+1-555-0002',
        roleId: createdRoles.admin.id,
        companyId: company.id,
        emailVerified: true
      });
      admin = await userRepository.save(admin);
      console.log('✅ Company admin user created');
    }

    // Create default locations
    const locations = [
      {
        name: 'Main Store',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        phone: '+1-555-0101',
        email: 'main@defaultcompany.com',
        type: 'store'
      },
      {
        name: 'Mall Kiosk',
        address: '456 Mall Drive',
        city: 'New York',
        state: 'NY',
        zipCode: '10002',
        country: 'USA',
        phone: '+1-555-0102',
        email: 'mall@defaultcompany.com',
        type: 'kiosk'
      },
      {
        name: 'Warehouse',
        address: '789 Industrial Blvd',
        city: 'New York',
        state: 'NY',
        zipCode: '10003',
        country: 'USA',
        phone: '+1-555-0103',
        email: 'warehouse@defaultcompany.com',
        type: 'warehouse'
      }
    ];

    const createdLocations = {};
    for (const locationData of locations) {
      let location = await locationRepository.findOne({ 
        where: { name: locationData.name, companyId: company.id } 
      });
      if (!location) {
        location = locationRepository.create({
          ...locationData,
          companyId: company.id
        });
        location = await locationRepository.save(location);
        console.log(`✅ Location '${locationData.name}' created`);
      }
      createdLocations[locationData.name] = location;
    }

    // Create default products
    const products = [
      {
        name: 'Premium Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        sku: 'PWH-001',
        barcode: '1234567890123',
        price: 299.99,
        cost: 150.00,
        category: 'Electronics',
        brand: 'TechBrand',
        trackInventory: true,
        minStockLevel: 5
      },
      {
        name: 'Smart Watch Series 5',
        description: 'Latest smartwatch with health monitoring features',
        sku: 'SWS-005',
        barcode: '1234567890124',
        price: 399.99,
        cost: 200.00,
        category: 'Electronics',
        brand: 'TechBrand',
        trackInventory: true,
        minStockLevel: 3
      },
      {
        name: 'Bluetooth Speaker',
        description: 'Portable Bluetooth speaker with 360-degree sound',
        sku: 'BTS-003',
        barcode: '1234567890125',
        price: 129.99,
        cost: 65.00,
        category: 'Electronics',
        brand: 'SoundTech',
        trackInventory: true,
        minStockLevel: 10
      },
      {
        name: 'USB-C Cable 6ft',
        description: 'High-speed USB-C cable for charging and data transfer',
        sku: 'UCC-6FT',
        barcode: '1234567890126',
        price: 24.99,
        cost: 8.00,
        category: 'Accessories',
        brand: 'CablePro',
        trackInventory: true,
        minStockLevel: 20
      },
      {
        name: 'Phone Case - Clear',
        description: 'Transparent protective case for various phone models',
        sku: 'PC-CLR-UNI',
        barcode: '1234567890127',
        price: 19.99,
        cost: 6.00,
        category: 'Accessories',
        brand: 'CaseGuard',
        trackInventory: true,
        minStockLevel: 15
      }
    ];

    const createdProducts = {};
    for (const productData of products) {
      let product = await productRepository.findOne({ 
        where: { sku: productData.sku, companyId: company.id } 
      });
      if (!product) {
        product = productRepository.create({
          ...productData,
          companyId: company.id
        });
        product = await productRepository.save(product);
        console.log(`✅ Product '${productData.name}' created`);

        // Create product location entries
        for (const locationName of Object.keys(createdLocations)) {
          const location = createdLocations[locationName];
          let productLocation = await productLocationRepository.findOne({
            where: { productId: product.id, locationId: location.id }
          });

          if (!productLocation) {
            const stock = locationName === 'Warehouse' ? 100 : 
                         locationName === 'Main Store' ? 50 : 25;
            
            productLocation = productLocationRepository.create({
              productId: product.id,
              locationId: location.id,
              stock: stock,
              minStockLevel: product.minStockLevel,
              maxStockLevel: stock * 2,
              price: product.price
            });
            await productLocationRepository.save(productLocation);
          }
        }
      }
      createdProducts[productData.sku] = product;
    }

    // Create sample cashier user
    let cashier = await userRepository.findOne({ where: { email: 'cashier@defaultcompany.com' } });
    if (!cashier) {
      const hashedPassword = await bcrypt.hash('cashier123', 12);
      cashier = userRepository.create({
        firstName: 'John',
        lastName: 'Cashier',
        email: 'cashier@defaultcompany.com',
        password: hashedPassword,
        phone: '+1-555-0003',
        roleId: createdRoles.cashier.id,
        companyId: company.id,
        emailVerified: true
      });
      cashier = await userRepository.save(cashier);
      console.log('✅ Cashier user created');
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Default Login Credentials:');
    console.log('Super Admin: superadmin@possystem.com / admin123');
    console.log('Company Admin: admin@defaultcompany.com / admin123');
    console.log('Cashier: cashier@defaultcompany.com / cashier123');
    console.log('\n🏢 Company: Default Company');
    console.log('📍 Locations: Main Store, Mall Kiosk, Warehouse');
    console.log('📦 Products: 5 sample products with inventory');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await AppDataSource.destroy();
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
