# Common Tasks & Development Workflow

## Creating a New Module

### Step 1: Create Directory Structure
```bash
mkdir -p src/modules/MyModule/{admin,superadmin,frontend}/{components,hooks,services,utils}
mkdir src/modules/MyModule/types
```

### Step 2: Create Types
```typescript
// src/modules/MyModule/types/mymodule.types.ts
export interface MyData {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
}

export interface MyDataFormInput {
  name: string
  description: string
}
```

### Step 3: Create Service
```typescript
// src/modules/MyModule/admin/services/myService.ts
import { createApiClient } from '@/shared/lib/api-client'
import type { MyData, MyDataFormInput } from '../../types/mymodule.types'

class MyService {
  async getAll(tenantId?: string): Promise<MyData[]> {
    const client = createApiClient(tenantId)
    const response = await client.get<MyData[]>('/admin/mydata')
    return response.data
  }

  async getById(id: number, tenantId?: string): Promise<MyData> {
    const client = createApiClient(tenantId)
    const response = await client.get<MyData>(`/admin/mydata/${id}`)
    return response.data
  }

  async create(data: MyDataFormInput, tenantId?: string): Promise<MyData> {
    const client = createApiClient(tenantId)
    const response = await client.post<MyData>('/admin/mydata', data)
    return response.data
  }

  async update(id: number, data: MyDataFormInput, tenantId?: string): Promise<MyData> {
    const client = createApiClient(tenantId)
    const response = await client.put<MyData>(`/admin/mydata/${id}`, data)
    return response.data
  }

  async delete(id: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId)
    await client.delete(`/admin/mydata/${id}`)
  }
}

export const myService = new MyService()
```

### Step 4: Create Hook
```typescript
// src/modules/MyModule/admin/hooks/useMyData.ts
'use client'

import { useState, useEffect } from 'react'
import { useTenant } from '@/shared/lib/tenant-context'
import { myService } from '../services/myService'
import type { MyData } from '../../types/mymodule.types'

export const useMyData = () => {
  const { tenantId } = useTenant()
  const [data, setData] = useState<MyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const result = await myService.getAll(tenantId || undefined)
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [tenantId])

  return { data, loading, error, refetch: fetchData }
}
```

### Step 5: Create Component
```typescript
// src/modules/MyModule/admin/components/MyDataList.tsx
'use client'

import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { useMyData } from '../hooks/useMyData'

const MyDataList = () => {
  const { data, loading, error, refetch } = useMyData()

  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>
  if (!data.length) return <Typography>No data found</Typography>

  return (
    <Box>
      <Typography variant="h4">My Data</Typography>
      <Button onClick={refetch}>Refresh</Button>
      {/* Render your data here */}
    </Box>
  )
}

export default MyDataList
```

### Step 6: Create Barrel Export
```typescript
// src/modules/MyModule/index.ts
// Admin exports
export { default as MyDataList } from './admin/components/MyDataList'
export { useMyData } from './admin/hooks/useMyData'
export { myService } from './admin/services/myService'

// Type exports
export type { MyData, MyDataFormInput } from './types/mymodule.types'
```

### Step 7: Create Menu Config (Optional)
```typescript
// src/modules/MyModule/menu.config.ts
import type { MenuConfig } from '@/shared/types/menu-config.types'

export const myModuleMenuConfig: MenuConfig = {
  id: 'mymodule',
  label: 'My Module',
  icon: 'ri-folder-line',
  children: [
    {
      id: 'mymodule-list',
      label: 'List',
      href: '/admin/mymodule',
      permissions: ['mymodule.view']
    },
    {
      id: 'mymodule-create',
      label: 'Create',
      href: '/admin/mymodule/create',
      permissions: ['mymodule.create']
    }
  ]
}
```

### Step 8: Create Route
```typescript
// src/app/[lang]/admin/mymodule/page.tsx
import { MyDataList } from '@/modules/MyModule'

export default function MyModulePage() {
  return <MyDataList />
}
```

## Creating a CRUD Form

### Form Component with Validation
```typescript
'use client'

import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, pipe, minLength } from 'valibot'
import type { InferInput } from 'valibot'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { myService } from '../services/myService'
import { useTenant } from '@/shared/lib/tenant-context'

const schema = object({
  name: pipe(string(), minLength(3, 'Name must be at least 3 characters')),
  description: pipe(string(), minLength(10, 'Description must be at least 10 characters'))
})

type FormData = InferInput<typeof schema>

interface MyDataFormProps {
  initialData?: FormData
  onSuccess?: () => void
}

const MyDataForm = ({ initialData, onSuccess }: MyDataFormProps) => {
  const { tenantId } = useTenant()
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: initialData || {
      name: '',
      description: ''
    }
  })

  const onSubmit = async (data: FormData) => {
    try {
      await myService.create(data, tenantId || undefined)
      onSuccess?.()
    } catch (error) {
      console.error('Failed to save:', error)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Name"
            error={!!errors.name}
            helperText={errors.name?.message}
            disabled={isSubmitting}
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            multiline
            rows={4}
            label="Description"
            error={!!errors.description}
            helperText={errors.description?.message}
            disabled={isSubmitting}
          />
        )}
      />
      <Button type="submit" variant="contained" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </Button>
    </Box>
  )
}

export default MyDataForm
```

## Creating a Data Table

### Using MUI Table
```typescript
'use client'

import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import { useMyData } from '../hooks/useMyData'

const MyDataTable = () => {
  const { data, loading } = useMyData()

  if (loading) return <div>Loading...</div>

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.description}</TableCell>
              <TableCell>
                <IconButton size="small">
                  <i className="ri-edit-line" />
                </IconButton>
                <IconButton size="small" color="error">
                  <i className="ri-delete-bin-line" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default MyDataTable
```

## Adding Permissions Check

### In Component
```typescript
'use client'

import { usePermissions } from '@/shared/contexts'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Alert from '@mui/material/Alert'

const ProtectedComponent = () => {
  const { hasCredential, loading } = usePermissions()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !hasCredential('mymodule.view')) {
      router.push('/not-authorized')
    }
  }, [hasCredential, loading, router])

  if (loading) return <div>Loading...</div>
  if (!hasCredential('mymodule.view')) return null

  return (
    <div>
      <h1>Protected Content</h1>
      {hasCredential('mymodule.edit') && (
        <button>Edit</button>
      )}
    </div>
  )
}
```

### In Menu Config
```typescript
export const menuConfig: MenuConfig = {
  id: 'mymodule',
  label: 'My Module',
  permissions: ['mymodule.view'], // User must have this to see menu item
  children: [...]
}
```

## Development Commands

### Start Development Server
```bash
npm run dev
# or
pnpm dev
```

### Build for Production
```bash
npm run build
# or
pnpm build
```

### Run Linter
```bash
npm run lint
# or
pnpm lint
```

### Fix Linting Issues
```bash
npm run lint:fix
# or
pnpm lint:fix
```

### Format Code
```bash
npm run format
# or
pnpm format
```

### Database Migrations (Prisma)
```bash
npm run migrate
# or
pnpm migrate
```

## Debugging Tips

### Check API Calls in Browser
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Look for your API calls
5. Check request headers (Authorization, X-Tenant-ID, Accept-Language)
6. Check response status and data

### Check localStorage
```javascript
// In browser console
console.log('Token:', localStorage.getItem('auth_token'))
console.log('User:', JSON.parse(localStorage.getItem('user') || '{}'))
console.log('Tenant ID:', localStorage.getItem('tenant_id'))
console.log('Permissions:', JSON.parse(localStorage.getItem('user_permissions') || '{}'))
```

### Check Context Values
```typescript
// Add to component
const { tenantId, domain } = useTenant()
const { permissions, hasCredential } = usePermissions()

console.log('Tenant:', { tenantId, domain })
console.log('Permissions:', permissions)
console.log('Has admin:', hasCredential('admin'))
```

### Enable API Client Logging
```typescript
// In api-client.ts, add console.log in interceptors
client.interceptors.request.use((config) => {
  console.log('API Request:', {
    url: config.url,
    method: config.method,
    headers: config.headers
  })
  return config
})
```

## Common Errors & Solutions

### "Cannot find module '@/modules/...'"
**Solution**: Check tsconfig.json path aliases are correct

### "usePermissions must be used within PermissionsProvider"
**Solution**: Ensure component is wrapped in ClientProviders

### "401 Unauthorized"
**Solution**: Check token in localStorage, may need to login again

### "X-Tenant-ID header missing"
**Solution**: Ensure useTenant() is called and tenantId is set

### "Module not found" after creating new module
**Solution**: Restart dev server (Ctrl+C then `npm run dev`)

## Git Workflow

### Before Committing
```bash
# Format code
pnpm format

# Fix linting
pnpm lint:fix

# Check for errors
pnpm build
```

### Commit Message Format
```
feat: Add new MyModule with CRUD operations
fix: Correct API client tenant header injection
refactor: Convert MyComponent from Tailwind to MUI
docs: Update API integration guide
```

## Testing Checklist

### Before Deploying
- [ ] All API calls work correctly
- [ ] Authentication works (login/logout)
- [ ] Permissions are checked properly
- [ ] Multi-tenant context switches correctly
- [ ] Forms validate correctly
- [ ] Error messages display properly
- [ ] Loading states work
- [ ] Responsive design works on mobile
- [ ] i18n works for all languages (en/fr/ar)
- [ ] No console errors
- [ ] Build succeeds (`pnpm build`)
