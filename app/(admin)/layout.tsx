'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { SessionProvider } from 'next-auth/react';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Loading component for suspense fallback
function LoadingSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#A76825]" />
    </div>
  );
}

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
    <SessionProvider>
      <div className="flex h-screen bg-[#F7F5F6]">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-auto p-6">
            <Suspense fallback={<LoadingSpinner />}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
      <Toaster position="top-center" />
    </SessionProvider>
  );
} 