import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/summary', (req, res) => {
  const totalEvents = db.prepare('SELECT COUNT(*) AS n FROM events').get().n;
  const critical = db
    .prepare("SELECT COUNT(*) AS n FROM events WHERE severity = 'critical'").get().n;
  const camerasOnline = db
    .prepare("SELECT COUNT(*) AS n FROM cameras WHERE status = 'online'").get().n;
  const camerasTotal = db.prepare('SELECT COUNT(*) AS n FROM cameras').get().n;

  const byType = db
    .prepare('SELECT threat_type, COUNT(*) AS count FROM events GROUP BY threat_type ORDER BY count DESC')
    .all();

  const bySeverity = db
    .prepare('SELECT severity, COUNT(*) AS count FROM events GROUP BY severity')
    .all();

  // Detections grouped by hour for the last 24 hours.
  const timeline = db
    .prepare(
      `SELECT strftime('%Y-%m-%d %H:00', created_at) AS hour, COUNT(*) AS count
       FROM events
       WHERE created_at >= datetime('now', '-24 hours')
       GROUP BY hour
       ORDER BY hour`
    )
    .all();

  res.json({
    totalEvents,
    critical,
    camerasOnline,
    camerasTotal,
    byType,
    bySeverity,
    timeline,
  });
});

export default router;
