# API & Backend Integration Guide

## Backend API Information

### Base URLs
- **Production**: `https://carpentry-project.be/api`
- **Development**: Configure in `.env` file
- **Local**: Typically `http://localhost:8000/api` or `http://api.local/api`

### API Structure
```
/api
├── /admin/*              # Tenant-specific admin endpoints
├── /superadmin/*         # Central superadmin endpoints
├── /cms/*                # Public CMS endpoints
└── /auth/*               # Authentication endpoints
```

## Authentication Flow

### Login Process
1. User submits credentials to `/api/auth/login`
2. Backend validates and returns JWT token + user data
3. Frontend stores token in localStorage
4. Frontend extracts and caches permissions locally
5. All subsequent requests include `Authorization: Bearer {token}`

### Token Storage
```typescript
// Admin context
localStorage.setItem('auth_token', token)
localStorage.setItem('user', JSON.stringify(user))

// Superadmin context
localStorage.setItem('superadmin_auth_token', token)
localStorage.setItem('superadmin_user', JSON.stringify(user))
```

### Logout Process
```typescript
// Clear tokens and redirect
localStorage.removeItem('auth_token')
localStorage.removeItem('user')
localStorage.removeItem('tenant_id')
localStorage.removeItem('tenant_domain')
window.location.href = '/en/login'
```

## API Client Usage

### Basic Usage
```typescript
import { createApiClient } from '@/shared/lib/api-client'

// In admin context (with tenant)
const client = createApiClient(tenantId)
const response = await client.get('/admin/users')

// In superadmin context (no tenant)
const client = createApiClient()
const response = await client.get('/superadmin/sites')
```

### Automatic Headers
The API client automatically adds:
- `Authorization: Bearer {token}` - From localStorage
- `X-Tenant-ID: {tenantId}` - Only in admin context
- `Accept-Language: {locale}` - From URL [lang] parameter
- `Content-Type: application/json`
- `Accept: application/json`

### Error Handling
```typescript
try {
  const response = await client.get('/admin/data')
  return response.data
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      // Auto-handled: logout + redirect
    }
    if (error.response?.status === 403) {
      // Permission denied
      console.error('Access denied')
    }
    if (error.response?.status === 404) {
      // Not found
      console.error('Resource not found')
    }
  }
  throw error
}
```

## Common API Patterns

### GET Request (List)
```typescript
// Service
async getUsers(tenantId?: string): Promise<User[]> {
  const client = createApiClient(tenantId)
  const response = await client.get<User[]>('/admin/users')
  return response.data
}

// Hook
export const useUsers = () => {
  const { tenantId } = useTenant()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getUsers(tenantId || undefined)
        setUsers(data)
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [tenantId])

  return { users, loading }
}
```

### GET Request (Single)
```typescript
async getUser(id: number, tenantId?: string): Promise<User> {
  const client = createApiClient(tenantId)
  const response = await client.get<User>(`/admin/users/${id}`)
  return response.data
}
```

### POST Request (Create)
```typescript
async createUser(data: Partial<User>, tenantId?: string): Promise<User> {
  const client = createApiClient(tenantId)
  const response = await client.post<User>('/admin/users', data)
  return response.data
}
```

### PUT Request (Update)
```typescript
async updateUser(id: number, data: Partial<User>, tenantId?: string): Promise<User> {
  const client = createApiClient(tenantId)
  const response = await client.put<User>(`/admin/users/${id}`, data)
  return response.data
}
```

### DELETE Request
```typescript
async deleteUser(id: number, tenantId?: string): Promise<void> {
  const client = createApiClient(tenantId)
  await client.delete(`/admin/users/${id}`)
}
```

### Pagination
```typescript
interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

async getUsers(
  page: number = 1,
  perPage: number = 15,
  tenantId?: string
): Promise<PaginatedResponse<User>> {
  const client = createApiClient(tenantId)
  const response = await client.get<PaginatedResponse<User>>('/admin/users', {
    params: { page, per_page: perPage }
  })
  return response.data
}
```

### Search & Filters
```typescript
interface UserFilters {
  search?: string
  role?: string
  status?: 'active' | 'inactive'
}

async searchUsers(
  filters: UserFilters,
  tenantId?: string
): Promise<User[]> {
  const client = createApiClient(tenantId)
  const response = await client.get<User[]>('/admin/users/search', {
    params: filters
  })
  return response.data
}
```

## Multi-Tenant Considerations

### Domain-Based Routing
Laravel automatically detects the tenant from the domain:
- `tenant1.carpentry-project.be` → Tenant 1 database
- `tenant2.carpentry-project.be` → Tenant 2 database
- `carpentry-project.be` → Central database (superadmin)

### X-Tenant-ID Header
Only needed when:
- Making cross-tenant requests (rare)
- Testing with a single domain in development

**In production with proper domains, X-Tenant-ID is NOT needed!**

### Tenant Context in Components
```typescript
'use client'

import { useTenant } from '@/shared/lib/tenant-context'

const MyComponent = () => {
  const { tenantId, domain } = useTenant()

  // tenantId is available for API calls
  // domain shows current tenant domain
}
```

## Response Formats

### Success Response
```json
{
  "data": [...],
  "message": "Success"
}
```

### Error Response
```json
{
  "message": "Error message",
  "errors": {
    "field": ["Validation error"]
  }
}
```

### Validation Errors
```typescript
interface ValidationError {
  message: string
  errors: Record<string, string[]>
}

// Handle in component
catch (error) {
  if (axios.isAxiosError(error)) {
    const validationError = error.response?.data as ValidationError
    if (validationError.errors) {
      // Display field-specific errors
      Object.entries(validationError.errors).forEach(([field, messages]) => {
        console.error(`${field}: ${messages.join(', ')}`)
      })
    }
  }
}
```

## File Uploads

### Single File
```typescript
async uploadFile(file: File, tenantId?: string): Promise<string> {
  const client = createApiClient(tenantId)
  const formData = new FormData()
  formData.append('file', file)

  const response = await client.post<{ url: string }>('/admin/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return response.data.url
}
```

### Multiple Files
```typescript
async uploadFiles(files: File[], tenantId?: string): Promise<string[]> {
  const client = createApiClient(tenantId)
  const formData = new FormData()

  files.forEach((file, index) => {
    formData.append(`files[${index}]`, file)
  })

  const response = await client.post<{ urls: string[] }>('/admin/upload-multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return response.data.urls
}
```

## WebSocket / Real-time (if needed)
```typescript
// Example with Laravel Echo (to be implemented)
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

const echo = new Echo({
  broadcaster: 'pusher',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  forceTLS: true,
  authEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/broadcasting/auth`,
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`
    }
  }
})

// Listen to channel
echo.channel('notifications')
  .listen('NotificationSent', (e: any) => {
    console.log('New notification:', e)
  })
```

## API Testing

### Manual Testing with cURL
```bash
# Login
curl -X POST http://api.local/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password","application":"admin"}'

# Get data with token
curl -X GET http://api.local/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept-Language: en"
```

### Testing in Browser Console
```javascript
// Test API call
const token = localStorage.getItem('auth_token')
fetch('/api/admin/users', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
})
  .then(r => r.json())
  .then(console.log)
```

## Environment Configuration

### Development (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
API_URL=http://localhost:8000/api
```

### Production (.env.production)
```env
NEXT_PUBLIC_API_URL=https://carpentry-project.be/api
API_URL=https://carpentry-project.be/api
```

## Common Issues & Solutions

### CORS Errors
**Problem**: Browser blocks API requests
**Solution**: Configure CORS in Laravel `config/cors.php`:
```php
'allowed_origins' => ['http://localhost:3000', 'https://your-domain.com'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

### 401 Unauthorized
**Problem**: Token expired or invalid
**Solution**: API client auto-handles this (logout + redirect)

### 403 Forbidden
**Problem**: User lacks permission
**Solution**: Check permissions before making request:
```typescript
const { hasCredential } = usePermissions()
if (!hasCredential('users.edit')) {
  return <Alert>You don't have permission</Alert>
}
```

### Network Errors
**Problem**: API not reachable
**Solution**: Check `.env` configuration and backend status
