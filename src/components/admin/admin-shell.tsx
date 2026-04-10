'use client';

import { usePathname, useRouter } from 'next/navigation';
import { SessionProvider, useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { useEffect } from 'react';
import { AdminSidebar } from './sidebar';
import { Toaster } from '@/components/ui/sonner';

function AdminShellInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/admin/login';

  // Redirect to login if not authenticated and not on login page
  useEffect(() => {
    if (status === 'unauthenticated' && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [status, isLoginPage, router]);

  // Redirect to dashboard if authenticated and on login page
  useEffect(() => {
    if (status === 'authenticated' && isLoginPage) {
      router.push('/admin');
    }
  }, [status, isLoginPage, router]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
      </div>
    );
  }

  // Login page — render without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Not authenticated — render nothing (redirect will happen)
  if (!session) {
    return null;
  }

  // Authenticated — render with sidebar
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-14 border-b flex items-center px-4 gap-2 bg-background sticky top-0 z-10">
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{session.user?.email}</span>
          </div>
        </header>
        <main className="flex-1 p-6 bg-muted/30">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}

export function AdminShell({ children, session }: { children: React.ReactNode; session: Session | null }) {
  return (
    <SessionProvider session={session}>
      <AdminShellInner>{children}</AdminShellInner>
    </SessionProvider>
  );
}
