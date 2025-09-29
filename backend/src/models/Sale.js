const { EntitySchema } = require('typeorm');

const Sale = new EntitySchema({
  name: 'Sale',
  tableName: 'sales',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },
    orderNumber: {
      type: 'varchar',
      length: 50,
      nullable: false,
      unique: true,
    },
    customerName: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    customerEmail: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    customerPhone: {
      type: 'varchar',
      length: 20,
      nullable: true,
    },
    subtotal: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: false,
      default: 0,
    },
    taxAmount: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: false,
      default: 0,
    },
    discountAmount: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: false,
      default: 0,
    },
    total: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: false,
    },
    paymentMethod: {
      type: 'enum',
      enum: ['cash', 'card', 'online', 'cod', 'other'],
      nullable: false,
    },
    paymentStatus: {
      type: 'enum',
      enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
    },
    status: {
      type: 'enum',
      enum: ['pending', 'completed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    notes: {
      type: 'text',
      nullable: true,
    },
    metadata: {
      type: 'jsonb',
      nullable: true,
      default: '{}',
    },
    userId: {
      type: 'uuid',
      nullable: false,
    },
    locationId: {
      type: 'uuid',
      nullable: false,
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
    user: {
      target: 'User',
      type: 'many-to-one',
      joinColumn: { name: 'userId' },
    },
    location: {
      target: 'Location',
      type: 'many-to-one',
      joinColumn: { name: 'locationId' },
    },
    company: {
      target: 'Company',
      type: 'many-to-one',
      joinColumn: { name: 'companyId' },
    },
    items: {
      target: 'SaleItem',
      type: 'one-to-many',
      inverseSide: 'sale',
    },
  },
  indices: [
    {
      name: 'IDX_SALE_ORDER_NUMBER',
      columns: ['orderNumber'],
    },
    {
      name: 'IDX_SALE_USER',
      columns: ['userId'],
    },
    {
      name: 'IDX_SALE_LOCATION',
      columns: ['locationId'],
    },
    {
      name: 'IDX_SALE_COMPANY',
      columns: ['companyId'],
    },
    {
      name: 'IDX_SALE_STATUS',
      columns: ['status'],
    },
    {
      name: 'IDX_SALE_PAYMENT_STATUS',
      columns: ['paymentStatus'],
    },
    {
      name: 'IDX_SALE_DATE',
      columns: ['createdAt'],
    },
  ],
});

module.exports = Sale;
