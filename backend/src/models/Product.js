const { EntitySchema } = require('typeorm');

const Product = new EntitySchema({
  name: 'Product',
  tableName: 'products',
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
    sku: {
      type: 'varchar',
      length: 100,
      nullable: false,
    },
    barcode: {
      type: 'varchar',
      length: 100,
      nullable: true,
    },
    price: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: false,
    },
    cost: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: true,
    },
    category: {
      type: 'varchar',
      length: 100,
      nullable: true,
    },
    brand: {
      type: 'varchar',
      length: 100,
      nullable: true,
    },
    image: {
      type: 'varchar',
      length: 500,
      nullable: true,
    },
    images: {
      type: 'jsonb',
      nullable: true,
      default: '[]',
    },
    attributes: {
      type: 'jsonb',
      nullable: true,
      default: '{}',
    },
    isActive: {
      type: 'boolean',
      default: true,
    },
    isDigital: {
      type: 'boolean',
      default: false,
    },
    trackInventory: {
      type: 'boolean',
      default: true,
    },
    minStockLevel: {
      type: 'integer',
      default: 0,
    },
    shopifyProductId: {
      type: 'bigint',
      nullable: true,
    },
    shopifyVariantId: {
      type: 'bigint',
      nullable: true,
    },
    lastSyncedAt: {
      type: 'timestamp',
      nullable: true,
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
      target: 'SaleItem',
      type: 'one-to-many',
      inverseSide: 'product',
    },
    locations: {
      target: 'ProductLocation',
      type: 'one-to-many',
      inverseSide: 'product',
    },
  },
  indices: [
    {
      name: 'IDX_PRODUCT_SKU',
      columns: ['sku'],
    },
    {
      name: 'IDX_PRODUCT_BARCODE',
      columns: ['barcode'],
    },
    {
      name: 'IDX_PRODUCT_COMPANY',
      columns: ['companyId'],
    },
    {
      name: 'IDX_PRODUCT_CATEGORY',
      columns: ['category'],
    },
    {
      name: 'IDX_PRODUCT_ACTIVE',
      columns: ['isActive'],
    },
    {
      name: 'IDX_PRODUCT_SHOPIFY',
      columns: ['shopifyProductId'],
    },
  ],
});

module.exports = Product;
