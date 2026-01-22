# Coding Standards & Best Practices

## Component Development

### React Components
- **Always** add `'use client'` directive for interactive components
- Use functional components with hooks (no class components)
- Prefer named exports for components
- Use TypeScript for all components

### Component Structure
```typescript
'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { useForm } from 'react-hook-form'

// Type Imports
import type { FC } from 'react'

// Component Imports
import CustomComponent from '@/components/CustomComponent'

// Hook Imports
import { usePermissions } from '@/shared/contexts'

// Service Imports
import { myService } from '../services/myService'

// Type Definitions
interface MyComponentProps {
  title: string
  onSubmit?: () => void
}

const MyComponent: FC<MyComponentProps> = ({ title, onSubmit }) => {
  // Hooks first
  const { hasCredential } = usePermissions()
  const [loading, setLoading] = useState(false)

  // Effects
  useEffect(() => {
    // Effect logic
  }, [])

  // Handlers
  const handleClick = () => {
    // Handler logic
  }

  // Render
  return (
    <Box>
      <Typography variant="h4">{title}</Typography>
    </Box>
  )
}

export default MyComponent
```

## Styling Guidelines

### Priority Order
1. **MUI Components** (primary choice)
2. **MUI sx prop** for custom styles
3. **Tailwind utilities** for spacing/layout only
4. **Emotion styled** for complex custom components

### Examples
```typescript
// ✅ GOOD: Use MUI components
import Button from '@mui/material/Button'
<Button variant="contained" color="primary">Click</Button>

// ✅ GOOD: Use sx prop for custom styles
<Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
  Content
</Box>

// ✅ ACCEPTABLE: Tailwind for spacing
<div className="flex gap-4 p-6">
  <Button>Action</Button>
</div>

// ❌ AVOID: Pure Tailwind styling
<div className="bg-white shadow-md rounded-lg p-4">
  <h1 className="text-2xl font-bold">Title</h1>
</div>
```

## API Integration

### Service Layer Pattern
Always create services for API calls:

```typescript
// services/myService.ts
import { createApiClient } from '@/shared/lib/api-client'
import type { MyData } from '../types/mydata.types'

class MyService {
  async getData(tenantId?: string): Promise<MyData[]> {
    const client = createApiClient(tenantId)
    const response = await client.get<MyData[]>('/admin/my-endpoint')
    return response.data
  }

  async createData(data: Partial<MyData>, tenantId?: string): Promise<MyData> {
    const client = createApiClient(tenantId)
    const response = await client.post<MyData>('/admin/my-endpoint', data)
    return response.data
  }
}

export const myService = new MyService()
```

### Custom Hooks Pattern
Create hooks for data fetching:

```typescript
// hooks/useMyData.ts
'use client'

import { useState, useEffect } from 'react'
import { useTenant } from '@/shared/lib/tenant-context'
import { myService } from '../services/myService'
import type { MyData } from '../types/mydata.types'

export const useMyData = () => {
  const { tenantId } = useTenant()
  const [data, setData] = useState<MyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await myService.getData(tenantId || undefined)
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tenantId])

  return { data, loading, error }
}
```

## Form Handling

### Use React Hook Form + Valibot
```typescript
'use client'

import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, pipe, minLength } from 'valibot'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

// Schema definition
const schema = object({
  name: pipe(string(), minLength(3, 'Name must be at least 3 characters')),
  email: pipe(string(), minLength(1, 'Email is required'))
})

type FormData = InferInput<typeof schema>

const MyForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      name: '',
      email: ''
    }
  })

  const onSubmit = (data: FormData) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
          />
        )}
      />
      <Button type="submit" variant="contained">Submit</Button>
    </form>
  )
}
```

## TypeScript Standards

### Type Definitions
- Create types in `types/` directory
- Use interfaces for object shapes
- Use type aliases for unions/intersections
- Export all types from module's `index.ts`

```typescript
// types/user.types.ts
export interface User {
  id: number
  username: string
  email: string
  groups: string[]
  permissions: string[]
}

export interface LoginCredentials {
  username: string
  password: string
  application: 'admin' | 'superadmin'
}

export type UserRole = 'admin' | 'superadmin' | 'user'
```

## Error Handling

### Service Layer
```typescript
async getData(): Promise<MyData[]> {
  try {
    const client = createApiClient()
    const response = await client.get<MyData[]>('/endpoint')
    return response.data
  } catch (error) {
    console.error('Failed to fetch data:', error)
    throw error // Re-throw for hook to handle
  }
}
```

### Component Layer
```typescript
const { data, loading, error } = useMyData()

if (loading) return <CircularProgress />
if (error) return <Alert severity="error">{error}</Alert>
if (!data.length) return <Typography>No data found</Typography>

return <DataTable data={data} />
```

## Permissions & Access Control

### Always Check Permissions
```typescript
'use client'

import { usePermissions } from '@/shared/contexts'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const ProtectedComponent = () => {
  const { hasCredential, loading } = usePermissions()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !hasCredential('users.edit')) {
      router.push('/not-authorized')
    }
  }, [hasCredential, loading, router])

  if (loading) return <CircularProgress />
  if (!hasCredential('users.edit')) return null

  return <div>Protected content</div>
}
```

## Module Exports

### Barrel Exports (index.ts)
Always create a barrel export file:

```typescript
// modules/MyModule/index.ts

// Admin exports
export { default as MyComponent } from './admin/components/MyComponent'
export { useMyData } from './admin/hooks/useMyData'
export { myService } from './admin/services/myService'

// SuperAdmin exports
export { default as SuperAdminComponent } from './superadmin/components/SuperAdminComponent'

// Type exports
export type { MyData, MyFormData } from './types/mymodule.types'
```

## Import Order (ESLint)
1. React imports
2. Next.js imports
3. MUI imports
4. Third-party imports
5. Type imports
6. Component imports
7. Hook imports
8. Service imports
9. Util imports
10. Relative imports

## Naming Conventions
- **Components**: PascalCase (`MyComponent.tsx`)
- **Hooks**: camelCase with `use` prefix (`useMyHook.ts`)
- **Services**: camelCase with `Service` suffix (`myService.ts`)
- **Types**: PascalCase (`User`, `LoginCredentials`)
- **Files**: camelCase for utilities, PascalCase for components
- **Directories**: camelCase

## Performance Best Practices
- Use `useMemo` for expensive calculations
- Use `useCallback` for event handlers passed to children
- Lazy load heavy components with `dynamic` from Next.js
- Use Server Components when possible (no `'use client'`)
- Avoid prop drilling - use contexts for global state

## Testing (when implemented)
- Unit tests for services and utilities
- Integration tests for hooks
- Component tests for UI components
- E2E tests for critical user flows
