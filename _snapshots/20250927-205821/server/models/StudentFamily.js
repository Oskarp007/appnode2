const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentFamily = sequelize.define('StudentFamily', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  student_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  relationship: {
    type: DataTypes.ENUM('pare', 'mare', 'tutor', 'avi', 'avia', 'altre'),
    allowNull: false,
    defaultValue: 'pare'
  },
  is_primary_contact: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  can_pickup: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  emergency_contact: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'student_family',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { 
      unique: true, 
      fields: ['student_id', 'user_id'],
      name: 'unique_student_family'
    },
    { fields: ['student_id'] },
    { fields: ['user_id'] },
    { fields: ['is_primary_contact'] }
  ]
});

module.exports = StudentFamily;
