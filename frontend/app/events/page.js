'use client';

import { useEffect, useState } from 'react';
import { api, API_URL } from '../../lib/api';
import Badge from '../../components/Badge';
import { THREAT_ICONS, threatLabel, timeAgo, THREAT_LABELS } from '../../lib/threats';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({ search: '', type: '', severity: '' });

  function load() {
    api.getEvents({ ...filters, limit: 200 }).then(setEvents).catch(() => {});
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  function update(field, value) {
    setFilters((f) => ({ ...f, [field]: value }));
  }

  async function acknowledge(id) {
    await api.acknowledgeEvent(id);
    setEvents((list) => list.map((e) => (e.id === id ? { ...e, acknowledged: 1 } : e)));
  }

  async function remove(id) {
    await api.deleteEvent(id);
    setEvents((list) => list.filter((e) => e.id !== id));
  }

  const exportUrl = `${API_URL}/api/events/export?${new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v)
  )}`;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Events</h1>
          <p>{events.length} detections</p>
        </div>
        <a className="btn" href={exportUrl}>Export CSV</a>
      </div>

      <div className="toolbar">
        <input
          placeholder="Search camera or location…"
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          style={{ minWidth: 220 }}
        />
        <select value={filters.type} onChange={(e) => update('type', e.target.value)}>
          <option value="">All threats</option>
          {Object.entries(THREAT_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select value={filters.severity} onChange={(e) => update('severity', e.target.value)}>
          <option value="">All severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="panel" style={{ padding: 0, overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Threat</th>
              <th>Camera</th>
              <th>Severity</th>
              <th>Confidence</th>
              <th>Time</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} style={{ opacity: e.acknowledged ? 0.55 : 1 }}>
                <td>{THREAT_ICONS[e.threat_type]} {threatLabel(e.threat_type)}</td>
                <td>
                  {e.camera_name || '—'}
                  <div className="loc" style={{ color: 'var(--muted)', fontSize: 12 }}>
                    {e.camera_location}
                  </div>
                </td>
                <td><Badge severity={e.severity} /></td>
                <td>{(e.confidence * 100).toFixed(0)}%</td>
                <td>{timeAgo(e.created_at)}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {!e.acknowledged && (
                    <button className="btn ghost small" onClick={() => acknowledge(e.id)}>
                      Ack
                    </button>
                  )}{' '}
                  <button className="btn danger small" onClick={() => remove(e.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {events.length === 0 && <div className="empty">No events match your filters.</div>}
      </div>
    </>
  );
}
