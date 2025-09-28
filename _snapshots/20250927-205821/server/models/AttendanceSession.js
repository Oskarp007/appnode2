const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AttendanceSession = sequelize.define('AttendanceSession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  session_name: {
    type: DataTypes.STRING,
    allowNull: false
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
  session_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  monitor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  max_capacity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  session_type: {
    type: DataTypes.ENUM(['regular', 'special', 'makeup', 'canceled']),
    defaultValue: 'regular'
  },
  session_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  weather_conditions: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM(['scheduled', 'in_progress', 'completed', 'canceled']),
    defaultValue: 'scheduled'
  },
  attendance_taken_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  attendance_taken_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  total_enrolled: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_present: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_absent: {
    type: DataTypes.INTEGER,
    defaultValue: 0
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
  tableName: 'attendance_sessions',
  timestamps: true,
  indexes: [
    {
      fields: ['session_date', 'service_type']
    },
    {
      fields: ['monitor_id', 'session_date']
    },
    {
      fields: ['tenant_id', 'service_type', 'session_date']
    },
    {
      fields: ['status', 'session_date']
    }
  ]
});

module.exports = AttendanceSession;
