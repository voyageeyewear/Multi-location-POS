const { EntitySchema } = require('typeorm');

const User = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },
    firstName: {
      type: 'varchar',
      length: 100,
      nullable: false,
    },
    lastName: {
      type: 'varchar',
      length: 100,
      nullable: false,
    },
    email: {
      type: 'varchar',
      length: 255,
      nullable: false,
      unique: true,
    },
    password: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    phone: {
      type: 'varchar',
      length: 20,
      nullable: true,
    },
    avatar: {
      type: 'varchar',
      length: 500,
      nullable: true,
    },
    isActive: {
      type: 'boolean',
      default: true,
    },
    lastLoginAt: {
      type: 'timestamp',
      nullable: true,
    },
    emailVerified: {
      type: 'boolean',
      default: false,
    },
    emailVerificationToken: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    passwordResetToken: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    passwordResetExpires: {
      type: 'timestamp',
      nullable: true,
    },
    refreshToken: {
      type: 'varchar',
      length: 500,
      nullable: true,
    },
    roleId: {
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
    role: {
      target: 'Role',
      type: 'many-to-one',
      joinColumn: { name: 'roleId' },
    },
    company: {
      target: 'Company',
      type: 'many-to-one',
      joinColumn: { name: 'companyId' },
    },
    sales: {
      target: 'Sale',
      type: 'one-to-many',
      inverseSide: 'user',
    },
    userLocations: {
      target: 'UserLocation',
      type: 'one-to-many',
      inverseSide: 'user',
    },
  },
  indices: [
    {
      name: 'IDX_USER_EMAIL',
      columns: ['email'],
    },
    {
      name: 'IDX_USER_ROLE',
      columns: ['roleId'],
    },
    {
      name: 'IDX_USER_COMPANY',
      columns: ['companyId'],
    },
    {
      name: 'IDX_USER_ACTIVE',
      columns: ['isActive'],
    },
    {
      name: 'IDX_USER_EMAIL_VERIFICATION',
      columns: ['emailVerificationToken'],
    },
    {
      name: 'IDX_USER_PASSWORD_RESET',
      columns: ['passwordResetToken'],
    },
  ],
});

module.exports = User;
