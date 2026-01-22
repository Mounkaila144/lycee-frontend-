# Project Overview - Carpentry Multi-Tenant Admin

## Project Type
Multi-tenant admin dashboard with Next.js 15, Material-UI 6, and Laravel backend.

## Key Technologies
- **Frontend**: Next.js 15 (App Router), Material-UI 6, TypeScript, Redux Toolkit
- **Backend**: Laravel API (multi-tenant with domain-based routing)
- **Authentication**: Custom JWT (not NextAuth - to be integrated)
- **Database**: SQLite (dev), PostgreSQL (production)
- **Styling**: MUI components (primary) + Tailwind CSS v3 (utilities)
- **i18n**: Built-in system with [lang] routing (en/fr/ar) + RTL support

## Project Structure
```
src/
├── modules/              # Business modules (UsersGuard, Dashboard, Site, SuperAdmin)
├── shared/               # Shared utilities (contexts, hooks, lib, types)
├── app/[lang]/          # Next.js routes
│   ├── admin/           # Tenant-specific admin routes
│   ├── superadmin/      # Central superadmin routes
│   └── cms/             # Public CMS frontend
├── components/          # Reusable components
├── @core/               # Template core (theme, hooks, utils)
├── @layouts/            # Layouts (Vertical, Horizontal, Blank)
└── @menu/               # Menu system
```

## Multi-Tenancy Architecture

### Three Contexts
1. **Admin** (`/[lang]/admin/*`)
   - Tenant-specific database
   - Requires authentication + tenant context
   - API: `/api/admin/*`
   - Uses `X-Tenant-ID` header

2. **SuperAdmin** (`/[lang]/superadmin/*`)
   - Central database
   - Requires superadmin authentication
   - API: `/api/superadmin/*`
   - No tenant header

3. **Frontend** (`/[lang]/cms/*`)
   - Public pages (no auth required)
   - Tenant-specific content
   - API: `/api/cms/*`

### Tenant Detection
- **Domain-based**: Laravel detects tenant from domain automatically
- **No X-Tenant-ID needed** when on same domain
- Tenant info stored in localStorage for client-side context

## Global Contexts (ClientProviders)
All wrapped in `src/components/ClientProviders.tsx`:
- `LanguageProvider` - Language/locale management
- `TranslationProvider` - Translation context
- `TenantProvider` - Multi-tenant support (tenantId, domain)
- `PermissionsProvider` - Symfony 1 style permissions (hasCredential)
- `SidebarProvider` - Sidebar state management

## API Client Configuration
File: `src/shared/lib/api-client.ts`

**Automatic Headers:**
- `Authorization: Bearer {token}` (from localStorage)
- `X-Tenant-ID: {tenantId}` (admin context only)
- `Accept-Language: {locale}` (from URL [lang])

**Error Handling:**
- 401 → Auto logout + redirect to login
- Context-aware redirects (admin vs superadmin)

## Authentication System
**Current**: Custom JWT authentication (UsersGuard module)
- Login stores token in localStorage
- Separate tokens for admin/superadmin
- Permissions cached locally (no additional API calls)

**To Integrate**: NextAuth.js (in progress)
- File: `src/libs/auth.ts`
- Need to adapt with Laravel backend

## Permissions System
Style: Symfony 1 `hasCredential()`

**Usage:**
```typescript
import { usePermissions } from '@/shared/contexts'

const { hasCredential, hasGroup, isSuperadmin } = usePermissions()

// Check single credential (group OR permission)
hasCredential('admin')

// Check multiple (OR logic) - Symfony style
hasCredential([['admin', 'superadmin', 'users.edit']])

// Check multiple (AND logic)
hasCredential(['users.view', 'users.edit'], true)

// Check group membership
hasGroup('1-FIDEALIS')
```

## Module System
Each module follows this structure:
```
ModuleName/
├── admin/              # Tenant admin functionality
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── utils/
├── superadmin/         # Central admin functionality
├── frontend/           # Public functionality
├── types/              # Shared TypeScript types
├── menu.config.ts      # Menu configuration
└── index.ts            # Barrel exports
```

**Existing Modules:**
- UsersGuard (authentication)
- Dashboard (admin dashboard)
- Site (superadmin site management)
- SuperAdmin (CMS: pages, blocks, menus, settings)

## Path Aliases (tsconfig.json)
- `@/*` → `src/*`
- `@core/*` → `src/@core/*`
- `@layouts/*` → `src/@layouts/*`
- `@menu/*` → `src/@menu/*`
- `@components/*` → `src/components/*`
- `@modules/*` → `src/modules/*`
- `@shared/*` → `src/shared/*`

## Environment Variables
```env
# API Configuration
API_URL=/api                                    # Server-side API calls
NEXT_PUBLIC_API_URL=/api                        # Client-side API calls
NEXT_PUBLIC_CMS_API_URL=https://carpentry-project.be/api

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Database
DATABASE_URL=file:./src/prisma/dev.db
```

## Migration Status
**Completed:**
- ✅ Module structure copied
- ✅ Contexts integrated (Tenant, Permissions, Sidebar)
- ✅ API client configured
- ✅ Routing setup (admin/superadmin/cms)
- ✅ Middleware (i18n + multi-tenant)

**In Progress:**
- ⏳ Component conversion (Tailwind → MUI)
- ⏳ Authentication integration (NextAuth + Laravel)
- ⏳ Dynamic menu system
- ⏳ i18n system fusion

## Important Notes
- **Always use MUI components** for new UI (not pure Tailwind)
- **Client components** must have `'use client'` directive
- **API calls** use `createApiClient()` from `@/shared/lib/api-client`
- **Permissions** are cached locally (no API calls after login)
- **Tenant context** is automatic via domain (no manual X-Tenant-ID)
