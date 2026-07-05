'use client';

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from './api';
import { threatLabel } from './threats';

// Short beep using the Web Audio API so we don't need to ship an audio file.
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Audio may be blocked until the user interacts with the page — ignore.
  }
}

function notify(event) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  new Notification(`${threatLabel(event.threat_type)} detected`, {
    body: `${event.camera_name || 'Unknown camera'} · ${(event.confidence * 100).toFixed(0)}% confidence`,
  });
}

// Connects to the backend and keeps a rolling list of the latest alerts.
export function useAlerts({ sound = true, notifications = true } = {}) {
  const [alerts, setAlerts] = useState([]);
  const [connected, setConnected] = useState(false);
  const settings = useRef({ sound, notifications });
  settings.current = { sound, notifications };

  useEffect(() => {
    const socket = io(API_URL, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('alert', (event) => {
      setAlerts((prev) => [event, ...prev].slice(0, 50));
      if (settings.current.sound) playBeep();
      if (settings.current.notifications && event.severity !== 'low') notify(event);
    });

    return () => socket.disconnect();
  }, []);

  return { alerts, connected };
}

export function requestNotificationPermission() {
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}
