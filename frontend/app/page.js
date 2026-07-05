'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { useAlerts, requestNotificationPermission } from '../lib/useAlerts';
import CameraPanel from '../components/CameraPanel';
import AlertFeed from '../components/AlertFeed';

export default function Dashboard() {
  const [cameras, setCameras] = useState([]);
  const [recent, setRecent] = useState([]);
  const { alerts, connected } = useAlerts();

  useEffect(() => {
    requestNotificationPermission();
    api.getCameras().then(setCameras).catch(() => {});
    api.getEvents({ limit: 50 }).then(setRecent).catch(() => {});
  }, []);

  // Combine the events loaded on mount with anything streamed in since,
  // dropping duplicates so the feed shows history straight away and then
  // grows as live alerts come in.
  const events = useMemo(() => {
    const seen = new Set();
    return [...alerts, ...recent].filter((e) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
  }, [alerts, recent]);

  // Newest event that carries a frame, per camera.
  const latestByCamera = useMemo(() => {
    const map = {};
    for (const e of events) {
      if (e.snapshot && !map[e.camera_id]) map[e.camera_id] = e;
    }
    return map;
  }, [events]);

  const criticalCount = events.filter((e) => e.severity === 'critical').length;
  const onlineCount = cameras.filter((c) => c.status === 'online').length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Security Operations Center</h1>
          <p>Real-time monitoring across {cameras.length} cameras</p>
        </div>
        <span className="status">
          <span className={`dot ${connected ? 'on' : 'off'}`} />
          {connected ? 'System online' : 'Reconnecting…'}
        </span>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Cameras Online</div>
          <div className="value">{onlineCount}/{cameras.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">Live Alerts</div>
          <div className="value">{alerts.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">Critical (session)</div>
          <div className="value" style={{ color: 'var(--critical)' }}>{criticalCount}</div>
        </div>
        <div className="stat-card">
          <div className="label">Recent Detections</div>
          <div className="value">{recent.length}</div>
        </div>
      </div>

      <div className="dashboard">
        <div className="camera-grid">
          {cameras.map((camera) => (
            <CameraPanel
              key={camera.id}
              camera={camera}
              lastEvent={latestByCamera[camera.id]}
            />
          ))}
        </div>

        <AlertFeed alerts={events.slice(0, 50)} connected={connected} />
      </div>
    </>
  );
}
