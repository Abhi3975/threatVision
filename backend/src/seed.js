import pool, { query, initDb } from './db.js';
import { severityFor } from './threats.js';
import { generateFrame } from './frame.js';

const cameras = [
  ['Main Entrance', 'Building A - Ground Floor', 'rtsp://demo/cam1', 'online'],
  ['Parking Lot', 'North Side', 'rtsp://demo/cam2', 'online'],
  ['Server Room', 'Building B - Floor 2', 'rtsp://demo/cam3', 'online'],
  ['Warehouse', 'Storage Wing', 'rtsp://demo/cam4', 'online'],
  ['Reception', 'Building A - Lobby', 'rtsp://demo/cam5', 'offline'],
  ['Perimeter Gate', 'East Boundary', 'rtsp://demo/cam6', 'online'],
];

const threats = ['person', 'crowd', 'running', 'intrusion', 'fire', 'knife', 'weapon'];

// Fills the database with sample cameras and a couple of days of detections.
export async function seed() {
  await query('TRUNCATE events, cameras RESTART IDENTITY CASCADE');

  const cameraIds = [];
  for (const [name, location, url, status] of cameras) {
    const { rows } = await query(
      'INSERT INTO cameras (name, location, stream_url, status) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, location, url, status]
    );
    cameraIds.push(rows[0].id);
  }

  for (let i = 0; i < 80; i++) {
    const index = Math.floor(Math.random() * cameras.length);
    const cameraId = cameraIds[index];
    const threatType = threats[Math.floor(Math.random() * threats.length)];
    const severity = severityFor(threatType);
    const confidence = 0.6 + Math.random() * 0.39;
    const minutesAgo = Math.floor(Math.random() * 60 * 24 * 2);
    const createdAt = new Date(Date.now() - minutesAgo * 60000);

    const snapshot = generateFrame({
      threatType,
      severity,
      cameraName: cameras[index][0],
      confidence,
    });

    await query(
      `INSERT INTO events (camera_id, threat_type, severity, confidence, snapshot, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [cameraId, threatType, severity, confidence, snapshot, createdAt]
    );
  }

  console.log(`Seeded ${cameras.length} cameras and 80 events.`);
}

// Only seeds when the database is empty, so a deployed instance stays turnkey.
export async function seedIfEmpty() {
  const { rows } = await query('SELECT COUNT(*)::int AS n FROM cameras');
  if (rows[0].n === 0) await seed();
}

// Allow running `npm run seed` directly.
if (import.meta.url === `file://${process.argv[1]}`) {
  initDb()
    .then(seed)
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
