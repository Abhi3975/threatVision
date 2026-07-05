import { query } from './db.js';
import { recordDetection } from './detections.js';
import { generateFrame } from './frame.js';
import { severityFor } from './threats.js';

// Weighted so that low-severity detections are common and critical ones rare,
// which keeps the demo feed believable.
const weightedThreats = [
  'person', 'person', 'person', 'person',
  'crowd', 'crowd',
  'running', 'running',
  'intrusion',
  'fire',
  'knife',
  'weapon',
];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Generates a random detection roughly every few seconds while demo mode is on.
export function startSimulator() {
  console.log('Demo simulator running — generating sample detections');

  setInterval(async () => {
    try {
      const { rows: cameras } = await query("SELECT * FROM cameras WHERE status = 'online'");
      if (cameras.length === 0) return;

      const camera = pick(cameras);
      const threatType = pick(weightedThreats);
      const confidence = 0.6 + Math.random() * 0.39;
      const severity = severityFor(threatType);

      const snapshot = generateFrame({
        threatType,
        severity,
        cameraName: camera.name,
        confidence,
      });

      await recordDetection({
        cameraId: camera.id,
        threatType,
        confidence,
        snapshot,
      });
    } catch (err) {
      console.error('Simulator error:', err.message);
    }
  }, 4000);
}
