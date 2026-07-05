import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { PORT, DEMO_MODE, CLIENT_ORIGIN, EVIDENCE_DIR } from './config.js';
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', demoMode: DEMO_MODE });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

httpServer.listen(PORT, () => {
  console.log(`ThreatWatch API listening on http://localhost:${PORT}`);
  if (DEMO_MODE) startSimulator();
});
