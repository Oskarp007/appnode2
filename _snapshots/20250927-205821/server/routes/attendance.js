const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const enrollmentController = require('../controllers/enrollmentController');
const attendanceController = require('../controllers/attendanceController');
const attendanceRecordController = require('../controllers/attendanceRecordController');

// Rutes per inscripcions de serveis
router.post('/enrollments', 
  authenticateToken, 
  requireRole(['admin', 'coordinador', 'monitor']), 
  enrollmentController.createEnrollment
);

router.get('/enrollments', 
  authenticateToken, 
  enrollmentController.getEnrollments
);

router.put('/enrollments/:id', 
  authenticateToken, 
  requireRole(['admin', 'coordinador', 'monitor']), 
  enrollmentController.updateEnrollment
);

router.get('/enrollments/stats', 
  authenticateToken, 
  requireRole(['admin', 'coordinador']), 
  enrollmentController.getEnrollmentStats
);

// Rutes per sessions d'assistència
router.post('/sessions', 
  authenticateToken, 
  requireRole(['admin', 'coordinador', 'monitor']), 
  attendanceController.createSession
);

router.get('/sessions', 
  authenticateToken, 
  attendanceController.getSessions
);

router.get('/sessions/:id', 
  authenticateToken, 
  attendanceController.getSession
);

router.put('/sessions/:id', 
  authenticateToken, 
  requireRole(['admin', 'coordinador', 'monitor']), 
  attendanceController.updateSession
);

router.post('/sessions/:id/start', 
  authenticateToken, 
  requireRole(['admin', 'coordinador', 'monitor']), 
  attendanceController.startSession
);

router.post('/sessions/:id/complete', 
  authenticateToken, 
  requireRole(['admin', 'coordinador', 'monitor']), 
  attendanceController.completeSession
);

// Rutes per assistències individuals
router.put('/sessions/:session_id/students/:student_id/attendance', 
  authenticateToken, 
  requireRole(['admin', 'coordinador', 'monitor']), 
  attendanceRecordController.markAttendance
);

router.get('/sessions/:session_id/attendances', 
  authenticateToken, 
  attendanceRecordController.getSessionAttendances
);

router.get('/students/:student_id/attendance-history', 
  authenticateToken, 
  attendanceRecordController.getStudentAttendanceHistory
);

router.post('/sessions/:session_id/bulk-attendance', 
  authenticateToken, 
  requireRole(['admin', 'coordinador', 'monitor']), 
  attendanceRecordController.bulkMarkAttendance
);

module.exports = router;
