import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { recordDetection } from '../detections.js';
import { EVIDENCE_DIR } from '../config.js';

const router = Router();

// Endpoint the AI detection service posts to when it finds a threat.
// Accepts an optional base64 JPEG which is saved as evidence.
router.post('/', (req, res) => {
  const { cameraId, threatType, confidence, image } = req.body;

  if (!threatType || confidence == null) {
    return res.status(400).json({ error: 'threatType and confidence are required' });
  }

  let snapshot = null;
  if (image) {
    const base64 = image.replace(/^data:image\/\w+;base64,/, '');
    const filename = `${Date.now()}-${threatType}.jpg`;
    fs.writeFileSync(path.join(EVIDENCE_DIR, filename), Buffer.from(base64, 'base64'));
    snapshot = filename;
  }

  const event = recordDetection({
    cameraId: cameraId || null,
    threatType,
    confidence: Number(confidence),
    snapshot,
  });

  res.status(201).json(event);
});

export default router;
