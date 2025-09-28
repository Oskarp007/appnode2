const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tenant = sequelize.define('Tenant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      is: /^[a-zA-Z0-9-]+$/,  // Permet lletres, números i guions
      len: [2, 50]
    }
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isUrl: true
    }
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      pricing_config: {},
      services: ['menjador', 'acollida', 'extraescolars'],
      branding: {
        logo: null,
        primary_color: '#3B82F6',
        secondary_color: '#EF4444'
      },
      contact: {
        email: null,
        phone: null,
        address: null
      }
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active'
  },
  subscription_plan: {
    type: DataTypes.ENUM('basic', 'premium', 'enterprise'),
    defaultValue: 'basic'
  },
  max_students: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'tenants',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['slug'] },
    { fields: ['domain'] },
    { fields: ['status'] }
  ]
});

module.exports = Tenant;
