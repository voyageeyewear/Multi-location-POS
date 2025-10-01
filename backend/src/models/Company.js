const { EntitySchema } = require('typeorm');

const Company = new EntitySchema({
  name: 'Company',
  tableName: 'companies',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },
    name: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    description: {
      type: 'text',
      nullable: true,
    },
    address: {
      type: 'text',
      nullable: true,
    },
    phone: {
      type: 'varchar',
      length: 20,
      nullable: true,
    },
    email: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    website: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    logo: {
      type: 'varchar',
      length: 500,
      nullable: true,
    },
    settings: {
      type: 'jsonb',
      nullable: true,
      default: '{}',
    },
    gstin: {
      type: 'varchar',
      length: 15,
      nullable: true,
    },
    stateName: {
      type: 'varchar',
      length: 100,
      nullable: true,
    },
    stateCode: {
      type: 'varchar',
      length: 2,
      nullable: true,
    },
    cgstRate: {
      type: 'decimal',
      precision: 5,
      scale: 2,
      nullable: true,
      default: 9.00,
    },
    sgstRate: {
      type: 'decimal',
      precision: 5,
      scale: 2,
      nullable: true,
      default: 9.00,
    },
    isActive: {
      type: 'boolean',
      default: true,
    },
    createdAt: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
    updatedAt: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      onUpdate: 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    users: {
      target: 'User',
      type: 'one-to-many',
      inverseSide: 'company',
    },
    products: {
      target: 'Product',
      type: 'one-to-many',
      inverseSide: 'company',
    },
    locations: {
      target: 'Location',
      type: 'one-to-many',
      inverseSide: 'company',
    },
    sales: {
      target: 'Sale',
      type: 'one-to-many',
      inverseSide: 'company',
    },
    backups: {
      target: 'Backup',
      type: 'one-to-many',
      inverseSide: 'company',
    },
  },
  indices: [
    {
      name: 'IDX_COMPANY_NAME',
      columns: ['name'],
    },
    {
      name: 'IDX_COMPANY_EMAIL',
      columns: ['email'],
    },
    {
      name: 'IDX_COMPANY_ACTIVE',
      columns: ['isActive'],
    },
  ],
});

module.exports = Company;
