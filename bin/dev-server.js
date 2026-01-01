#!/usr/bin/env node

/**
 * @pegasusheavy/angular-platform-android Development Server
 *
 * Handles hot reload and bridge communication during development.
 *
 * Copyright (c) 2026 Pegasus Heavy Industries LLC
 * Licensed under the MIT License
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { watch } = require('fs');

// Configuration
const PORT = process.env.PORT || 8081;
const HOST = process.env.HOST || '0.0.0.0';

// Connected clients
const clients = new Set();

// Create HTTP server
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  switch (url.pathname) {
    case '/':
    case '/status':
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'running',
        clients: clients.size,
        port: PORT,
      }));
      break;

    case '/bundle.js':
      serveBundleFile(res);
      break;

    case '/hot-update':
      handleHotUpdate(req, res);
      break;

    default:
      res.writeHead(404);
      res.end('Not found');
  }
});

// WebSocket upgrade handling (simple implementation)
server.on('upgrade', (request, socket, head) => {
  if (request.url === '/bridge') {
    // Simple WebSocket handshake
    const key = request.headers['sec-websocket-key'];
    const acceptKey = generateAcceptKey(key);

    socket.write(
      'HTTP/1.1 101 Switching Protocols\r\n' +
      'Upgrade: websocket\r\n' +
      'Connection: Upgrade\r\n' +
      `Sec-WebSocket-Accept: ${acceptKey}\r\n` +
      '\r\n'
    );

    const client = {
      socket,
      send: (data) => {
        const payload = typeof data === 'string' ? data : JSON.stringify(data);
        const frame = createWebSocketFrame(payload);
        socket.write(frame);
      },
    };

    clients.add(client);
    console.log(`[DevServer] Client connected (${clients.size} total)`);

    socket.on('data', (buffer) => {
      const message = parseWebSocketFrame(buffer);
      if (message) {
        handleClientMessage(client, message);
      }
    });

    socket.on('close', () => {
      clients.delete(client);
      console.log(`[DevServer] Client disconnected (${clients.size} remaining)`);
    });

    socket.on('error', (error) => {
      console.error('[DevServer] Socket error:', error.message);
      clients.delete(client);
    });
  } else {
    socket.destroy();
  }
});

// Handle messages from clients
function handleClientMessage(client, message) {
  try {
    const data = JSON.parse(message);
    console.log(`[DevServer] Received: ${data.type}`);

    switch (data.type) {
      case 'connected':
        client.send({ type: 'welcome', payload: { version: '1.0.0' } });
        break;

      case 'log':
        console.log(`[App] ${data.payload.message}`);
        break;

      case 'error':
        console.error(`[App Error] ${data.payload.message}`);
        break;

      default:
        // Broadcast to other clients if needed
        break;
    }
  } catch (error) {
    console.error('[DevServer] Failed to parse message:', error.message);
  }
}

// Serve the bundled JavaScript file
function serveBundleFile(res) {
  const bundlePath = path.join(process.cwd(), 'dist', 'bundle.js');

  if (fs.existsSync(bundlePath)) {
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    fs.createReadStream(bundlePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Bundle not found. Run "npm run build" first.');
  }
}

// Handle hot update requests
function handleHotUpdate(req, res) {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    // Broadcast hot update to all clients
    broadcast({
      type: 'hotReload',
      payload: { bundleUrl: '/bundle.js' },
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
  });
}

// Broadcast message to all connected clients
function broadcast(data) {
  for (const client of clients) {
    try {
      client.send(data);
    } catch (error) {
      console.error('[DevServer] Broadcast error:', error.message);
    }
  }
}

// Watch for file changes
function setupFileWatcher() {
  const srcPath = path.join(process.cwd(), 'src');

  if (fs.existsSync(srcPath)) {
    console.log('[DevServer] Watching for file changes...');

    watch(srcPath, { recursive: true }, (eventType, filename) => {
      if (filename && (filename.endsWith('.ts') || filename.endsWith('.html'))) {
        console.log(`[DevServer] File changed: ${filename}`);

        // Trigger rebuild
        triggerRebuild().then(() => {
          broadcast({
            type: 'hotReload',
            payload: { bundleUrl: '/bundle.js', changedFile: filename },
          });
        });
      }
    });
  }
}

// Trigger a rebuild of the Angular app
async function triggerRebuild() {
  return new Promise((resolve) => {
    const { exec } = require('child_process');

    exec('npm run build', (error, stdout, stderr) => {
      if (error) {
        console.error('[DevServer] Build failed:', error.message);
        broadcast({
          type: 'buildError',
          payload: { message: error.message },
        });
      } else {
        console.log('[DevServer] Build completed');
      }
      resolve();
    });
  });
}

// WebSocket utilities
function generateAcceptKey(key) {
  const crypto = require('crypto');
  const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
  return crypto.createHash('sha1').update(key + GUID).digest('base64');
}

function createWebSocketFrame(data) {
  const payload = Buffer.from(data);
  const length = payload.length;

  let frame;
  if (length < 126) {
    frame = Buffer.alloc(2 + length);
    frame[0] = 0x81; // Text frame
    frame[1] = length;
    payload.copy(frame, 2);
  } else if (length < 65536) {
    frame = Buffer.alloc(4 + length);
    frame[0] = 0x81;
    frame[1] = 126;
    frame.writeUInt16BE(length, 2);
    payload.copy(frame, 4);
  } else {
    frame = Buffer.alloc(10 + length);
    frame[0] = 0x81;
    frame[1] = 127;
    frame.writeBigUInt64BE(BigInt(length), 2);
    payload.copy(frame, 10);
  }

  return frame;
}

function parseWebSocketFrame(buffer) {
  if (buffer.length < 2) return null;

  const secondByte = buffer[1];
  const masked = (secondByte & 0x80) !== 0;
  let payloadLength = secondByte & 0x7f;
  let offset = 2;

  if (payloadLength === 126) {
    payloadLength = buffer.readUInt16BE(2);
    offset = 4;
  } else if (payloadLength === 127) {
    payloadLength = Number(buffer.readBigUInt64BE(2));
    offset = 10;
  }

  let maskKey = null;
  if (masked) {
    maskKey = buffer.slice(offset, offset + 4);
    offset += 4;
  }

  const payload = buffer.slice(offset, offset + payloadLength);

  if (masked && maskKey) {
    for (let i = 0; i < payload.length; i++) {
      payload[i] ^= maskKey[i % 4];
    }
  }

  return payload.toString('utf8');
}

// Start the server
server.listen(PORT, HOST, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Angular Platform Android Dev Server                   ║
║                                                           ║
║   Local:   http://localhost:${PORT}                         ║
║   Bridge:  ws://localhost:${PORT}/bridge                    ║
║                                                           ║
║   Waiting for device connection...                        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);

  setupFileWatcher();
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n[DevServer] Shutting down...');

  for (const client of clients) {
    client.socket.destroy();
  }

  server.close(() => {
    console.log('[DevServer] Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  process.emit('SIGINT');
});
