const express = require('express');
const router = express.Router();
const familyController = require('../controllers/familyController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

// Middleware per verificar que l'usuari és de tipus FAMILIA
const ensureFamily = requireRole(['FAMILIA']);

// Obtenir dades del dashboard de família
router.get('/dashboard', ensureFamily, familyController.getDashboardData);

// Obtenir els estudiants de la família
router.get('/students', ensureFamily, familyController.getMyStudents);

// Obtenir detalls d'un estudiant específic
router.get('/students/:studentId', ensureFamily, familyController.getStudentDetails);

// Obtenir perfil de la família
router.get('/profile', ensureFamily, familyController.getProfile);

// Enviar missatge al centre
router.post('/message', ensureFamily, familyController.enviarMissatge);

module.exports = router;
