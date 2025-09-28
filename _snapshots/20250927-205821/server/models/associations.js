const Tenant = require('./Tenant');
const User = require('./User');
const Student = require('./Student');
const StudentFamily = require('./StudentFamily');
const PersonaAutoritzada = require('./PersonaAutoritzada');
const StudentDocument = require('./StudentDocument');
const StudentMedical = require('./StudentMedical');

// Definir les associacions entre models

// Tenant - Users (un tenant té molts usuaris)
Tenant.hasMany(User, {
  foreignKey: 'tenant_id',
  as: 'users',
  onDelete: 'CASCADE'
});

User.belongsTo(Tenant, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

// Tenant - Students (un tenant té molts estudiants)
Tenant.hasMany(Student, {
  foreignKey: 'tenant_id',
  as: 'students',
  onDelete: 'CASCADE'
});

Student.belongsTo(Tenant, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

// User - Students (relació many-to-many a través de StudentFamily)
User.belongsToMany(Student, {
  through: StudentFamily,
  foreignKey: 'user_id',
  otherKey: 'student_id',
  as: 'children'
});

Student.belongsToMany(User, {
  through: StudentFamily,
  foreignKey: 'student_id',
  otherKey: 'user_id',
  as: 'families'
});

// Associacions directes amb StudentFamily per accés detallat
User.hasMany(StudentFamily, {
  foreignKey: 'user_id',
  as: 'studentRelationships'
});

Student.hasMany(StudentFamily, {
  foreignKey: 'student_id',
  as: 'familyRelationships'
});

StudentFamily.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'family'
});

StudentFamily.belongsTo(Student, {
  foreignKey: 'student_id',
  as: 'student'
});

// Associacions PersonaAutoritzada
Student.hasMany(PersonaAutoritzada, {
  foreignKey: 'student_id',
  as: 'personesAutoritzades',
  onDelete: 'CASCADE'
});

PersonaAutoritzada.belongsTo(Student, {
  foreignKey: 'student_id',
  as: 'student'
});

PersonaAutoritzada.belongsTo(Tenant, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

// Associacions StudentDocument
Student.hasMany(StudentDocument, {
  foreignKey: 'student_id',
  as: 'documents',
  onDelete: 'CASCADE'
});

StudentDocument.belongsTo(Student, {
  foreignKey: 'student_id',
  as: 'student'
});

StudentDocument.belongsTo(Tenant, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

StudentDocument.belongsTo(User, {
  foreignKey: 'uploaded_by',
  as: 'uploader'
});

StudentDocument.belongsTo(User, {
  foreignKey: 'verificat_per',
  as: 'verifier'
});

// Associacions StudentMedical (1:1)
Student.hasOne(StudentMedical, {
  foreignKey: 'student_id',
  as: 'medicalInfo',
  onDelete: 'CASCADE'
});

StudentMedical.belongsTo(Student, {
  foreignKey: 'student_id',
  as: 'student'
});

StudentMedical.belongsTo(Tenant, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

StudentMedical.belongsTo(User, {
  foreignKey: 'revisio_per',
  as: 'reviewer'
});

module.exports = {
  Tenant,
  User,
  Student,
  StudentFamily,
  PersonaAutoritzada,
  StudentDocument,
  StudentMedical
};
