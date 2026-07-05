import { frameUrl } from '../lib/api';
import { threatLabel, timeAgo } from '../lib/threats';

export default function CameraPanel({ camera, lastEvent }) {
  const online = camera.status === 'online';
  const frame = lastEvent ? frameUrl(lastEvent.snapshot) : null;

  return (
    <div className="camera-panel">
      <div className="camera-feed">
        {online && frame ? (
          <img src={frame} alt={camera.name} />
        ) : (
          <div className="offline-note">
            {online ? 'Monitoring — no recent detection' : '● Camera offline'}
          </div>
        )}

        {online && lastEvent && (
          <div className="camera-tag">
            {threatLabel(lastEvent.threat_type)} · {timeAgo(lastEvent.created_at)}
          </div>
        )}
      </div>

      <div className="camera-info">
        <div>
          <div className="name">{camera.name}</div>
          <div className="loc">{camera.location}</div>
        </div>
        <span className="status">
          <span className={`dot ${online ? 'on' : 'off'}`} />
          {online ? 'Live' : 'Offline'}
        </span>
      </div>
    </div>
  );
}
