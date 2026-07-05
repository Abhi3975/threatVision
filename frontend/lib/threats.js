export const SEVERITY = {
  low: { label: 'Low', color: '#3b82f6' },
  medium: { label: 'Medium', color: '#f59e0b' },
  high: { label: 'High', color: '#f97316' },
  critical: { label: 'Critical', color: '#ef4444' },
};

export const THREAT_LABELS = {
  person: 'Person',
  crowd: 'Crowd Gathering',
  running: 'Running Person',
  intrusion: 'Intrusion',
  fire: 'Fire',
  knife: 'Knife',
  weapon: 'Weapon',
};

export const THREAT_ICONS = {
  person: '🚶',
  crowd: '👥',
  running: '🏃',
  intrusion: '🚧',
  fire: '🔥',
  knife: '🔪',
  weapon: '🔫',
};

export function threatLabel(type) {
  return THREAT_LABELS[type] || type;
}

export function timeAgo(iso) {
  const then = new Date(iso.replace(' ', 'T') + 'Z');
  const diff = Math.floor((Date.now() - then.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
