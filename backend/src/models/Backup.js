const { EntitySchema } = require('typeorm');

const Backup = new EntitySchema({
  name: 'Backup',
  tableName: 'backups',
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
      enum: ['full', 'incremental', 'data_export'],
      nullable: false,
    },
    format: {
      type: 'enum',
      enum: ['json', 'sql', 'excel', 'csv'],
      nullable: false,
    },
    status: {
      type: 'enum',
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
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
    description: {
      type: 'text',
      nullable: true,
    },
    metadata: {
      type: 'jsonb',
      nullable: true,
      default: '{}',
    },
    createdBy: {
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
    completedAt: {
      type: 'timestamp',
      nullable: true,
    },
  },
  relations: {
    user: {
      target: 'User',
      type: 'many-to-one',
      joinColumn: { name: 'createdBy' },
    },
    company: {
      target: 'Company',
      type: 'many-to-one',
      joinColumn: { name: 'companyId' },
    },
  },
  indices: [
    {
      name: 'IDX_BACKUP_TYPE',
      columns: ['type'],
    },
    {
      name: 'IDX_BACKUP_STATUS',
      columns: ['status'],
    },
    {
      name: 'IDX_BACKUP_COMPANY',
      columns: ['companyId'],
    },
    {
      name: 'IDX_BACKUP_CREATED_BY',
      columns: ['createdBy'],
    },
    {
      name: 'IDX_BACKUP_DATE',
      columns: ['createdAt'],
    },
  ],
});

module.exports = Backup;
