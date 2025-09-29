const { EntitySchema } = require('typeorm');

const Report = new EntitySchema({
  name: 'Report',
  tableName: 'reports',
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
    type: {
      type: 'enum',
      enum: ['sales', 'inventory', 'customer', 'financial', 'custom'],
      nullable: false,
    },
    format: {
      type: 'enum',
      enum: ['pdf', 'excel', 'csv', 'json'],
      nullable: false,
    },
    status: {
      type: 'enum',
      enum: ['pending', 'generating', 'completed', 'failed'],
      default: 'pending',
    },
    parameters: {
      type: 'jsonb',
      nullable: true,
      default: '{}',
    },
    filePath: {
      type: 'varchar',
      length: 500,
      nullable: true,
    },
    fileSize: {
      type: 'bigint',
      nullable: true,
    },
    generatedBy: {
      type: 'uuid',
      nullable: false,
    },
    companyId: {
      type: 'uuid',
      nullable: false,
    },
    expiresAt: {
      type: 'timestamp',
      nullable: true,
    },
    createdAt: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
    completedAt: {
      type: 'timestamp',
      nullable: true,
    },
  },
  relations: {
    user: {
      target: 'User',
      type: 'many-to-one',
      joinColumn: { name: 'generatedBy' },
    },
    company: {
      target: 'Company',
      type: 'many-to-one',
      joinColumn: { name: 'companyId' },
    },
  },
  indices: [
    {
      name: 'IDX_REPORT_TYPE',
      columns: ['type'],
    },
    {
      name: 'IDX_REPORT_STATUS',
      columns: ['status'],
    },
    {
      name: 'IDX_REPORT_COMPANY',
      columns: ['companyId'],
    },
    {
      name: 'IDX_REPORT_GENERATED_BY',
      columns: ['generatedBy'],
    },
    {
      name: 'IDX_REPORT_DATE',
      columns: ['createdAt'],
    },
  ],
});

module.exports = Report;
