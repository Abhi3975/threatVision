import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { PORT, DEMO_MODE, CLIENT_ORIGIN, EVIDENCE_DIR } from './config.js';
import { initDb } from './db.js';
import { seedIfEmpty } from './seed.js';
import { setIO } from './realtime.js';
import { startSimulator } from './simulator.js';

import cameras from './routes/cameras.js';
import events from './routes/events.js';
import evidence from './routes/evidence.js';
import analytics from './routes/analytics.js';
import ingest from './routes/ingest.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: CLIENT_ORIGIN } });
setIO(io);

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/cameras', cameras);
app.use('/api/events', events);
app.use('/api/evidence', evidence);
app.use('/api/analytics', analytics);
app.use('/api/ingest', ingest);
app.use('/frames', express.static(EVIDENCE_DIR));

app.get('/', (req, res) => {
  res.type('html').send(`
    <h1>ThreatWatch-AI API</h1>
    <p>This is the backend service. The dashboard runs separately.</p>
    <ul>
      <li><a href="/api/health">/api/health</a></li>
      <li><a href="/api/cameras">/api/cameras</a></li>
      <li><a href="/api/analytics/summary">/api/analytics/summary</a></li>
    </ul>
  `);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', demoMode: DEMO_MODE });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

async function start() {
  await initDb();
  await seedIfEmpty();

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`ThreatWatch API listening on port ${PORT}`);
    if (DEMO_MODE) startSimulator();
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
