const { User, Student, StudentFamily } = require('../models');

const familyController = {
  // Obtenir dades del dashboard de família
  async getDashboardData(req, res) {
    try {
      const userId = req.user.id;
      const tenantId = req.user.tenant_id;
      
      console.log('📊 DASHBOARD FAMILIA REQUEST - UserId:', userId, 'TenantId:', tenantId);
      
      // Obtenir usuari 
      const user = await User.findByPk(userId, {
        where: { tenant_id: tenantId },
        attributes: ['id', 'name', 'email', 'phone']
      });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuari no trobat'
        });
      }
      
      // Obtenir estudiants relacionats
      const studentRelations = await StudentFamily.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Student,
            as: 'student',
            where: { 
              tenant_id: tenantId,
              status: 'active' 
            }
          }
        ]
      });
      
      const fills = studentRelations.map(relation => ({
        id: relation.student.id,
        name: relation.student.name,
        surname: relation.student.surname,
        full_name: `${relation.student.name} ${relation.student.surname}`,
        class_group: relation.student.class_group,
        birth_date: relation.student.birth_date,
        student_code: relation.student.student_code,
        relationship: relation.relationship,
        is_primary_contact: relation.is_primary_contact,
        age: relation.student.birth_date ? 
          new Date().getFullYear() - new Date(relation.student.birth_date).getFullYear() : null
      }));
      
      console.log('👨‍👩‍👧‍👦 FILLS TROBATS:', fills.length);
      
      // Resum (dades simulades per ara)
      const summary = {
        days: 18,
        activities: fills.length * 2,
        pending: 48.00,
        messages: 2
      };
      
      // Activitats simulades
      const activitats = fills.map(fill => ({
        student_id: fill.id,
        student_name: fill.full_name,
        activity_name: ['Futbol', 'Art', 'Anglès', 'Música'][Math.floor(Math.random() * 4)],
        day: ['Dilluns', 'Dimarts', 'Dimecres', 'Dijous'][Math.floor(Math.random() * 4)],
        time: ['15:30', '16:00', '16:30'][Math.floor(Math.random() * 3)],
        monitor: ['Joan', 'Maria', 'Pere', 'Anna'][Math.floor(Math.random() * 4)],
        status: 'present'
      }));
      
      // Comunicacions simulades
      const comunicacions = [
        {
          id: 1,
          title: 'Reunió pares',
          message: 'Dijous 19:00 - Informativa curs',
          type: 'reunio',
          pending_action: 'Confirmar'
        },
        {
          id: 2,
          title: 'Pagament pendent',
          message: '€48 - Setembre 2025',
          type: 'pagament',
          pending_action: 'Pagar ara'
        }
      ];
      
      // Historial pagaments simulat
      const pagaments = [
        {
          id: 1,
          mes: 'Setembre 2025',
          import: 48.00,
          estat: 'pendent',
          data_pagament: null
        },
        {
          id: 2,
          mes: 'Agost 2025',
          import: 48.00,
          estat: 'pagat',
          data_pagament: '2025-08-14'
        }
      ];
      
      res.json({
        success: true,
        data: {
          user,
          fills,
          summary,
          activitats,
          comunicacions,
          pagaments
        }
      });
      
    } catch (error) {
      console.error('❌ Error dashboard familia:', error);
      res.status(500).json({
        success: false,
        message: 'Error obtenint dades del dashboard'
      });
    }
  },

  // Obtenir els estudiants de la família autenticada
  async getMyStudents(req, res) {
    try {
      const userId = req.user.id;
      
      // Buscar estudiants relacionats amb aquest usuari família
      const studentRelations = await StudentFamily.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Student,
            as: 'student',
            where: { 
              tenant_id: req.user.tenant_id,
              status: 'active' 
            }
          }
        ]
      });

      const students = studentRelations.map(relation => relation.student);

      res.json({
        success: true,
        data: students,
        message: `S'han trobat ${students.length} estudiants`
      });
    } catch (error) {
      console.error('Error obtenint estudiants de la família:', error);
      res.status(500).json({
        success: false,
        message: 'Error intern del servidor'
      });
    }
  },

  // Obtenir detalls d'un estudiant específic
  async getStudentDetails(req, res) {
    try {
      const userId = req.user.id;
      const studentId = req.params.studentId;

      // Verificar que aquest usuari té accés a aquest estudiant
      const studentRelation = await StudentFamily.findOne({
        where: { 
          user_id: userId,
          student_id: studentId 
        },
        include: [
          {
            model: Student,
            as: 'student',
            where: { 
              tenant_id: req.user.tenant_id 
            }
          }
        ]
      });

      if (!studentRelation) {
        return res.status(404).json({
          success: false,
          message: 'Estudiant no trobat o no teniu accés'
        });
      }

      const student = studentRelation.student;

      // Aquí podríem afegir més informació com assistència, menjador, etc.
      const studentDetails = {
        ...student.toJSON(),
        relationship: studentRelation.relationship,
        is_primary_contact: studentRelation.is_primary_contact,
        can_pickup: studentRelation.can_pickup,
        emergency_contact: studentRelation.emergency_contact
      };

      res.json({
        success: true,
        data: studentDetails,
        message: 'Detalls de l\'estudiant obtinguts correctament'
      });
    } catch (error) {
      console.error('Error obtenint detalls de l\'estudiant:', error);
      res.status(500).json({
        success: false,
        message: 'Error intern del servidor'
      });
    }
  },

  // Obtenir el perfil de la família
  async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        where: { tenant_id: req.user.tenant_id },
        attributes: ['id', 'name', 'email', 'phone', 'profile_data', 'created_at']
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuari no trobat'
        });
      }

      res.json({
        success: true,
        data: user,
        message: 'Perfil obtingut correctament'
      });
    } catch (error) {
      console.error('Error obtenint perfil de família:', error);
      res.status(500).json({
        success: false,
        message: 'Error intern del servidor'
      });
    }
  },

  // Enviar missatge al centre
  async enviarMissatge(req, res) {
    try {
      const userId = req.user.id;
      const { assumpte, missatge } = req.body;
      
      if (!assumpte || !missatge) {
        return res.status(400).json({
          success: false,
          message: 'Assumpte i missatge són obligatoris'
        });
      }
      
      // Aquí implementaríem la lògica real d'enviament
      console.log('📧 MISSATGE ENVIAT:', {
        userId,
        assumpte,
        missatge: missatge.substring(0, 50) + '...'
      });
      
      res.json({
        success: true,
        message: 'Missatge enviat correctament'
      });
      
    } catch (error) {
      console.error('❌ Error enviant missatge:', error);
      res.status(500).json({
        success: false,
        message: 'Error enviant missatge'
      });
    }
  }
};

module.exports = familyController;
