import fs from 'fs';
import path from 'path';
import { EVIDENCE_DIR } from './config.js';
import { THREAT_LABELS } from './threats.js';

const severityColor = {
  low: '#3b82f6',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

// In demo mode we don't have real camera frames, so we render a stylised
// "captured frame" as an SVG that mimics a CCTV snapshot with an overlay.
export function generateFrame({ threatType, severity, cameraName, confidence }) {
  const color = severityColor[severity] || '#3b82f6';
  const label = THREAT_LABELS[threatType] || threatType;
  const time = new Date().toLocaleString();
  const bx = 90 + Math.floor(Math.random() * 180);
  const by = 60 + Math.floor(Math.random() * 90);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="270" viewBox="0 0 480 270">
  <rect width="480" height="270" fill="#0b1220"/>
  <g opacity="0.15" stroke="#334155">
    ${Array.from({ length: 9 }, (_, i) => `<line x1="${i * 60}" y1="0" x2="${i * 60}" y2="270"/>`).join('')}
    ${Array.from({ length: 5 }, (_, i) => `<line x1="0" y1="${i * 60}" x2="480" y2="${i * 60}"/>`).join('')}
  </g>
  <rect x="${bx}" y="${by}" width="120" height="140" fill="none" stroke="${color}" stroke-width="3"/>
  <rect x="${bx}" y="${by - 20}" width="120" height="20" fill="${color}"/>
  <text x="${bx + 6}" y="${by - 6}" fill="#0b1220" font-family="monospace" font-size="12" font-weight="bold">${label} ${(confidence * 100).toFixed(0)}%</text>
  <text x="12" y="24" fill="#e2e8f0" font-family="monospace" font-size="13">${cameraName || 'CAM'}</text>
  <text x="12" y="258" fill="#94a3b8" font-family="monospace" font-size="11">${time}</text>
  <circle cx="462" cy="18" r="5" fill="#ef4444"/>
  <text x="430" y="22" fill="#ef4444" font-family="monospace" font-size="11">REC</text>
</svg>`;

  const filename = `${Date.now()}-${threatType}.svg`;
  fs.writeFileSync(path.join(EVIDENCE_DIR, filename), svg);
  return filename;
}
