const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentDocument = sequelize.define('StudentDocument', {
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
  uploaded_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  tipus_document: {
    type: DataTypes.ENUM(
      'dni_nie_estudiant',
      'llibre_familia', 
      'targeta_sanitaria',
      'autoritzacio_imatge',
      'autoritzacio_sortides',
      'informe_medic',
      'certificat_medicament',
      'altres_documents'
    ),
    allowNull: false
  },
  nom_fitxer: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nom_original: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  ruta_fitxer: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Ruta completa al sistema de fitxers o URL cloud storage'
  },
  mida_bytes: {
    type: DataTypes.BIGINT,
    allowNull: false,
    validate: {
      min: 1,
      max: 10485760 // 10MB màxim
    }
  },
  tipus_mime: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isIn: [['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']]
    }
  },
  hash_fitxer: {
    type: DataTypes.STRING(64),
    allowNull: false,
    comment: 'SHA-256 hash per verificació integritat'
  },
  descripcio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  data_caducitat: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Data caducitat per documents amb validesa temporal'
  },
  estat_verificacio: {
    type: DataTypes.ENUM('pendent', 'verificat', 'rebutjat'),
    defaultValue: 'pendent'
  },
  verificat_per: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  data_verificacio: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes_verificacio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  visible_familia: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si la família pot veure aquest document'
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
  tableName: 'student_documents',
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
      fields: ['tipus_document']
    },
    {
      fields: ['estat_verificacio']
    },
    {
      fields: ['data_caducitat']
    },
    {
      fields: ['hash_fitxer'],
      unique: true
    },
    {
      fields: ['uploaded_by']
    },
    {
      fields: ['visible_familia']
    }
  ]
});

// Mètodes d'instància
StudentDocument.prototype.toSafeObject = function() {
  const { id, student_id, tipus_document, nom_fitxer, nom_original, 
          mida_bytes, tipus_mime, descripcio, data_caducitat, 
          estat_verificacio, notes_verificacio, visible_familia, 
          actiu, created_at, updated_at } = this;
  
  return {
    id, student_id, tipus_document, nom_fitxer, nom_original, 
    mida_bytes, tipus_mime, descripcio, data_caducitat,
    estat_verificacio, notes_verificacio, visible_familia,
    actiu, created_at, updated_at
  };
};

StudentDocument.prototype.isExpired = function() {
  if (!this.data_caducitat) return false;
  return new Date(this.data_caducitat) < new Date();
};

StudentDocument.prototype.getDaysUntilExpiry = function() {
  if (!this.data_caducitat) return null;
  const today = new Date();
  const expiryDate = new Date(this.data_caducitat);
  const diffTime = expiryDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

module.exports = StudentDocument;
