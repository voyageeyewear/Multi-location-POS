const { EntitySchema } = require('typeorm');

const Role = new EntitySchema({
  name: 'Role',
  tableName: 'roles',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },
    name: {
      type: 'varchar',
      length: 100,
      nullable: false,
      unique: true,
    },
    description: {
      type: 'text',
      nullable: true,
    },
    permissions: {
      type: 'jsonb',
      nullable: false,
      default: '{}',
    },
    isSystemRole: {
      type: 'boolean',
      default: false,
    },
    companyId: {
      type: 'uuid',
      nullable: true,
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
      inverseSide: 'role',
    },
    company: {
      target: 'Company',
      type: 'many-to-one',
      joinColumn: { name: 'companyId' },
      nullable: true,
    },
  },
  indices: [
    {
      name: 'IDX_ROLE_NAME',
      columns: ['name'],
    },
    {
      name: 'IDX_ROLE_COMPANY',
      columns: ['companyId'],
    },
    {
      name: 'IDX_ROLE_ACTIVE',
      columns: ['isActive'],
    },
  ],
});

module.exports = Role;
