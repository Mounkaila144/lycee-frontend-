'use client'

// React Imports
import { useState } from 'react'

// Type Imports
import type { ReactNode } from 'react'

// Third-party Imports
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Context Imports from Carpentry project
import { TenantProvider } from '@/shared/lib/tenant-context'
import { SidebarProvider } from '@/shared/lib/sidebar-context'
import { PermissionsProvider } from '@/shared/contexts'
import { LanguageProvider } from '@/shared/lib/language-context'
import { TranslationProvider } from '@/shared/i18n/translation-provider'
import { LanguageSynchronizer } from '@/components/LanguageSynchronizer'

type Props = {
  children: ReactNode
}

/**
 * Client-side Providers
 *
 * Wraps the application with all client-side contexts from the Carpentry project:
 * - QueryClientProvider: React Query for server state management
 * - LanguageProvider: Language/locale management
 * - TranslationProvider: Translation context (depends on LanguageProvider)
 * - TenantProvider: Multi-tenant support with tenant ID and domain management
 * - PermissionsProvider: User permissions and role-based access control
 * - SidebarProvider: Sidebar collapse/expand state management
 *
 * These providers must be client components and are wrapped inside the server-side Providers
 */
const ClientProviders = (props: Props) => {
  const { children } = props

  // Create QueryClient instance (must be inside component to avoid sharing between requests)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
            gcTime: 30 * 60 * 1000, // 30 minutes - cache garbage collection
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 1, // Only retry once on failure
          }
        }
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TranslationProvider>
          <LanguageSynchronizer />
          <TenantProvider>
            <PermissionsProvider>
              <SidebarProvider>
                {children}
              </SidebarProvider>
            </PermissionsProvider>
          </TenantProvider>
        </TranslationProvider>
      </LanguageProvider>
    </QueryClientProvider>
  )
}

export default ClientProviders
