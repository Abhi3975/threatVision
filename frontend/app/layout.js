import './globals.css';
import Sidebar from '../components/Sidebar';

export const metadata = {
  title: 'ThreatWatch-AI',
  description: 'AI-powered CCTV threat detection dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app">
          <Sidebar />
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
