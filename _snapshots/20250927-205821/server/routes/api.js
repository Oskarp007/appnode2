const express = require('express');
const authRoutes = require('./auth');
const studentsRoutes = require('./students');
const { authenticateToken } = require('../middleware/auth');
const { tenantIsolation } = require('../middleware/tenant');

const router = express.Router();

// Routes d'autenticació (públiques)
router.use('/auth', authRoutes);

// Middleware global per routes protegides
router.use(authenticateToken);
router.use(tenantIsolation);

// Health check autenticat
router.get('/health-auth', (req, res) => {
  res.json({
    success: true,
    message: 'API autenticada funcionant correctament',
    user: {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role
    },
    tenant: {
      id: req.tenant.id,
      name: req.tenant.name,
      slug: req.tenant.slug
    },
    timestamp: new Date().toISOString()
  });
});

// Test endpoint per verificar multi-tenancy
router.get('/tenant-info', (req, res) => {
  res.json({
    success: true,
    data: {
      tenant: req.tenant,
      user_role: req.user.role,
      tenant_id: req.tenantId
    }
  });
});

// Placeholder per futures routes
// router.use('/family', familyRoutes);      // Dashboard família
// router.use('/monitor', monitorRoutes);    // Dashboard monitor  
// Routes de funcionalitats
router.use('/students', studentsRoutes);   // Gestió estudiants avançada

// TODO: Afegir més routes aquí quan siguin implementades
// router.use('/admin', adminRoutes);        // Administració centre
// router.use('/attendance', attendanceRoutes); // Assistència

// Error handler per routes no trobades
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint de l\'API no trobat',
    requested_path: req.originalUrl,
    method: req.method
  });
});

module.exports = router;
