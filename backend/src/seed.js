import db from './db.js';
import { severityFor } from './threats.js';
import { generateFrame } from './frame.js';

// Resets the database and fills it with sample cameras and past detections
// so the dashboard has something to show on first launch.

const cameras = [
  ['Main Entrance', 'Building A - Ground Floor', 'rtsp://demo/cam1', 'online'],
  ['Parking Lot', 'North Side', 'rtsp://demo/cam2', 'online'],
  ['Server Room', 'Building B - Floor 2', 'rtsp://demo/cam3', 'online'],
  ['Warehouse', 'Storage Wing', 'rtsp://demo/cam4', 'online'],
  ['Reception', 'Building A - Lobby', 'rtsp://demo/cam5', 'offline'],
  ['Perimeter Gate', 'East Boundary', 'rtsp://demo/cam6', 'online'],
];

const threats = ['person', 'crowd', 'running', 'intrusion', 'fire', 'knife', 'weapon'];

db.exec('DELETE FROM events; DELETE FROM cameras;');
db.exec("DELETE FROM sqlite_sequence WHERE name IN ('events','cameras');");

const insertCamera = db.prepare(
  'INSERT INTO cameras (name, location, stream_url, status) VALUES (?, ?, ?, ?)'
);
const cameraIds = cameras.map((c) => insertCamera.run(...c).lastInsertRowid);

const insertEvent = db.prepare(
  `INSERT INTO events (camera_id, threat_type, severity, confidence, snapshot, created_at)
   VALUES (?, ?, ?, ?, ?, ?)`
);

// Spread ~80 detections over the past two days.
for (let i = 0; i < 80; i++) {
  const cameraId = cameraIds[Math.floor(Math.random() * cameraIds.length)];
  const camera = cameras[cameraId - 1];
  const threatType = threats[Math.floor(Math.random() * threats.length)];
  const severity = severityFor(threatType);
  const confidence = 0.6 + Math.random() * 0.39;
  const minutesAgo = Math.floor(Math.random() * 60 * 24 * 2);
  const createdAt = new Date(Date.now() - minutesAgo * 60000)
    .toISOString()
    .replace('T', ' ')
    .slice(0, 19);

  const snapshot = generateFrame({
    threatType,
    severity,
    cameraName: camera[0],
    confidence,
  });

  insertEvent.run(cameraId, threatType, severity, confidence, snapshot, createdAt);
}

console.log(`Seeded ${cameras.length} cameras and 80 events.`);
