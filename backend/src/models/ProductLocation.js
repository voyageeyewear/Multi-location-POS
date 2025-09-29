const { EntitySchema } = require('typeorm');

const ProductLocation = new EntitySchema({
  name: 'ProductLocation',
  tableName: 'product_locations',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },
    productId: {
      type: 'uuid',
      nullable: false,
    },
    locationId: {
      type: 'uuid',
      nullable: false,
    },
    stock: {
      type: 'integer',
      default: 0,
    },
    reservedStock: {
      type: 'integer',
      default: 0,
    },
    minStockLevel: {
      type: 'integer',
      default: 0,
    },
    maxStockLevel: {
      type: 'integer',
      nullable: true,
    },
    price: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: true,
    },
    isActive: {
      type: 'boolean',
      default: true,
    },
    lastUpdated: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    product: {
      target: 'Product',
      type: 'many-to-one',
      joinColumn: { name: 'productId' },
    },
    location: {
      target: 'Location',
      type: 'many-to-one',
      joinColumn: { name: 'locationId' },
    },
  },
  indices: [
    {
      name: 'IDX_PRODUCT_LOCATION_PRODUCT',
      columns: ['productId'],
    },
    {
      name: 'IDX_PRODUCT_LOCATION_LOCATION',
      columns: ['locationId'],
    },
    {
      name: 'IDX_PRODUCT_LOCATION_UNIQUE',
      columns: ['productId', 'locationId'],
      unique: true,
    },
    {
      name: 'IDX_PRODUCT_LOCATION_ACTIVE',
      columns: ['isActive'],
    },
  ],
});

module.exports = ProductLocation;
