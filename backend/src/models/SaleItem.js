const { EntitySchema } = require('typeorm');

const SaleItem = new EntitySchema({
  name: 'SaleItem',
  tableName: 'sale_items',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },
    saleId: {
      type: 'uuid',
      nullable: false,
    },
    productId: {
      type: 'uuid',
      nullable: false,
    },
    quantity: {
      type: 'integer',
      nullable: false,
    },
    unitPrice: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: false,
    },
    totalPrice: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: false,
    },
    discountAmount: {
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
    notes: {
      type: 'text',
      nullable: true,
    },
    createdAt: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    sale: {
      target: 'Sale',
      type: 'many-to-one',
      joinColumn: { name: 'saleId' },
    },
    product: {
      target: 'Product',
      type: 'many-to-one',
      joinColumn: { name: 'productId' },
    },
  },
  indices: [
    {
      name: 'IDX_SALE_ITEM_SALE',
      columns: ['saleId'],
    },
    {
      name: 'IDX_SALE_ITEM_PRODUCT',
      columns: ['productId'],
    },
  ],
});

module.exports = SaleItem;
