import db from './db.js';
import { severityFor } from './threats.js';
import { broadcast } from './realtime.js';

const insert = db.prepare(`
  INSERT INTO events (camera_id, threat_type, severity, confidence, snapshot)
  VALUES (@camera_id, @threat_type, @severity, @confidence, @snapshot)
`);

const withCamera = db.prepare(`
  SELECT e.*, c.name AS camera_name, c.location AS camera_location
  FROM events e
  LEFT JOIN cameras c ON c.id = e.camera_id
  WHERE e.id = ?
`);

// Records a detection, stores it and pushes a live alert to connected clients.
export function recordDetection({ cameraId, threatType, confidence, snapshot = null }) {
  const severity = severityFor(threatType);
  const result = insert.run({
    camera_id: cameraId,
    threat_type: threatType,
    severity,
    confidence,
    snapshot,
  });

  const event = withCamera.get(result.lastInsertRowid);
  broadcast('alert', event);
  return event;
}
