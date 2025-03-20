// app/layout.tsx
import './globals.css';

export const metadata = {
  title: 'Healthcare App',
  description: 'Modern Healthcare App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        {children}
      </body>
    </html>
  );
}
