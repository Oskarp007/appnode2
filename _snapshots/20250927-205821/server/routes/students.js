const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const Joi = require('joi');
const { Op } = require('sequelize');
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const { Student, PersonaAutoritzada, StudentDocument, StudentMedical, User, Tenant } = require('../models/associations');

const router = express.Router();

// Configuració Multer per upload de documents
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/uploads/documents');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipus de fitxer no permès. Només PDF, JPG, PNG, WEBP.'));
    }
  }
});

// Validadors Joi
const studentCreateSchema = Joi.object({
  first_name: Joi.string().min(1).max(50).required(),
  last_name: Joi.string().min(1).max(50).required(),
  birth_date: Joi.date().iso().max('now').required(),
  class_group: Joi.string().min(1).max(20).required(),
  dni_nie: Joi.string().pattern(/^([0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]|[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE])$/i).optional(),
  nacionalitat: Joi.string().max(100).optional(),
  lloc_naixement: Joi.string().max(200).optional(),
  adreca_completa: Joi.string().optional(),
  codi_postal: Joi.string().max(10).optional(),
  poblacio: Joi.string().max(100).optional(),
  provincia: Joi.string().max(100).optional(),
  curs_actual: Joi.string().max(50).optional(),
  grup_classe: Joi.string().max(20).optional(),
  necessitats_educatives_especials: Joi.boolean().optional(),
  observacions_academiques: Joi.string().optional(),
  te_beca: Joi.boolean().optional(),
  tipus_beca: Joi.string().valid('BC70', 'BC100', 'altres').optional(),
  percentatge_beca: Joi.number().min(0).max(100).optional(),
  // Tutors
  tutors: Joi.array().items(Joi.object({
    nom: Joi.string().min(2).max(100).required(),
    cognoms: Joi.string().min(2).max(150).required(),
    dni_nie: Joi.string().pattern(/^([0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]|[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE])$/i).required(),
    telefon_principal: Joi.string().pattern(/^[0-9]{9,20}$/).required(),
    telefon_secundari: Joi.string().pattern(/^[0-9]{9,20}$/).optional(),
    email: Joi.string().email().optional(),
    relacio_familiar: Joi.string().valid('pare', 'mare', 'tutor_legal', 'avi_avia', 'oncle_tia', 'germa_germana', 'altres').required(),
    prioritat_contacte: Joi.number().min(1).max(10).optional(),
    autoritzat_recollir: Joi.boolean().optional(),
    autoritzat_decisio_medica: Joi.boolean().optional(),
    observacions: Joi.string().optional()
  })).optional()
});

const medicalUpdateSchema = Joi.object({
  grup_sanguini: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'desconegut').optional(),
  numero_targeta_sanitaria: Joi.string().max(50).optional(),
  centre_sanitari_assignat: Joi.string().max(200).optional(),
  metge_pediatra: Joi.string().max(200).optional(),
  telefon_urgencies_mediques: Joi.string().pattern(/^[0-9]{9,20}$/).optional(),
  te_allergies: Joi.boolean().optional(),
  allergies_alimentaries: Joi.array().items(Joi.string()).optional(),
  allergies_medicaments: Joi.array().items(Joi.string()).optional(),
  allergies_ambientals: Joi.array().items(Joi.string()).optional(),
  intolerancies_alimentaries: Joi.array().items(Joi.string()).optional(),
  pren_medicacio_habitual: Joi.boolean().optional(),
  medicacio_detalls: Joi.array().items(Joi.object({
    nom: Joi.string().required(),
    dosi: Joi.string().optional(),
    frequencia: Joi.string().optional(),
    observacions: Joi.string().optional()
  })).optional(),
  condicions_mediques: Joi.array().items(Joi.string()).optional(),
  necessitats_especials: Joi.string().optional(),
  autoritzacio_medicacio_escola: Joi.boolean().optional(),
  autoritzacio_tractament_urgencia: Joi.boolean().optional(),
  autoritzacio_activitat_fisica: Joi.string().valid('sense_limitacions', 'limitacions_lleugeres', 'limitacions_severes', 'prohibida').optional(),
  dieta_especial: Joi.boolean().optional(),
  tipus_dieta: Joi.string().valid('normal', 'vegetariana', 'vegana', 'sense_gluten', 'diabetica', 'hipocalorica', 'altres').optional(),
  detalls_dieta: Joi.string().optional(),
  contacte_emergencia_1_nom: Joi.string().max(200).optional(),
  contacte_emergencia_1_telefon: Joi.string().pattern(/^[0-9]{9,20}$/).optional(),
  contacte_emergencia_1_relacio: Joi.string().max(100).optional(),
  contacte_emergencia_2_nom: Joi.string().max(200).optional(),
  contacte_emergencia_2_telefon: Joi.string().pattern(/^[0-9]{9,20}$/).optional(),
  contacte_emergencia_2_relacio: Joi.string().max(100).optional(),
  observacions_generals: Joi.string().optional()
});

// Middleware per validar accés a estudiant
const validateStudentAccess = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { role, tenantId, userId } = req.user;

    const student = await Student.findOne({
      where: { 
        id: studentId,
        tenant_id: tenantId 
      },
      include: [{
        model: User,
        as: 'families',
        through: { attributes: [] }
      }]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Estudiant no trobat'
      });
    }

    // Si és família, només pot accedir als seus fills
    if (role === 'FAMILIA') {
      const hasAccess = student.families.some(family => family.id === userId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'No tens permisos per accedir a aquest estudiant'
        });
      }
    }

    req.student = student;
    next();
  } catch (error) {
    console.error('Error validating student access:', error);
    res.status(500).json({
      success: false,
      message: 'Error validant accés a estudiant'
    });
  }
};

// POST /api/students - Crear estudiant amb tutors
router.post('/', 
  authenticateToken, 
  checkRole(['SUPER_ADMIN', 'ADMIN_CENTRE', 'COORDINADOR']), 
  async (req, res) => {
    try {
      const { error, value } = studentCreateSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Dades de validació incorrectes',
          errors: error.details.map(detail => detail.message)
        });
      }

      const { tutors, ...studentData } = value;
      studentData.tenant_id = req.user.tenantId;

      // Generar codi estudiant automàtic
      if (!studentData.student_code) {
        const year = new Date().getFullYear().toString().slice(-2);
        const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        studentData.student_code = `EST${year}${randomCode}`;
      }

      // Crear estudiant
      const student = await Student.create(studentData);

      // Crear informació mèdica bàsica
      await StudentMedical.create({
        student_id: student.id,
        tenant_id: req.user.tenantId
      });

      // Crear tutors si n'hi ha
      if (tutors && tutors.length > 0) {
        const tutorsData = tutors.map(tutor => ({
          ...tutor,
          student_id: student.id,
          tenant_id: req.user.tenantId
        }));
        await PersonaAutoritzada.bulkCreate(tutorsData);
      }

      // Retornar estudiant complet
      const studentComplete = await Student.findByPk(student.id, {
        include: [
          {
            model: PersonaAutoritzada,
            as: 'personesAutoritzades'
          },
          {
            model: StudentMedical,
            as: 'medicalInfo'
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Estudiant creat correctament',
        data: studentComplete
      });

    } catch (error) {
      console.error('Error creating student:', error);
      res.status(500).json({
        success: false,
        message: 'Error creant estudiant'
      });
    }
  }
);

// GET /api/students/:id/complete - Obtenir dades completes estudiant
router.get('/:studentId/complete', 
  authenticateToken, 
  validateStudentAccess,
  async (req, res) => {
    try {
      const student = await Student.findByPk(req.params.studentId, {
        include: [
          {
            model: PersonaAutoritzada,
            as: 'personesAutoritzades',
            where: { actiu: true },
            required: false,
            order: [['prioritat_contacte', 'ASC']]
          },
          {
            model: StudentDocument,
            as: 'documents',
            where: { actiu: true },
            required: false,
            include: [{
              model: User,
              as: 'uploader',
              attributes: ['id', 'name', 'email']
            }]
          },
          {
            model: StudentMedical,
            as: 'medicalInfo'
          },
          {
            model: User,
            as: 'families',
            through: { attributes: ['relationship_type', 'is_primary_contact'] },
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      res.json({
        success: true,
        data: student
      });

    } catch (error) {
      console.error('Error fetching complete student:', error);
      res.status(500).json({
        success: false,
        message: 'Error obtenint dades de l\'estudiant'
      });
    }
  }
);

// PUT /api/students/:id/medical - Actualitzar dades mèdiques
router.put('/:studentId/medical', 
  authenticateToken, 
  validateStudentAccess,
  checkRole(['SUPER_ADMIN', 'ADMIN_CENTRE', 'COORDINADOR']),
  async (req, res) => {
    try {
      const { error, value } = medicalUpdateSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Dades de validació incorrectes',
          errors: error.details.map(detail => detail.message)
        });
      }

      // Convertir arrays a JSON strings
      const medicalData = { ...value };
      ['allergies_alimentaries', 'allergies_medicaments', 'allergies_ambientals', 
       'intolerancies_alimentaries', 'medicacio_detalls', 'condicions_mediques'].forEach(field => {
        if (medicalData[field]) {
          medicalData[field] = JSON.stringify(medicalData[field]);
        }
      });

      medicalData.darrera_revisio_medica = new Date();
      medicalData.revisio_per = req.user.userId;

      const [medicalInfo, created] = await StudentMedical.findOrCreate({
        where: { 
          student_id: req.params.studentId,
          tenant_id: req.user.tenantId
        },
        defaults: medicalData
      });

      if (!created) {
        await medicalInfo.update(medicalData);
      }

      res.json({
        success: true,
        message: 'Dades mèdiques actualitzades correctament',
        data: medicalInfo.toSafeObject()
      });

    } catch (error) {
      console.error('Error updating medical data:', error);
      res.status(500).json({
        success: false,
        message: 'Error actualitzant dades mèdiques'
      });
    }
  }
);

// POST /api/students/:id/documents - Upload documents
router.post('/:studentId/documents', 
  authenticateToken, 
  validateStudentAccess,
  checkRole(['SUPER_ADMIN', 'ADMIN_CENTRE', 'COORDINADOR', 'FAMILIA']),
  upload.single('document'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Cap document seleccionat'
        });
      }

      const { tipus_document, descripcio, data_caducitat } = req.body;

      if (!tipus_document) {
        return res.status(400).json({
          success: false,
          message: 'Tipus de document requerit'
        });
      }

      // Calcular hash del fitxer
      const fileBuffer = await fs.readFile(req.file.path);
      const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      // Verificar si ja existeix un document amb el mateix hash
      const existingDoc = await StudentDocument.findOne({
        where: { hash_fitxer: hash }
      });

      if (existingDoc) {
        // Eliminar fitxer duplicat
        await fs.unlink(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'Aquest document ja existeix al sistema'
        });
      }

      const documentData = {
        student_id: req.params.studentId,
        tenant_id: req.user.tenantId,
        uploaded_by: req.user.userId,
        tipus_document,
        nom_fitxer: req.file.filename,
        nom_original: req.file.originalname,
        ruta_fitxer: req.file.path,
        mida_bytes: req.file.size,
        tipus_mime: req.file.mimetype,
        hash_fitxer: hash,
        descripcio: descripcio || null,
        data_caducitat: data_caducitat || null,
        visible_familia: req.user.role === 'FAMILIA' ? true : (req.body.visible_familia !== 'false')
      };

      const document = await StudentDocument.create(documentData);

      res.status(201).json({
        success: true,
        message: 'Document carregat correctament',
        data: document.toSafeObject()
      });

    } catch (error) {
      console.error('Error uploading document:', error);
      // Netejar fitxer en cas d'error
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting file after failed upload:', unlinkError);
        }
      }
      res.status(500).json({
        success: false,
        message: 'Error carregant document'
      });
    }
  }
);

// POST /api/students/:id/tutors - Afegir tutor autoritzat
router.post('/:studentId/tutors', 
  authenticateToken, 
  validateStudentAccess,
  checkRole(['SUPER_ADMIN', 'ADMIN_CENTRE', 'COORDINADOR']),
  async (req, res) => {
    try {
      const tutorSchema = Joi.object({
        nom: Joi.string().min(2).max(100).required(),
        cognoms: Joi.string().min(2).max(150).required(),
        dni_nie: Joi.string().pattern(/^([0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]|[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE])$/i).required(),
        telefon_principal: Joi.string().pattern(/^[0-9]{9,20}$/).required(),
        telefon_secundari: Joi.string().pattern(/^[0-9]{9,20}$/).optional(),
        email: Joi.string().email().optional(),
        relacio_familiar: Joi.string().valid('pare', 'mare', 'tutor_legal', 'avi_avia', 'oncle_tia', 'germa_germana', 'altres').required(),
        prioritat_contacte: Joi.number().min(1).max(10).optional(),
        autoritzat_recollir: Joi.boolean().optional(),
        autoritzat_decisio_medica: Joi.boolean().optional(),
        observacions: Joi.string().optional()
      });

      const { error, value } = tutorSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Dades de validació incorrectes',
          errors: error.details.map(detail => detail.message)
        });
      }

      // Verificar DNI únic per tenant
      const existingTutor = await PersonaAutoritzada.findOne({
        where: {
          dni_nie: value.dni_nie,
          tenant_id: req.user.tenantId
        }
      });

      if (existingTutor) {
        return res.status(400).json({
          success: false,
          message: 'Ja existeix una persona autoritzada amb aquest DNI/NIE'
        });
      }

      const tutorData = {
        ...value,
        student_id: req.params.studentId,
        tenant_id: req.user.tenantId
      };

      const tutor = await PersonaAutoritzada.create(tutorData);

      res.status(201).json({
        success: true,
        message: 'Tutor afegit correctament',
        data: tutor.toSafeObject()
      });

    } catch (error) {
      console.error('Error adding tutor:', error);
      res.status(500).json({
        success: false,
        message: 'Error afegint tutor'
      });
    }
  }
);

// DELETE /api/students/:id/tutors/:tutorId - Eliminar tutor
router.delete('/:studentId/tutors/:tutorId', 
  authenticateToken, 
  validateStudentAccess,
  checkRole(['SUPER_ADMIN', 'ADMIN_CENTRE', 'COORDINADOR']),
  async (req, res) => {
    try {
      const tutor = await PersonaAutoritzada.findOne({
        where: {
          id: req.params.tutorId,
          student_id: req.params.studentId,
          tenant_id: req.user.tenantId
        }
      });

      if (!tutor) {
        return res.status(404).json({
          success: false,
          message: 'Tutor no trobat'
        });
      }

      // Soft delete
      await tutor.update({ actiu: false });

      res.json({
        success: true,
        message: 'Tutor eliminat correctament'
      });

    } catch (error) {
      console.error('Error deleting tutor:', error);
      res.status(500).json({
        success: false,
        message: 'Error eliminant tutor'
      });
    }
  }
);

// GET /api/students/by-tenant/:tenantSlug - Llistat estudiants per centre amb paginació
router.get('/by-tenant/:tenantSlug', 
  authenticateToken,
  async (req, res) => {
    try {
      const { tenantSlug } = req.params;
      const { page = 1, limit = 20, search, class_group, status, has_special_needs } = req.query;

      // Verificar accés al tenant
      if (req.user.role !== 'SUPER_ADMIN') {
        const tenant = await Tenant.findOne({ where: { slug: tenantSlug } });
        if (!tenant || tenant.id !== req.user.tenantId) {
          return res.status(403).json({
            success: false,
            message: 'No tens permisos per accedir a aquest centre'
          });
        }
      }

      const tenant = await Tenant.findOne({ where: { slug: tenantSlug } });
      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Centre no trobat'
        });
      }

      // Construir filtres
      const where = { tenant_id: tenant.id };
      
      if (search) {
        where[Op.or] = [
          { first_name: { [Op.like]: `%${search}%` } },
          { last_name: { [Op.like]: `%${search}%` } },
          { student_code: { [Op.like]: `%${search}%` } }
        ];
      }

      if (class_group) where.class_group = class_group;
      if (status) where.status = status;
      if (has_special_needs !== undefined) where.necessitats_educatives_especials = has_special_needs === 'true';

      // Si és família, només els seus fills
      let familyStudentIds = [];
      if (req.user.role === 'FAMILIA') {
        const user = await User.findByPk(req.user.userId, {
          include: [{
            model: Student,
            as: 'children',
            attributes: ['id']
          }]
        });
        familyStudentIds = user.children.map(child => child.id);
        where.id = { [Op.in]: familyStudentIds };
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { count, rows: students } = await Student.findAndCountAll({
        where,
        include: [
          {
            model: PersonaAutoritzada,
            as: 'personesAutoritzades',
            where: { actiu: true },
            required: false,
            limit: 2,
            order: [['prioritat_contacte', 'ASC']]
          },
          {
            model: StudentMedical,
            as: 'medicalInfo',
            attributes: ['te_allergies', 'pren_medicacio_habitual', 'dieta_especial', 'necessitats_especials']
          }
        ],
        limit: parseInt(limit),
        offset,
        order: [['last_name', 'ASC'], ['first_name', 'ASC']]
      });

      res.json({
        success: true,
        data: {
          students,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / parseInt(limit))
          }
        }
      });

    } catch (error) {
      console.error('Error fetching students by tenant:', error);
      res.status(500).json({
        success: false,
        message: 'Error obtenint estudiants'
      });
    }
  }
);

module.exports = router;
