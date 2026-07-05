'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function CamerasPage() {
  const [cameras, setCameras] = useState([]);
  const [form, setForm] = useState({ name: '', location: '', streamUrl: '' });

  function load() {
    api.getCameras().then(setCameras).catch(() => {});
  }

  useEffect(() => { load(); }, []);

  async function addCamera(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const camera = await api.addCamera(form);
    setCameras((list) => [...list, camera]);
    setForm({ name: '', location: '', streamUrl: '' });
  }

  async function toggle(camera) {
    const status = camera.status === 'online' ? 'offline' : 'online';
    await api.setCameraStatus(camera.id, status);
    setCameras((list) => list.map((c) => (c.id === camera.id ? { ...c, status } : c)));
  }

  async function remove(id) {
    await api.removeCamera(id);
    setCameras((list) => list.filter((c) => c.id !== id));
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Cameras</h1>
          <p>Manage connected camera feeds</p>
        </div>
      </div>

      <form className="panel" onSubmit={addCamera} style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Add Camera</h3>
        <div className="toolbar" style={{ marginBottom: 0 }}>
          <input
            placeholder="Camera name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <input
            placeholder="rtsp:// stream url (optional)"
            value={form.streamUrl}
            onChange={(e) => setForm({ ...form, streamUrl: e.target.value })}
            style={{ minWidth: 240 }}
          />
          <button className="btn" type="submit">Add</button>
        </div>
      </form>

      <div className="panel" style={{ padding: 0, overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Stream</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cameras.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.location || '—'}</td>
                <td style={{ color: 'var(--muted)', fontFamily: 'monospace', fontSize: 12 }}>
                  {c.stream_url || '—'}
                </td>
                <td>
                  <span className="status">
                    <span className={`dot ${c.status === 'online' ? 'on' : 'off'}`} />
                    {c.status}
                  </span>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button className="btn ghost small" onClick={() => toggle(c)}>
                    {c.status === 'online' ? 'Take offline' : 'Bring online'}
                  </button>{' '}
                  <button className="btn danger small" onClick={() => remove(c.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cameras.length === 0 && <div className="empty">No cameras yet. Add one above.</div>}
      </div>
    </>
  );
}
