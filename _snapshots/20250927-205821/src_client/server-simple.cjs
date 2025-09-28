#!/usr/bin/env node

// Servidor de desenvolupament simplificat sense WebSocket
const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 5173;

// Proxy per a les API calls
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  logLevel: 'silent'
}));

// Servir fitxers estàtics
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback - totes les rutes tornen a index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend running at http://localhost:${PORT}`);
  console.log(`📡 API proxy: /api -> http://localhost:3000/api`);
  console.log(`🌐 No WebSocket - Static serving mode`);
});
