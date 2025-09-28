const { AttendanceSession, ServiceAttendance, ServiceEnrollment, Student, User } = require('../models');
const { Op } = require('sequelize');

// Crear una nova sessió d'assistència
const createSession = async (req, res) => {
  try {
    const {
      session_name,
      service_type,
      session_date,
      start_time,
      end_time,
      location,
      max_capacity,
      session_type,
      session_notes
    } = req.body;

    const session = await AttendanceSession.create({
      session_name,
      service_type,
      session_date,
      start_time,
      end_time,
      location,
      monitor_id: req.user.id,
      max_capacity,
      session_type,
      session_notes,
      tenant_id: req.user.tenant_id
    });

    // Crear automàticament registres d'assistència per estudiants inscrits
    const activeEnrollments = await ServiceEnrollment.findAll({
      where: {
        service_type,
        tenant_id: req.user.tenant_id,
        status: 'active',
        start_date: { [Op.lte]: session_date },
        [Op.or]: [
          { end_date: null },
          { end_date: { [Op.gte]: session_date } }
        ]
      },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'nom', 'cognoms']
        }
      ]
    });

    // Filtrar per dies de la setmana
    const sessionDayOfWeek = new Date(session_date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const relevantEnrollments = activeEnrollments.filter(enrollment => 
      enrollment.days_of_week.includes(sessionDayOfWeek)
    );

    // Crear registres d'assistència
    const attendanceRecords = await Promise.all(
      relevantEnrollments.map(enrollment =>
        ServiceAttendance.create({
          session_id: session.id,
          enrollment_id: enrollment.id,
          student_id: enrollment.student_id,
          attendance_status: 'absent', // Per defecte absent, es marcarà present després
          tenant_id: req.user.tenant_id
        })
      )
    );

    // Actualitzar total d'inscrits
    await session.update({
      total_enrolled: relevantEnrollments.length
    });

    const sessionWithData = await AttendanceSession.findByPk(session.id, {
      include: [
        {
          model: User,
          as: 'monitor',
          attributes: ['id', 'name', 'email']
        },
        {
          model: ServiceAttendance,
          as: 'attendances',
          include: [
            {
              model: Student,
              as: 'student',
              attributes: ['id', 'nom', 'cognoms']
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: sessionWithData,
      message: `Sessió creada amb ${relevantEnrollments.length} estudiants inscrits`
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      success: false,
      message: 'Error creant la sessió',
      error: error.message
    });
  }
};

// Obtenir sessions amb filtres
const getSessions = async (req, res) => {
  try {
    const {
      service_type,
      session_date,
      start_date,
      end_date,
      monitor_id,
      status,
      page = 1,
      limit = 20
    } = req.query;

    const whereClause = {
      tenant_id: req.user.tenant_id
    };

    if (service_type) whereClause.service_type = service_type;
    if (session_date) whereClause.session_date = session_date;
    if (monitor_id) whereClause.monitor_id = monitor_id;
    if (status) whereClause.status = status;

    if (start_date && end_date) {
      whereClause.session_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await AttendanceSession.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'monitor',
          attributes: ['id', 'name', 'email']
        },
        {
          model: ServiceAttendance,
          as: 'attendances',
          include: [
            {
              model: Student,
              as: 'student',
              attributes: ['id', 'nom', 'cognoms']
            }
          ]
        }
      ],
      order: [['session_date', 'DESC'], ['start_time', 'DESC']],
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
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Error obtenint sessions',
      error: error.message
    });
  }
};

// Obtenir una sessió específica
const getSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await AttendanceSession.findOne({
      where: {
        id,
        tenant_id: req.user.tenant_id
      },
      include: [
        {
          model: User,
          as: 'monitor',
          attributes: ['id', 'name', 'email']
        },
        {
          model: ServiceAttendance,
          as: 'attendances',
          include: [
            {
              model: Student,
              as: 'student',
              attributes: ['id', 'nom', 'cognoms', 'data_naixement', 'curs', 'grup']
            },
            {
              model: ServiceEnrollment,
              as: 'enrollment',
              attributes: ['id', 'meal_requirements', 'pickup_authorization']
            }
          ]
        }
      ]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Sessió no trobada'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({
      success: false,
      message: 'Error obtenint la sessió',
      error: error.message
    });
  }
};

// Actualitzar sessió
const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const session = await AttendanceSession.findOne({
      where: {
        id,
        tenant_id: req.user.tenant_id
      }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Sessió no trobada'
      });
    }

    await session.update(updateData);

    const updatedSession = await AttendanceSession.findByPk(id, {
      include: [
        {
          model: User,
          as: 'monitor',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedSession,
      message: 'Sessió actualitzada correctament'
    });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualitzant la sessió',
      error: error.message
    });
  }
};

// Iniciar sessió (canviar estat a in_progress)
const startSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await AttendanceSession.findOne({
      where: {
        id,
        tenant_id: req.user.tenant_id
      }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Sessió no trobada'
      });
    }

    if (session.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'La sessió ja ha estat iniciada o completada'
      });
    }

    await session.update({
      status: 'in_progress',
      attendance_taken_at: new Date(),
      attendance_taken_by: req.user.id
    });

    res.json({
      success: true,
      data: session,
      message: 'Sessió iniciada correctament'
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({
      success: false,
      message: 'Error iniciant la sessió',
      error: error.message
    });
  }
};

// Completar sessió
const completeSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await AttendanceSession.findOne({
      where: {
        id,
        tenant_id: req.user.tenant_id
      },
      include: [
        {
          model: ServiceAttendance,
          as: 'attendances'
        }
      ]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Sessió no trobada'
      });
    }

    // Calcular estadístiques
    const totalPresent = session.attendances.filter(a => a.attendance_status === 'present').length;
    const totalAbsent = session.attendances.filter(a => ['absent', 'excused', 'sick'].includes(a.attendance_status)).length;

    await session.update({
      status: 'completed',
      total_present: totalPresent,
      total_absent: totalAbsent,
      end_time: new Date().toTimeString().slice(0, 8) // HH:MM:SS
    });

    res.json({
      success: true,
      data: session,
      message: 'Sessió completada correctament'
    });
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({
      success: false,
      message: 'Error completant la sessió',
      error: error.message
    });
  }
};

module.exports = {
  createSession,
  getSessions,
  getSession,
  updateSession,
  startSession,
  completeSession
};
