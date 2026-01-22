'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UsersList } from '@/modules/UsersGuard/admin/components/UsersList';
import { useAuth } from '@/modules/UsersGuard/admin/hooks/useAuth'

/**
 * Admin Users Page
 * Protected route that displays the list of users
 */
export default function UsersPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <UsersList />;
}
