'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { SEVERITY, threatLabel } from '../../lib/threats';

function BarChart({ items, colorFor, labelFor }) {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <div>
      {items.map((item, i) => (
        <div className="bar-row" key={i}>
          <div className="bar-label">{labelFor(item)}</div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${(item.count / max) * 100}%`, background: colorFor(item) }}
            />
          </div>
          <div className="bar-count">{item.count}</div>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getAnalytics().then(setData).catch(() => {});
  }, []);

  if (!data) return <div className="empty">Loading analytics…</div>;

  const maxTimeline = Math.max(...data.timeline.map((t) => t.count), 1);
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const bySeverity = [...data.bySeverity].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p>Detection trends and breakdowns</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Total Detections</div>
          <div className="value">{data.totalEvents}</div>
        </div>
        <div className="stat-card">
          <div className="label">Critical Events</div>
          <div className="value" style={{ color: 'var(--critical)' }}>{data.critical}</div>
        </div>
        <div className="stat-card">
          <div className="label">Cameras Online</div>
          <div className="value">{data.camerasOnline}/{data.camerasTotal}</div>
        </div>
        <div className="stat-card">
          <div className="label">Threat Types</div>
          <div className="value">{data.byType.length}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Detections by Threat Type</h3>
          <BarChart
            items={data.byType}
            labelFor={(i) => threatLabel(i.threat_type)}
            colorFor={() => 'var(--accent)'}
          />
        </div>

        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Detections by Severity</h3>
          <BarChart
            items={bySeverity}
            labelFor={(i) => (SEVERITY[i.severity] || SEVERITY.low).label}
            colorFor={(i) => (SEVERITY[i.severity] || SEVERITY.low).color}
          />
        </div>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <h3 style={{ marginTop: 0 }}>Activity — Last 24 Hours</h3>
        {data.timeline.length === 0 ? (
          <div className="empty">No activity in the last 24 hours.</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 160 }}>
            {data.timeline.map((t, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }} title={`${t.hour}: ${t.count}`}>
                <div
                  style={{
                    height: `${(t.count / maxTimeline) * 130}px`,
                    background: 'var(--accent)',
                    borderRadius: '4px 4px 0 0',
                  }}
                />
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                  {t.hour.slice(11, 13)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
