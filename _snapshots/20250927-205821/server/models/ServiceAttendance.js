const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ServiceAttendance = sequelize.define('ServiceAttendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'AttendanceSessions',
      key: 'id'
    }
  },
  enrollment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ServiceEnrollments',
      key: 'id'
    }
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Students',
      key: 'id'
    }
  },
  attendance_status: {
    type: DataTypes.ENUM(['present', 'absent', 'late', 'excused', 'sick', 'early_departure']),
    allowNull: false
  },
  check_in_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  check_out_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  checked_in_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  checked_out_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  pickup_person_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'PersonesAutoritzades',
      key: 'id'
    }
  },
  pickup_person_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pickup_person_dni: {
    type: DataTypes.STRING,
    allowNull: true
  },
  meal_taken: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  meal_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  behavior_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  incident_report: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  medical_incident: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  medical_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  parent_notification_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  parent_notification_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  photos_taken: {
    type: DataTypes.JSON, // Array of photo URLs/paths
    allowNull: true
  },
  activity_participation: {
    type: DataTypes.JSON, // Object with activity ratings/notes
    allowNull: true
  },
  mood_rating: {
    type: DataTypes.INTEGER, // 1-5 scale
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  special_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  sync_status: {
    type: DataTypes.ENUM(['synced', 'pending', 'error']),
    defaultValue: 'pending'
  },
  last_sync_at: {
    type: DataTypes.DATE,
    allowNull: true
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
  tableName: 'service_attendance',
  timestamps: true,
  indexes: [
    {
      fields: ['session_id', 'student_id']
    },
    {
      fields: ['enrollment_id', 'session_id']
    },
    {
      fields: ['student_id', 'attendance_status']
    },
    {
      fields: ['tenant_id', 'session_id']
    },
    {
      fields: ['sync_status', 'last_sync_at']
    },
    {
      unique: true,
      fields: ['session_id', 'student_id'] // Un estudiant només pot tenir una assistència per sessió
    }
  ]
});

module.exports = ServiceAttendance;
