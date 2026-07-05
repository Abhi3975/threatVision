// Threat categories the system recognises and their default severity.
export const THREAT_SEVERITY = {
  person: 'low',
  crowd: 'medium',
  running: 'medium',
  intrusion: 'high',
  fire: 'critical',
  knife: 'critical',
  weapon: 'critical',
};

export const THREAT_LABELS = {
  person: 'Person Detected',
  crowd: 'Crowd Gathering',
  running: 'Running Person',
  intrusion: 'Unauthorized Intrusion',
  fire: 'Fire',
  knife: 'Knife',
  weapon: 'Weapon',
};

export function severityFor(threatType) {
  return THREAT_SEVERITY[threatType] || 'low';
}
