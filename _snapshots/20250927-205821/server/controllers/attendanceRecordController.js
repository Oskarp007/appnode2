const { ServiceAttendance, AttendanceSession, ServiceEnrollment, Student, PersonaAutoritzada, User } = require('../models');
const { Op } = require('sequelize');

// Marcar assistència d'un estudiant
const markAttendance = async (req, res) => {
  try {
    const { session_id, student_id } = req.params;
    const {
      attendance_status,
      check_in_time,
      check_out_time,
      pickup_person_id,
      pickup_person_name,
      pickup_person_dni,
      meal_taken,
      meal_type,
      behavior_notes,
      incident_report,
      medical_incident,
      medical_notes,
      mood_rating,
      special_notes
    } = req.body;

    // Verificar que la sessió existeixi i pertanyi al tenant
    const session = await AttendanceSession.findOne({
      where: {
        id: session_id,
        tenant_id: req.user.tenant_id
      }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Sessió no trobada'
      });
    }

    // Buscar o crear el registre d'assistència
    let attendance = await ServiceAttendance.findOne({
      where: {
        session_id,
        student_id,
        tenant_id: req.user.tenant_id
      }
    });

    if (!attendance) {
      // Buscar la inscripció activa per a aquest estudiant i servei
      const enrollment = await ServiceEnrollment.findOne({
        where: {
          student_id,
          service_type: session.service_type,
          tenant_id: req.user.tenant_id,
          status: 'active',
          start_date: { [Op.lte]: session.session_date },
          [Op.or]: [
            { end_date: null },
            { end_date: { [Op.gte]: session.session_date } }
          ]
        }
      });

      if (!enrollment) {
        return res.status(400).json({
          success: false,
          message: 'L\'estudiant no està inscrit en aquest servei'
        });
      }

      attendance = await ServiceAttendance.create({
        session_id,
        enrollment_id: enrollment.id,
        student_id,
        attendance_status: 'absent',
        tenant_id: req.user.tenant_id
      });
    }

    // Actualitzar dades d'assistència
    const updateData = {
      attendance_status,
      updated_by: req.user.id
    };

    if (check_in_time) updateData.check_in_time = check_in_time;
    if (check_out_time) updateData.check_out_time = check_out_time;
    if (pickup_person_id) updateData.pickup_person_id = pickup_person_id;
    if (pickup_person_name) updateData.pickup_person_name = pickup_person_name;
    if (pickup_person_dni) updateData.pickup_person_dni = pickup_person_dni;
    if (meal_taken !== undefined) updateData.meal_taken = meal_taken;
    if (meal_type) updateData.meal_type = meal_type;
    if (behavior_notes) updateData.behavior_notes = behavior_notes;
    if (incident_report) updateData.incident_report = incident_report;
    if (medical_incident !== undefined) updateData.medical_incident = medical_incident;
    if (medical_notes) updateData.medical_notes = medical_notes;
    if (mood_rating) updateData.mood_rating = mood_rating;
    if (special_notes) updateData.special_notes = special_notes;

    // Marcar usuari que fa check-in/check-out
    if (attendance_status === 'present' && !attendance.checked_in_by) {
      updateData.checked_in_by = req.user.id;
    }
    if (check_out_time && !attendance.checked_out_by) {
      updateData.checked_out_by = req.user.id;
    }

    await attendance.update(updateData);

    // Retornar amb dades relacionades
    const updatedAttendance = await ServiceAttendance.findByPk(attendance.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'nom', 'cognoms', 'data_naixement']
        },
        {
          model: PersonaAutoritzada,
          as: 'pickupPerson',
          attributes: ['id', 'nom', 'cognoms', 'dni_nie', 'relacio_familiar']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedAttendance,
      message: 'Assistència actualitzada correctament'
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error marcant assistència',
      error: error.message
    });
  }
};

// Obtenir assistències d'una sessió
const getSessionAttendances = async (req, res) => {
  try {
    const { session_id } = req.params;
    const { status } = req.query;

    const whereClause = {
      session_id,
      tenant_id: req.user.tenant_id
    };

    if (status) whereClause.attendance_status = status;

    const attendances = await ServiceAttendance.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'nom', 'cognoms', 'data_naixement', 'curs', 'grup']
        },
        {
          model: ServiceEnrollment,
          as: 'enrollment',
          attributes: ['id', 'meal_requirements', 'pickup_authorization', 'special_instructions']
        },
        {
          model: PersonaAutoritzada,
          as: 'pickupPerson',
          attributes: ['id', 'nom', 'cognoms', 'dni_nie', 'relacio_familiar']
        },
        {
          model: User,
          as: 'checkedInBy',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'checkedOutBy',
          attributes: ['id', 'name']
        }
      ],
      order: [['student', 'nom'], ['student', 'cognoms']]
    });

    res.json({
      success: true,
      data: attendances
    });
  } catch (error) {
    console.error('Error fetching session attendances:', error);
    res.status(500).json({
      success: false,
      message: 'Error obtenint assistències de la sessió',
      error: error.message
    });
  }
};

// Obtenir historial d'assistències d'un estudiant
const getStudentAttendanceHistory = async (req, res) => {
  try {
    const { student_id } = req.params;
    const {
      service_type,
      start_date,
      end_date,
      status,
      page = 1,
      limit = 20
    } = req.query;

    const whereClause = {
      student_id,
      tenant_id: req.user.tenant_id
    };

    if (status) whereClause.attendance_status = status;

    const sessionWhere = {};
    if (service_type) sessionWhere.service_type = service_type;
    if (start_date && end_date) {
      sessionWhere.session_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await ServiceAttendance.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: AttendanceSession,
          as: 'session',
          attributes: ['id', 'session_name', 'service_type', 'session_date', 'start_time', 'end_time'],
          where: sessionWhere
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'nom', 'cognoms']
        }
      ],
      order: [['session', 'session_date', 'DESC']],
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
    console.error('Error fetching student attendance history:', error);
    res.status(500).json({
      success: false,
      message: 'Error obtenint historial d\'assistència',
      error: error.message
    });
  }
};

// Marcar múltiples assistències ràpidament
const bulkMarkAttendance = async (req, res) => {
  try {
    const { session_id } = req.params;
    const { attendances } = req.body; // Array de { student_id, attendance_status, ... }

    const session = await AttendanceSession.findOne({
      where: {
        id: session_id,
        tenant_id: req.user.tenant_id
      }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Sessió no trobada'
      });
    }

    const results = [];
    const errors = [];

    for (const attendanceData of attendances) {
      try {
        const { student_id, ...updateData } = attendanceData;

        let attendance = await ServiceAttendance.findOne({
          where: {
            session_id,
            student_id,
            tenant_id: req.user.tenant_id
          }
        });

        if (attendance) {
          await attendance.update({
            ...updateData,
            updated_by: req.user.id
          });
          results.push({ student_id, success: true });
        } else {
          errors.push({ student_id, error: 'Registre d\'assistència no trobat' });
        }
      } catch (error) {
        errors.push({ student_id: attendanceData.student_id, error: error.message });
      }
    }

    res.json({
      success: errors.length === 0,
      data: {
        successful: results,
        errors: errors
      },
      message: `${results.length} assistències actualitzades, ${errors.length} errors`
    });
  } catch (error) {
    console.error('Error bulk marking attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualitzant assistències múltiples',
      error: error.message
    });
  }
};

module.exports = {
  markAttendance,
  getSessionAttendances,
  getStudentAttendanceHistory,
  bulkMarkAttendance
};
