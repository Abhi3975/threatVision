import { Router } from 'express';
import db from '../db.js';

const router = Router();

// Returns events that have a captured frame, newest first, for the gallery.
router.get('/', (req, res) => {
  const rows = db
    .prepare(
      `SELECT e.id, e.threat_type, e.severity, e.confidence, e.snapshot, e.created_at,
              c.name AS camera_name
       FROM events e
       LEFT JOIN cameras c ON c.id = e.camera_id
       WHERE e.snapshot IS NOT NULL
       ORDER BY e.created_at DESC
       LIMIT 60`
    )
    .all();

  res.json(rows);
});

export default router;
