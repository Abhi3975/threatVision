import { Router } from 'express';
import db from '../db.js';

const router = Router();

const listStmt = db.prepare('SELECT * FROM cameras ORDER BY id');
const getStmt = db.prepare('SELECT * FROM cameras WHERE id = ?');
const insertStmt = db.prepare(
  'INSERT INTO cameras (name, location, stream_url, status) VALUES (?, ?, ?, ?)'
);
const statusStmt = db.prepare('UPDATE cameras SET status = ? WHERE id = ?');
const deleteStmt = db.prepare('DELETE FROM cameras WHERE id = ?');

router.get('/', (req, res) => {
  res.json(listStmt.all());
});

router.post('/', (req, res) => {
  const { name, location, streamUrl } = req.body;
  if (!name) return res.status(400).json({ error: 'Camera name is required' });

  const info = insertStmt.run(name, location || '', streamUrl || '', 'online');
  res.status(201).json(getStmt.get(info.lastInsertRowid));
});

router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['online', 'offline'].includes(status)) {
    return res.status(400).json({ error: 'Status must be online or offline' });
  }
  statusStmt.run(status, req.params.id);
  res.json(getStmt.get(req.params.id));
});

router.delete('/:id', (req, res) => {
  deleteStmt.run(req.params.id);
  res.status(204).end();
});

export default router;
