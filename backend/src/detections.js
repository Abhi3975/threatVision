import { query } from './db.js';
import { severityFor } from './threats.js';
import { broadcast } from './realtime.js';

// Records a detection, stores it and pushes a live alert to connected clients.
export async function recordDetection({ cameraId, threatType, confidence, snapshot = null }) {
  const severity = severityFor(threatType);

  const inserted = await query(
    `INSERT INTO events (camera_id, threat_type, severity, confidence, snapshot)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [cameraId, threatType, severity, confidence, snapshot]
  );

  const { rows } = await query(
    `SELECT e.*, c.name AS camera_name, c.location AS camera_location
     FROM events e
     LEFT JOIN cameras c ON c.id = e.camera_id
     WHERE e.id = $1`,
    [inserted.rows[0].id]
  );

  const event = rows[0];
  broadcast('alert', event);
  return event;
}
