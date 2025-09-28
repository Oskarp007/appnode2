#!/usr/bin/env node

// Servidor estàtic simple per desenvolupament
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5173;
const PUBLIC_DIR = path.join(__dirname, 'dist');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',  
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // SPA routing - tot va a index.html excepte assets
  if (!pathname.startsWith('/assets/') && !pathname.includes('.') && pathname !== '/') {
    pathname = '/index.html';
  } else if (pathname === '/') {
    pathname = '/index.html';
  }
  
  const filePath = path.join(PUBLIC_DIR, pathname);
  const ext = path.parse(filePath).ext;
  const mimeType = mimeTypes[ext] || 'text/plain';
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.log(`❌ File not found: ${filePath}`);
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Frontend server running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${PUBLIC_DIR}`);
});
