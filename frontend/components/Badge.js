import { SEVERITY } from '../lib/threats';

export default function Badge({ severity }) {
  const info = SEVERITY[severity] || SEVERITY.low;
  return (
    <span
      className="badge"
      style={{ background: `${info.color}22`, color: info.color }}
    >
      {info.label}
    </span>
  );
}
