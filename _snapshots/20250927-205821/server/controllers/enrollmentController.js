const { ServiceEnrollment, AttendanceSession, ServiceAttendance, Student, User, PersonaAutoritzada } = require('../models');
const { Op } = require('sequelize');

// Crear una nova inscripció a un servei
const createEnrollment = async (req, res) => {
  try {
    const {
      student_id,
      service_type,
      start_date,
      end_date,
      days_of_week,
      meal_requirements,
      pickup_authorization,
      emergency_contacts,
      special_instructions,
      cost
    } = req.body;

    const enrollment = await ServiceEnrollment.create({
      student_id,
      service_type,
      start_date,
      end_date,
      days_of_week,
      meal_requirements,
      pickup_authorization,
      emergency_contacts,
      special_instructions,
      cost,
      created_by: req.user.id,
      tenant_id: req.user.tenant_id
    });

    // Retornar amb dades relacionades
    const enrollmentWithData = await ServiceEnrollment.findByPk(enrollment.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'nom', 'cognoms', 'data_naixement']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: enrollmentWithData,
      message: 'Inscripció creada correctament'
    });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creant la inscripció',
      error: error.message
    });
  }
};

// Obtenir inscripcions amb filtres
const getEnrollments = async (req, res) => {
  try {
    const {
      student_id,
      service_type,
      status,
      active_only,
      start_date,
      end_date,
      page = 1,
      limit = 20
    } = req.query;

    const whereClause = {
      tenant_id: req.user.tenant_id
    };

    if (student_id) whereClause.student_id = student_id;
    if (service_type) whereClause.service_type = service_type;
    if (status) whereClause.status = status;
    
    if (active_only === 'true') {
      whereClause.status = 'active';
      whereClause[Op.or] = [
        { end_date: null },
        { end_date: { [Op.gte]: new Date() } }
      ];
    }

    if (start_date && end_date) {
      whereClause[Op.and] = [
        { start_date: { [Op.lte]: end_date } },
        {
          [Op.or]: [
            { end_date: null },
            { end_date: { [Op.gte]: start_date } }
          ]
        }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await ServiceEnrollment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'nom', 'cognoms', 'data_naixement', 'curs', 'grup']
        }
      ],
      order: [['start_date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Error obtenint inscripcions',
      error: error.message
    });
  }
};

// Actualitzar inscripció
const updateEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const enrollment = await ServiceEnrollment.findOne({
      where: {
        id,
        tenant_id: req.user.tenant_id
      }
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Inscripció no trobada'
      });
    }

    await enrollment.update(updateData);

    const updatedEnrollment = await ServiceEnrollment.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'nom', 'cognoms', 'data_naixement']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedEnrollment,
      message: 'Inscripció actualitzada correctament'
    });
  } catch (error) {
    console.error('Error updating enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualitzant la inscripció',
      error: error.message
    });
  }
};

// Obtenir estadístiques d'inscripcions
const getEnrollmentStats = async (req, res) => {
  try {
    const { service_type, start_date, end_date } = req.query;

    const whereClause = {
      tenant_id: req.user.tenant_id
    };

    if (service_type) whereClause.service_type = service_type;

    if (start_date && end_date) {
      whereClause[Op.and] = [
        { start_date: { [Op.lte]: end_date } },
        {
          [Op.or]: [
            { end_date: null },
            { end_date: { [Op.gte]: start_date } }
          ]
        }
      ];
    }

    // Estadístiques per servei
    const serviceStats = await ServiceEnrollment.findAll({
      where: whereClause,
      attributes: [
        'service_type',
        [ServiceEnrollment.sequelize.fn('COUNT', ServiceEnrollment.sequelize.col('id')), 'total'],
        [ServiceEnrollment.sequelize.fn('COUNT', ServiceEnrollment.sequelize.literal('CASE WHEN status = "active" THEN 1 END')), 'active'],
        [ServiceEnrollment.sequelize.fn('AVG', ServiceEnrollment.sequelize.col('cost')), 'avg_cost'],
        [ServiceEnrollment.sequelize.fn('SUM', ServiceEnrollment.sequelize.col('cost')), 'total_revenue']
      ],
      group: ['service_type'],
      raw: true
    });

    // Estadístiques per estat
    const statusStats = await ServiceEnrollment.findAll({
      where: whereClause,
      attributes: [
        'status',
        [ServiceEnrollment.sequelize.fn('COUNT', ServiceEnrollment.sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    res.json({
      success: true,
      data: {
        by_service: serviceStats,
        by_status: statusStats
      }
    });
  } catch (error) {
    console.error('Error fetching enrollment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error obtenint estadístiques',
      error: error.message
    });
  }
};

module.exports = {
  createEnrollment,
  getEnrollments,
  updateEnrollment,
  getEnrollmentStats
};
