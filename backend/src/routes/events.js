import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

// Builds a filtered WHERE clause with numbered placeholders. Used by list and export.
function buildQuery(q) {
  const conditions = [];
  const params = [];
  const add = (sql, value) => {
    params.push(value);
    conditions.push(sql.replace('?', `$${params.length}`));
  };

  if (q.type) add('e.threat_type = ?', q.type);
  if (q.severity) add('e.severity = ?', q.severity);
  if (q.cameraId) add('e.camera_id = ?', q.cameraId);
  if (q.since) add('e.created_at >= ?', q.since);
  if (q.search) {
    params.push(`%${q.search}%`);
    const p = `$${params.length}`;
    conditions.push(`(e.threat_type ILIKE ${p} OR c.name ILIKE ${p} OR c.location ILIKE ${p})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, params };
}

router.get('/', async (req, res) => {
  const { where, params } = buildQuery(req.query);
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  params.push(limit);

  const { rows } = await query(
    `SELECT e.*, c.name AS camera_name, c.location AS camera_location
     FROM events e
     LEFT JOIN cameras c ON c.id = e.camera_id
     ${where}
     ORDER BY e.created_at DESC
     LIMIT $${params.length}`,
    params
  );
  res.json(rows);
});

router.get('/export', async (req, res) => {
  const { where, params } = buildQuery(req.query);
  const { rows } = await query(
    `SELECT e.id, e.threat_type, e.severity, e.confidence, e.created_at,
            c.name AS camera_name, c.location AS camera_location
     FROM events e
     LEFT JOIN cameras c ON c.id = e.camera_id
     ${where}
     ORDER BY e.created_at DESC`,
    params
  );

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
        r.created_at.toISOString(),
      ].join(',')
    )
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="threatwatch-events.csv"');
  res.send(header + body);
});

router.patch('/:id/acknowledge', async (req, res) => {
  await query('UPDATE events SET acknowledged = true WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  await query('DELETE FROM events WHERE id = $1', [req.params.id]);
  res.status(204).end();
});

export default router;
