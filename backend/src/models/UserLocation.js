const { EntitySchema } = require('typeorm');

const UserLocation = new EntitySchema({
  name: 'UserLocation',
  tableName: 'user_locations',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },
    userId: {
      type: 'uuid',
      nullable: false,
    },
    locationId: {
      type: 'uuid',
      nullable: false,
    },
    isPrimary: {
      type: 'boolean',
      default: false,
    },
    permissions: {
      type: 'jsonb',
      nullable: true,
      default: '{}',
    },
    createdAt: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
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
  },
  indices: [
    {
      name: 'IDX_USER_LOCATION_USER',
      columns: ['userId'],
    },
    {
      name: 'IDX_USER_LOCATION_LOCATION',
      columns: ['locationId'],
    },
    {
      name: 'IDX_USER_LOCATION_PRIMARY',
      columns: ['isPrimary'],
    },
    {
      name: 'IDX_USER_LOCATION_UNIQUE',
      columns: ['userId', 'locationId'],
      unique: true,
    },
  ],
});

module.exports = UserLocation;
