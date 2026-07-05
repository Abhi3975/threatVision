import { Router } from 'express';
import db from '../db.js';

const router = Router();

// Builds a filtered query from the query string. Used by both list and export.
function buildQuery(query) {
  const conditions = [];
  const params = [];

  if (query.type) {
    conditions.push('e.threat_type = ?');
    params.push(query.type);
  }
  if (query.severity) {
    conditions.push('e.severity = ?');
    params.push(query.severity);
  }
  if (query.cameraId) {
    conditions.push('e.camera_id = ?');
    params.push(query.cameraId);
  }
  if (query.search) {
    conditions.push('(e.threat_type LIKE ? OR c.name LIKE ? OR c.location LIKE ?)');
    const like = `%${query.search}%`;
    params.push(like, like, like);
  }
  if (query.since) {
    conditions.push('e.created_at >= ?');
    params.push(query.since);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, params };
}

router.get('/', (req, res) => {
  const { where, params } = buildQuery(req.query);
  const limit = Math.min(Number(req.query.limit) || 100, 500);

  const rows = db
    .prepare(
      `SELECT e.*, c.name AS camera_name, c.location AS camera_location
       FROM events e
       LEFT JOIN cameras c ON c.id = e.camera_id
       ${where}
       ORDER BY e.created_at DESC
       LIMIT ?`
    )
    .all(...params, limit);

  res.json(rows);
});

router.get('/export', (req, res) => {
  const { where, params } = buildQuery(req.query);
  const rows = db
    .prepare(
      `SELECT e.id, e.threat_type, e.severity, e.confidence, e.created_at,
              c.name AS camera_name, c.location AS camera_location
       FROM events e
       LEFT JOIN cameras c ON c.id = e.camera_id
       ${where}
       ORDER BY e.created_at DESC`
    )
    .all(...params);

  const header = 'id,threat_type,severity,confidence,camera,location,time\n';
  const body = rows
    .map((r) =>
      [
        r.id,
        r.threat_type,
        r.severity,
        r.confidence,
        r.camera_name || '',
        r.camera_location || '',
        r.created_at,
      ].join(',')
    )
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="threatwatch-events.csv"');
  res.send(header + body);
});

router.patch('/:id/acknowledge', (req, res) => {
  db.prepare('UPDATE events SET acknowledged = 1 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

export default router;
