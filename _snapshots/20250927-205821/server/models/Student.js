const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Student = sequelize.define('Student', {
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
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      isBefore: new Date().toISOString().split('T')[0]
    }
  },
  class_group: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 20]
    }
  },
  photo_url: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'graduated'),
    defaultValue: 'active'
  },
  student_code: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  medical_info: {
    type: DataTypes.JSON,
    defaultValue: {
      allergies: [],
      medications: [],
      emergency_contact: null,
      special_needs: null,
      dietary_restrictions: []
    }
  },
  academic_year: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      // Any acadèmic comença al setembre
      return month >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
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
  tableName: 'students',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['tenant_id'] },
    { fields: ['class_group'] },
    { fields: ['status'] },
    { fields: ['academic_year'] },
    { fields: ['student_code'] }
  ],
  hooks: {
    beforeCreate: async (student) => {
      if (!student.student_code) {
        // Generar codi estudiant únic
        const year = new Date().getFullYear().toString().substr(-2);
        const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
        student.student_code = `EST${year}${random}`;
      }
    }
  }
});

// Virtual field per nom complet
Student.prototype.getFullName = function() {
  return `${this.first_name} ${this.last_name}`;
};

// Virtual field per calcular edat
Student.prototype.getAge = function() {
  const today = new Date();
  const birthDate = new Date(this.birth_date);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

module.exports = Student;
