const { EntitySchema } = require('typeorm');

const Location = new EntitySchema({
  name: 'Location',
  tableName: 'locations',
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
    address: {
      type: 'text',
      nullable: true,
    },
    city: {
      type: 'varchar',
      length: 100,
      nullable: true,
    },
    state: {
      type: 'varchar',
      length: 100,
      nullable: true,
    },
    zipCode: {
      type: 'varchar',
      length: 20,
      nullable: true,
    },
    country: {
      type: 'varchar',
      length: 100,
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
    type: {
      type: 'enum',
      enum: ['store', 'kiosk', 'warehouse', 'office'],
      default: 'store',
    },
    settings: {
      type: 'jsonb',
      nullable: true,
      default: '{}',
    },
    isActive: {
      type: 'boolean',
      default: true,
    },
    companyId: {
      type: 'uuid',
      nullable: false,
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
    company: {
      target: 'Company',
      type: 'many-to-one',
      joinColumn: { name: 'companyId' },
    },
    sales: {
      target: 'Sale',
      type: 'one-to-many',
      inverseSide: 'location',
    },
    userLocations: {
      target: 'UserLocation',
      type: 'one-to-many',
      inverseSide: 'location',
    },
    products: {
      target: 'ProductLocation',
      type: 'one-to-many',
      inverseSide: 'location',
    },
  },
  indices: [
    {
      name: 'IDX_LOCATION_NAME',
      columns: ['name'],
    },
    {
      name: 'IDX_LOCATION_COMPANY',
      columns: ['companyId'],
    },
    {
      name: 'IDX_LOCATION_TYPE',
      columns: ['type'],
    },
    {
      name: 'IDX_LOCATION_ACTIVE',
      columns: ['isActive'],
    },
  ],
});

module.exports = Location;
