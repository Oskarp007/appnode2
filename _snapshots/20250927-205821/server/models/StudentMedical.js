const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentMedical = sequelize.define('StudentMedical', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  student_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
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
  // Informació mèdica bàsica
  grup_sanguini: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'desconegut'),
    defaultValue: 'desconegut'
  },
  numero_targeta_sanitaria: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  centre_sanitari_assignat: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  metge_pediatra: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  telefon_urgencies_mediques: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  
  // Al·lèrgies i intoleràncies
  te_allergies: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  allergies_alimentaries: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array amb al·lèrgies alimentàries detallades'
  },
  allergies_medicaments: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array amb al·lèrgies a medicaments'
  },
  allergies_ambientals: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array amb al·lèrgies ambientals (pols, animals, etc.)'
  },
  intolerancies_alimentaries: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array amb intoleràncies alimentàries'
  },
  
  // Medicació habitual
  pren_medicacio_habitual: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  medicacio_detalls: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array amb medicacions: nom, dosi, freqüència, observacions'
  },
  
  // Condicions mèdiques especials
  condicions_mediques: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array amb condicions: asma, diabetis, epilèpsia, etc.'
  },
  necessitats_especials: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Necessitats especials d\'atenció o cura'
  },
  
  // Autoritzacions mèdiques
  autoritzacio_medicacio_escola: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Autorització per administrar medicació a l\'escola'
  },
  autoritzacio_tractament_urgencia: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Autorització per tractament mèdic d\'urgència'
  },
  autoritzacio_activitat_fisica: {
    type: DataTypes.ENUM('sense_limitacions', 'limitacions_lleugeres', 'limitacions_severes', 'prohibida'),
    defaultValue: 'sense_limitacions'
  },
  
  // Dieta i alimentació
  dieta_especial: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  tipus_dieta: {
    type: DataTypes.ENUM('normal', 'vegetariana', 'vegana', 'sense_gluten', 'diabetica', 'hipocalorica', 'altres'),
    defaultValue: 'normal'
  },
  detalls_dieta: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Contactes d'emergència mèdica
  contacte_emergencia_1_nom: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  contacte_emergencia_1_telefon: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  contacte_emergencia_1_relacio: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  contacte_emergencia_2_nom: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  contacte_emergencia_2_telefon: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  contacte_emergencia_2_relacio: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  // Observacions generals
  observacions_generals: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Control d'actualització
  darrera_revisio_medica: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  revisio_per: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  // Metadades
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'student_medical',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['student_id'],
      unique: true
    },
    {
      fields: ['tenant_id']
    },
    {
      fields: ['te_allergies']
    },
    {
      fields: ['pren_medicacio_habitual']
    },
    {
      fields: ['dieta_especial']
    },
    {
      fields: ['darrera_revisio_medica']
    }
  ]
});

// Mètodes d'instància
StudentMedical.prototype.toSafeObject = function() {
  const obj = { ...this.toJSON() };
  
  // Parsejar JSON fields
  try {
    if (obj.allergies_alimentaries) obj.allergies_alimentaries = JSON.parse(obj.allergies_alimentaries);
    if (obj.allergies_medicaments) obj.allergies_medicaments = JSON.parse(obj.allergies_medicaments);
    if (obj.allergies_ambientals) obj.allergies_ambientals = JSON.parse(obj.allergies_ambientals);
    if (obj.intolerancies_alimentaries) obj.intolerancies_alimentaries = JSON.parse(obj.intolerancies_alimentaries);
    if (obj.medicacio_detalls) obj.medicacio_detalls = JSON.parse(obj.medicacio_detalls);
    if (obj.condicions_mediques) obj.condicions_mediques = JSON.parse(obj.condicions_mediques);
  } catch (e) {
    console.error('Error parsing JSON fields in StudentMedical:', e);
  }
  
  return obj;
};

StudentMedical.prototype.hasAllergies = function() {
  return this.te_allergies && (
    this.allergies_alimentaries || 
    this.allergies_medicaments || 
    this.allergies_ambientals
  );
};

StudentMedical.prototype.requiresSpecialAttention = function() {
  return this.te_allergies || 
         this.pren_medicacio_habitual || 
         this.dieta_especial || 
         this.necessitats_especials ||
         this.autoritzacio_activitat_fisica !== 'sense_limitacions';
};

StudentMedical.prototype.getAllergiesList = function() {
  const allergies = [];
  
  try {
    if (this.allergies_alimentaries) {
      allergies.push(...JSON.parse(this.allergies_alimentaries));
    }
    if (this.allergies_medicaments) {
      allergies.push(...JSON.parse(this.allergies_medicaments));
    }
    if (this.allergies_ambientals) {
      allergies.push(...JSON.parse(this.allergies_ambientals));
    }
  } catch (e) {
    console.error('Error parsing allergies:', e);
  }
  
  return allergies;
};

module.exports = StudentMedical;
