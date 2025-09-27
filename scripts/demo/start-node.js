/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2025 Nicolas Köppe
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Start server 1 on port 3000
const server1 = http.createServer((req, res) => {
  const filePath = path.join(__dirname, 'site1', 'index.html');
  const content = fs.readFileSync(filePath, 'utf8');
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(content);
});

// Start server 2 on port 3001
const server2 = http.createServer((req, res) => {
  const filePath = path.join(__dirname, 'site2', 'index.html');
  const content = fs.readFileSync(filePath, 'utf8');
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(content);
});

server1.listen(3000, () => {
  console.log('✅ Test App 1 running on http://localhost:3000');
});

server2.listen(3001, () => {
  console.log('✅ Test App 2 running on http://localhost:3001');
  console.log('');
  console.log('Demo applications ready for screenshots!');
  console.log('Press Ctrl+C to stop servers');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping demo applications...');
  server1.close();
  server2.close();
  process.exit(0);
});