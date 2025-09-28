const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'tenants',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('FAMILIA', 'MONITOR', 'ADMIN_CENTRE', 'SUPER_ADMIN'),
    allowNull: false,
    defaultValue: 'FAMILIA'
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [9, 15]
    }
  },
  dni: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: /^[0-9XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i
    }
  },
  school: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  iban: {
    type: DataTypes.STRING(34),
    allowNull: true,
    validate: {
      is: /^ES\d{22}$/
    }
  },
  profile_data: {
    type: DataTypes.JSON,
    defaultValue: {
      preferences: {
        language: 'ca',
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      },
      emergency_contact: null
    }
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
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { 
      unique: true, 
      fields: ['email', 'tenant_id'],
      name: 'unique_email_per_tenant'
    },
    { fields: ['tenant_id'] },
    { fields: ['role'] },
    { fields: ['active'] }
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
    }
  }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toSafeObject = function() {
  const user = this.toJSON();
  delete user.password;
  return user;
};

module.exports = User;
