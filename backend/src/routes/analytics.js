import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/summary', async (req, res) => {
  const totals = await query(`
    SELECT
      (SELECT COUNT(*)::int FROM events) AS total_events,
      (SELECT COUNT(*)::int FROM events WHERE severity = 'critical') AS critical,
      (SELECT COUNT(*)::int FROM cameras WHERE status = 'online') AS cameras_online,
      (SELECT COUNT(*)::int FROM cameras) AS cameras_total
  `);

  const byType = await query(
    'SELECT threat_type, COUNT(*)::int AS count FROM events GROUP BY threat_type ORDER BY count DESC'
  );

  const bySeverity = await query(
    'SELECT severity, COUNT(*)::int AS count FROM events GROUP BY severity'
  );

  // Detections grouped by hour for the last 24 hours.
  const timeline = await query(`
    SELECT to_char(date_trunc('hour', created_at), 'YYYY-MM-DD HH24:00') AS hour,
           COUNT(*)::int AS count
    FROM events
    WHERE created_at >= now() - interval '24 hours'
    GROUP BY 1
    ORDER BY 1
  `);

  const t = totals.rows[0];
  res.json({
    totalEvents: t.total_events,
    critical: t.critical,
    camerasOnline: t.cameras_online,
    camerasTotal: t.cameras_total,
    byType: byType.rows,
    bySeverity: bySeverity.rows,
    timeline: timeline.rows,
  });
});

export default router;
