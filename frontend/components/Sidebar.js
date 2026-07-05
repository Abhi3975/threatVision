'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Dashboard', icon: '🖥️' },
  { href: '/events', label: 'Events', icon: '📋' },
  { href: '/analytics', label: 'Analytics', icon: '📊' },
  { href: '/cameras', label: 'Cameras', icon: '📹' },
  { href: '/evidence', label: 'Evidence', icon: '🖼️' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="brand">
        🛡️ Threat<span>Watch</span>
      </div>
      <nav>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link ${pathname === link.href ? 'active' : ''}`}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
