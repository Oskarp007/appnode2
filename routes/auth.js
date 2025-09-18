const express = require('express');
const { 
  login, 
  register, 
  registerFamilia,
  debugRegisterFamilia,
  getCurrentUser, 
  logout, 
  refreshToken 
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Routes públiques
router.post('/login', login);
router.post('/register', register);
router.post('/register-familia', registerFamilia);
router.post('/debug-register', debugRegisterFamilia); // Debug temporal

// Routes protegides
router.get('/me', authenticateToken, getCurrentUser);
router.post('/logout', authenticateToken, logout);
router.post('/refresh', authenticateToken, refreshToken);

module.exports = router;
