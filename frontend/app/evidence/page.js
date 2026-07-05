'use client';

import { useEffect, useState } from 'react';
import { api, frameUrl } from '../../lib/api';
import Badge from '../../components/Badge';
import { THREAT_ICONS, threatLabel, timeAgo } from '../../lib/threats';

export default function EvidencePage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.getEvidence().then(setItems).catch(() => {});
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Evidence Gallery</h1>
          <p>Captured frames from detected threats</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="empty">No captured frames yet.</div>
      ) : (
        <div className="gallery">
          {items.map((item) => (
            <div className="evidence-card" key={item.id}>
              <img src={frameUrl(item.snapshot)} alt={item.threat_type} />
              <div className="caption">
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {THREAT_ICONS[item.threat_type]} {threatLabel(item.threat_type)}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: 12 }}>
                    {item.camera_name} · {timeAgo(item.created_at)}
                  </div>
                </div>
                <Badge severity={item.severity} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
