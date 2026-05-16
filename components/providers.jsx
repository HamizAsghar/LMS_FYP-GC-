'use client';

import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }) {
  return (
    <AuthProvider>
      {children}
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}
