import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  const { rows } = await query('SELECT * FROM cameras ORDER BY id');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { name, location, streamUrl } = req.body;
  if (!name) return res.status(400).json({ error: 'Camera name is required' });

  const { rows } = await query(
    `INSERT INTO cameras (name, location, stream_url, status)
     VALUES ($1, $2, $3, 'online') RETURNING *`,
    [name, location || '', streamUrl || '']
  );
  res.status(201).json(rows[0]);
});

router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['online', 'offline'].includes(status)) {
    return res.status(400).json({ error: 'Status must be online or offline' });
  }
  const { rows } = await query(
    'UPDATE cameras SET status = $1 WHERE id = $2 RETURNING *',
    [status, req.params.id]
  );
  res.json(rows[0]);
});

router.delete('/:id', async (req, res) => {
  await query('DELETE FROM cameras WHERE id = $1', [req.params.id]);
  res.status(204).end();
});

export default router;
