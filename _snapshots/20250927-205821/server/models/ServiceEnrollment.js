const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ServiceEnrollment = sequelize.define('ServiceEnrollment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Students',
      key: 'id'
    }
  },
  service_type: {
    type: DataTypes.ENUM([
      'menjador', 
      'extraescolars', 
      'acollida_matinal', 
      'acollida_tarda',
      'sortides_pedagogiques',
      'colònies',
      'casals_estiu'
    ]),
    allowNull: false
  },
  enrollment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  days_of_week: {
    type: DataTypes.JSON, // ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    allowNull: false,
    defaultValue: []
  },
  meal_requirements: {
    type: DataTypes.JSON, // { vegetarian: true, allergies: ['nuts', 'gluten'], special_diet: 'celiac' }
    allowNull: true
  },
  pickup_authorization: {
    type: DataTypes.JSON, // Array of authorized person IDs
    allowNull: true
  },
  emergency_contacts: {
    type: DataTypes.JSON, // Emergency contact info specific to this service
    allowNull: true
  },
  special_instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM(['active', 'inactive', 'suspended', 'completed']),
    defaultValue: 'active'
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  payment_status: {
    type: DataTypes.ENUM(['pending', 'paid', 'partial', 'overdue']),
    defaultValue: 'pending'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Tenants',
      key: 'id'
    }
  }
}, {
  tableName: 'service_enrollments',
  timestamps: true,
  indexes: [
    {
      fields: ['student_id', 'service_type', 'start_date']
    },
    {
      fields: ['tenant_id', 'service_type', 'status']
    },
    {
      fields: ['start_date', 'end_date']
    }
  ]
});

module.exports = ServiceEnrollment;
