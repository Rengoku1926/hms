'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {/* Tabs Navigation */}
      <nav className="mb-8">
        <ul className="flex space-x-4 border-b border-gray-700">
          <li>
            <Link href="/dashboard/patients">
              <span className={`py-2 px-4 ${pathname === '/dashboard/patients' ? 'border-b-2 border-blue-500' : ''}`}>
                Patients
              </span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/doctors">
              <span className={`py-2 px-4 ${pathname === '/dashboard/doctors' ? 'border-b-2 border-blue-500' : ''}`}>
                Doctors
              </span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/mappings">
              <span className={`py-2 px-4 ${pathname === '/dashboard/mappings' ? 'border-b-2 border-blue-500' : ''}`}>
                Mappings
              </span>
            </Link>
          </li>
        </ul>
      </nav>
      <main>{children}</main>
    </div>
  );
}
