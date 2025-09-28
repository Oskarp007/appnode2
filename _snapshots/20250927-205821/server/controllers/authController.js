const { generateToken } = require('../config/jwt');
const Joi = require('joi');

// Esquemes de validació
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Format d\'email invàlid',
    'any.required': 'Email és obligatori'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'La contrasenya ha de tenir mínim 6 caràcters',
    'any.required': 'Contrasenya és obligatòria'
  }),
  tenant_slug: Joi.string().optional().messages({
    'string.base': 'Codi del centre ha de ser text'
  })
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'El nom ha de tenir mínim 2 caràcters',
    'string.max': 'El nom no pot superar els 100 caràcters',
    'any.required': 'Nom és obligatori'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Format d\'email invàlid',
    'any.required': 'Email és obligatori'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'La contrasenya ha de tenir mínim 6 caràcters',
    'any.required': 'Contrasenya és obligatòria'
  }),
  tenant_slug: Joi.string().required().messages({
    'any.required': 'Codi del centre és obligatori'
  }),
  phone: Joi.string().optional().allow('').messages({
    'string.base': 'El telèfon ha de ser text'
  })
});

const registerFamiliaSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.min': 'El nom ha de tenir mínim 2 caràcters',
    'string.max': 'El nom no pot superar els 100 caràcters',
    'any.required': 'Nom és obligatori'
  }),
  dni: Joi.string().trim().min(8).max(12).required().messages({
    'string.min': 'El DNI/NIE ha de tenir mínim 8 caràcters',
    'string.max': 'El DNI/NIE no pot superar els 12 caràcters',
    'any.required': 'DNI/NIE és obligatori'
  }),
  school: Joi.string().trim().required().messages({
    'any.required': 'Escola/Centre és obligatori'
  }),
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Format d\'email invàlid',
    'any.required': 'Email és obligatori'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'La contrasenya ha de tenir mínim 6 caràcters',
    'any.required': 'Contrasenya és obligatòria'
  }),
  phone: Joi.string().trim().min(9).max(15).required().messages({
    'string.min': 'El telèfon ha de tenir mínim 9 dígits',
    'string.max': 'El telèfon no pot superar els 15 dígits',
    'any.required': 'Telèfon és obligatori'
  }),
  iban: Joi.string().trim().allow('', null).optional().messages({
    'string.base': 'L\'IBAN ha de ser text'
  }),
  tenant_slug: Joi.string().required().messages({
    'any.required': 'Codi del centre és obligatori'
  })
}).options({ stripUnknown: true });

// Imports per login
const { User, Tenant } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Login d'usuari
 */
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
    
    // Tenant requerit
    const finalTenantSlug = tenant_slug || tenantSlugFromHeader;
    if (!finalTenantSlug) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tenant slug requerido' 
      });
    }
    
    console.log('🏢 TENANT SLUG A USAR:', finalTenantSlug);
    
    // Buscar tenant case-insensitive compatible SQLite
    const tenant = await Tenant.findOne({
      where: {
        slug: { [Op.like]: finalTenantSlug },
        status: 'active'
      }
    });
    
    console.log('🏢 TENANT TROBAT:', tenant ? tenant.name : 'NO TROBAT');
    
    if (!tenant) {
      console.log('❌ TENANT NO EXISTEIX:', finalTenantSlug);
      return res.status(400).json({
        success: false,
        message: `Centre educatiu '${finalTenantSlug}' no trobat`
      });
    }
    
    // Buscar usuari amb include per evitar joins manuals
    const user = await User.findOne({
      where: { 
        email: email, 
        active: true 
      },
      include: [{
        model: Tenant,
        as: 'tenant',
        where: { 
          status: 'active', 
          slug: { [Op.like]: finalTenantSlug } 
        }
      }]
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
    console.log('🔑 LOGIN - PASSWORD VÀLID:', validPassword);
    
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
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        school: user.school || null,
        tenant_id: user.tenant_id
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug
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

/**
 * Registre d'usuari (només famílies per defecte)
 */
const register = async (req, res) => {
  try {
    // Validar input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Dades invàlides',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { name, email, password, tenant_slug, phone } = value;

    // Verificar que el tenant existeix
    const tenant = await Tenant.findOne({
      where: { slug: tenant_slug, status: 'active' }
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Centre educatiu no trobat'
      });
    }

    // Verificar que l'email no existeix per aquest tenant
    const existingUser = await User.findOne({
      where: { email, tenant_id: tenant.id }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Aquest email ja està registrat en aquest centre'
      });
    }

    // Crear nou usuari
    const newUser = await User.create({
      name,
      email,
      password,
      tenant_id: tenant.id,
      role: 'FAMILIA', // Per defecte, nous usuaris són famílies
      phone: phone || null
    });

    // Generar token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      tenant_id: newUser.tenant_id
    });

    // Resposta d'èxit
    res.status(201).json({
      success: true,
      message: 'Usuari registrat correctament',
      data: {
        token,
        user: newUser.toSafeObject(),
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          settings: tenant.settings
        }
      }
    });

  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error intern del servidor'
    });
  }
};

/**
 * Obtenir informació de l'usuari actual
 */
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

/**
 * Registre específic per famílies amb validacions simplificades
 */
const registerFamilia = async (req, res) => {
  console.log('📝 REGISTER FAMILIA REQUEST:', { ...req.body, password: '[HIDDEN]' });

  try {
    // Validar dades
    const { error, value } = registerFamiliaSchema.validate(req.body);
    if (error) {
      console.log('❌ Validació error:', error.details);
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { name, dni, school, email, password, phone, iban, tenant_slug } = value;
    
    // Verificar tenant (o crear per defecte)
    let tenant = await Tenant.findOne({ 
      where: { slug: tenant_slug, status: 'active' } 
    });
    
    if (!tenant) {
      console.log('🏢 Tenant no trobat, usant tenant per defecte');
      tenant = await Tenant.findOne({ 
        where: { slug: 'escola-demo', status: 'active' } 
      });
      
      if (!tenant) {
        return res.status(400).json({
          success: false,
          message: 'Centre educatiu no disponible'
        });
      }
    }
    
    console.log('🏢 TENANT TROBAT:', tenant.name);
    
    // Verificar si l'email ja existeix
    const existingUser = await User.findOne({ 
      where: { 
        email,
        tenant_id: tenant.id 
      } 
    });
    
    if (existingUser) {
      console.log('⚠️ EMAIL JA REGISTRAT:', email);
      return res.status(409).json({
        success: false,
        message: 'Aquest email ja està registrat. Prova de fer login o utilitza un altre email.',
        field: 'email',
        suggestion: 'login'
      });
    }
    
    // Verificar si el DNI ja existeix (utilitzant la nova columna dni)
    if (dni) {
      const existingDNI = await User.findOne({ 
        where: { 
          dni: dni,
          tenant_id: tenant.id 
        } 
      });
      
      if (existingDNI) {
        console.log('⚠️ DNI JA REGISTRAT:', dni);
        return res.status(409).json({
          success: false,
          message: 'Aquest DNI/NIE ja està registrat. Si ja tens compte, fes login.',
          field: 'dni',
          suggestion: 'login'
        });
      }
    }
    
    console.log('🔐 PASSWORD HASHEAT AUTOMÀTICAMENT PER SEQUELIZE');
    
    // Crear usuari família amb les noves columnes (Sequelize hashearà automàticament)
    const newUser = await User.create({
      name,
      email,
      password: password, // Sequelize ho hashearà amb els hooks
      dni: dni || null,
      school: school || null,
      phone: phone || null,
      iban: iban || null,
      role: 'FAMILIA',
      tenant_id: tenant.id,
      active: 1,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    console.log('✅ FAMÍLIA REGISTRADA:', newUser.email);
    
    res.status(201).json({
      success: true,
      message: 'Família registrada amb èxit! Ja pots iniciar sessió.',
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Register familia error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registrant família. Prova-ho més tard.'
    });
  }
};

/**
 * Logout (invalidar token - client side)
 */
const logout = async (req, res) => {
  // El logout es fa principalment al client eliminant el token
  // Aquí podem implementar lògica addicional si cal (blacklist, etc.)
  
  res.json({
    success: true,
    message: 'Logout exitós'
  });
};

/**
 * Refresh token
 */
const refreshToken = async (req, res) => {
  try {
    // El token actual ja és vàlid (passat pel middleware d'autenticació)
    const user = req.user;

    // Generar nou token
    const newToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id
    });

    res.json({
      success: true,
      message: 'Token renovat correctament',
      data: {
        token: newToken
      }
    });

  } catch (error) {
    console.error('❌ Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Error renovant token'
    });
  }
};

/**
 * Debug endpoint per diagnosticar problemes de registre
 */
const debugRegisterFamilia = async (req, res) => {
  console.log('📋 DADES REBUDES DEL FRONTEND:');
  console.log(JSON.stringify(req.body, null, 2));
  
  // Validar camp per camp
  const fields = ['name', 'dni', 'school', 'email', 'password', 'phone', 'iban', 'tenant_slug'];
  fields.forEach(field => {
    console.log(`${field}: "${req.body[field]}" (${typeof req.body[field]})`);
  });
  
  // Test validació schema
  try {
    const { error, value } = registerFamiliaSchema.validate(req.body);
    if (error) {
      console.log('❌ SCHEMA VALIDATION ERROR:', error.details);
      res.json({ 
        received: req.body, 
        validationError: error.details,
        message: 'Validation failed - check logs' 
      });
    } else {
      console.log('✅ SCHEMA VALIDATION SUCCESS');
      res.json({ 
        received: req.body, 
        validated: value,
        message: 'Debug info logged - validation passed' 
      });
    }
  } catch (err) {
    console.log('💥 SCHEMA ERROR:', err);
    res.json({ received: req.body, error: err.message });
  }
};

module.exports = {
  login,
  register,
  registerFamilia,
  debugRegisterFamilia,
  getCurrentUser,
  logout,
  refreshToken
};
