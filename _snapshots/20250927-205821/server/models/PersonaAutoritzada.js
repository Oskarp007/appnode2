const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PersonaAutoritzada = sequelize.define('PersonaAutoritzada', {
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
  tenant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'tenants',
      key: 'id'
    }
  },
  nom: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  cognoms: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 150]
    }
  },
  dni_nie: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: {
      args: ['dni_nie', 'tenant_id'],
      msg: 'DNI/NIE ja existeix en aquest centre'
    },
    validate: {
      isDniNieValid(value) {
        const dniRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
        const nieRegex = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
        if (!dniRegex.test(value) && !nieRegex.test(value)) {
          throw new Error('Format DNI/NIE no vàlid');
        }
      }
    }
  },
  telefon_principal: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isNumeric: {
        msg: 'El telèfon ha de contenir només números'
      },
      len: [9, 20]
    }
  },
  telefon_secundari: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      isNumeric: {
        msg: 'El telèfon ha de contenir només números'
      },
      len: [9, 20]
    }
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: {
      isEmail: {
        msg: 'Format email no vàlid'
      }
    }
  },
  relacio_familiar: {
    type: DataTypes.ENUM('pare', 'mare', 'tutor_legal', 'avi_avia', 'oncle_tia', 'germa_germana', 'altres'),
    allowNull: false
  },
  prioritat_contacte: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 10
    }
  },
  autoritzat_recollir: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  autoritzat_decisio_medica: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  foto_autoritzacio_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'URL de la foto per identificació visual'
  },
  observacions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  actiu: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  tableName: 'persones_autoritzades',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['student_id']
    },
    {
      fields: ['tenant_id']
    },
    {
      fields: ['dni_nie', 'tenant_id'],
      unique: true
    },
    {
      fields: ['telefon_principal']
    },
    {
      fields: ['prioritat_contacte']
    },
    {
      fields: ['autoritzat_recollir']
    }
  ]
});

// Mètodes d'instància
PersonaAutoritzada.prototype.toSafeObject = function() {
  const { id, nom, cognoms, dni_nie, telefon_principal, telefon_secundari, 
          email, relacio_familiar, prioritat_contacte, autoritzat_recollir, 
          autoritzat_decisio_medica, foto_autoritzacio_url, observacions, actiu } = this;
  
  return {
    id, nom, cognoms, dni_nie, telefon_principal, telefon_secundari,
    email, relacio_familiar, prioritat_contacte, autoritzat_recollir,
    autoritzat_decisio_medica, foto_autoritzacio_url, observacions, actiu
  };
};

PersonaAutoritzada.prototype.getNomComplet = function() {
  return `${this.nom} ${this.cognoms}`;
};

module.exports = PersonaAutoritzada;
