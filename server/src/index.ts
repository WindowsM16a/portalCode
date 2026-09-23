import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import * as pty from 'node-pty';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const MASTER_KEY = process.env.MASTER_KEY || 'LigerMiloSWE2026';

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token === MASTER_KEY) {
    next();
  } else {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');

  const shell = process.env.SHELL || 'bash';
  
  // Clean up environment to avoid NVM/NPM conflicts
  const cleanEnv = { ...process.env };
  delete cleanEnv.npm_config_prefix;
  delete cleanEnv.npm_package_json;
  delete cleanEnv.npm_lifecycle_event;
  delete cleanEnv.npm_lifecycle_script;
  delete cleanEnv.npm_node_execpath;
  
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.WORKING_DIR || process.env.HOME,
    env: {
      ...cleanEnv,
      PATH: process.env.PATH
    }
  });

  ptyProcess.onData((data) => {
    socket.emit('output', data);

    if (data.includes('(y/n)') || data.includes('[choice]')) {
       socket.emit('prompt-detected', { type: 'selection', raw: data });
    }
  });

  socket.on('input', (data) => {
    ptyProcess.write(data);
  });

  socket.on('resize', ({ cols, rows }) => {
    ptyProcess.resize(cols, rows);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    ptyProcess.kill();
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

httpServer.listen(PORT, () => {
  console.log('PortaCode Backend running on port ' + PORT);
});
