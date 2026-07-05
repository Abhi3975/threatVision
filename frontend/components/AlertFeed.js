import Badge from './Badge';
import { SEVERITY, THREAT_ICONS, threatLabel, timeAgo } from '../lib/threats';

export default function AlertFeed({ alerts, connected }) {
  return (
    <div className="alert-feed">
      <h3>
        Live Alerts
        <span className="status">
          <span className={`dot ${connected ? 'on' : 'off'}`} />
          {connected ? 'Connected' : 'Offline'}
        </span>
      </h3>

      <div className="alert-list">
        {alerts.length === 0 && <div className="empty">Waiting for detections…</div>}
        {alerts.map((a) => {
          const color = (SEVERITY[a.severity] || SEVERITY.low).color;
          return (
            <div key={a.id} className="alert-item" style={{ borderLeftColor: color }}>
              <div className="icon">{THREAT_ICONS[a.threat_type] || '⚠️'}</div>
              <div className="body">
                <div className="title">{threatLabel(a.threat_type)}</div>
                <div className="meta">
                  {a.camera_name || 'Unknown'} · {(a.confidence * 100).toFixed(0)}% · {timeAgo(a.created_at)}
                </div>
              </div>
              <Badge severity={a.severity} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
