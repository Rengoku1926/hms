// app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">Healthcare App</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <Link href="/login" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded hover:opacity-90">
          Login
        </Link>
        <Link href="/register" className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded hover:opacity-90">
          Register
        </Link>
      </div>
    </main>
  );
}
