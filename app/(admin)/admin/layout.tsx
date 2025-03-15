'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSignInPage = pathname === '/admin/signin';

  // If it's the sign-in page, render without the admin layout
  if (isSignInPage) {
    return (
      <>
        {children}
        <Toaster position="top-center" />
      </>
    );
  }

  // For all other admin pages, render with the admin layout
  return (
    <div className="min-h-screen bg-[#F7F5F6]">
      {/* We'll add the admin navigation and header later */}
      <main className="p-6">
        {children}
      </main>
      <Toaster position="top-center" />
    </div>
  );
} 