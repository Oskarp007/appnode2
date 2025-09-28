// Minimal auth controller per debugging
const { User, Tenant } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { email, password, tenant_slug } = req.body;
    const tenantSlugFromHeader = req.headers['x-tenant-slug'];
    
    // LOG DETALLAT per debugging
    console.log('🔐 LOGIN ATTEMPT:', {
      email,
      tenant_slug,
      tenantSlugFromHeader,
      body: req.body,
      headers: req.headers
    });
    
    // Usar tenant_slug del body o header (preferir body)
    const slugToUse = tenant_slug || tenantSlugFromHeader || 'escola-demo';
    console.log('🏢 TENANT SLUG A USAR:', slugToUse);
    
    // Buscar tenant case-insensitive (SQLite usa LIKE, no ILIKE)
    const tenant = await Tenant.findOne({
      where: {
        slug: {
          [Op.like]: slugToUse  // Case insensitive amb LIKE per SQLite
        }
      }
    });
    
    console.log('🏢 TENANT TROBAT:', tenant ? tenant.name : 'NO TROBAT');
    
    if (!tenant) {
      console.log('❌ TENANT NO EXISTEIX:', slugToUse);
      return res.status(400).json({
        success: false,
        message: `Centre educatiu '${slugToUse}' no trobat`
      });
    }
    
    // Buscar usuari en aquest tenant
    const user = await User.findOne({
      where: {
        email: email,  // SQLite és case insensitive per defecte
        tenant_id: tenant.id
      }
    });
    
    console.log('👤 USUARI TROBAT:', user ? user.name : 'NO TROBAT');
    
    if (!user) {
      console.log('❌ USUARI NO EXISTEIX:', email, 'al tenant:', tenant.name);
      return res.status(401).json({
        success: false,
        message: 'Credencials invàlides o usuari no pertany a aquest centre'
      });
    }
    
    // Verificar password
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('🔑 PASSWORD VÀLID:', validPassword);
    
    if (!validPassword) {
      console.log('❌ PASSWORD INCORRECTE per usuari:', user.email);
      return res.status(401).json({
        success: false,
        message: 'Contrasenya incorrecta'
      });
    }
    
    // Generar JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        tenantId: tenant.id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('✅ LOGIN EXITÓS:', user.email);
    
    res.json({
      success: true,
      message: 'Login exitós',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug
        }
      }
    });
    
  } catch (error) {
    console.error('💥 ERROR LOGIN:', error);
    res.status(500).json({
      success: false,
      message: 'Error intern del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const register = async (req, res) => {
  res.json({
    success: false,
    message: 'Register no implementat encara'
  });
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    const tenant = await Tenant.findByPk(req.user.tenantId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuari no trobat'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug
        }
      }
    });

  } catch (error) {
    console.error('❌ Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obtenint informació de l\'usuari'
    });
  }
};

const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logout exitós'
  });
};

const refreshToken = async (req, res) => {
  res.json({
    success: false,
    message: 'Refresh token no implementat'
  });
};

module.exports = {
  login,
  register,
  getCurrentUser,
  logout,
  refreshToken
};
