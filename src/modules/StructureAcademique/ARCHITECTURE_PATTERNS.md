# Architecture Patterns - StructureAcademique Module

## ✅ REFACTORING COMPLETE

The StructureAcademique module now follows the **exact same pattern** as the UsersGuard module, ensuring consistency across the entire application.

---

## Pattern Overview

This module implements the **Context + Hook + Shared DataTable** pattern used throughout the application.

### Key Components

1. **Context Pattern** (`ProgrammeList.tsx`)
   - Creates a React Context to share data between components
   - Wraps children in Context Provider
   - Exports `useProgrammesContext()` hook for accessing context

2. **Complete Hook** (`useProgrammes.ts`)
   - Single hook containing ALL operations (fetch, CRUD, pagination, search)
   - Uses `useTenant()` for multi-tenant support
   - Manages loading, error, and pagination states
   - Returns all functions needed by components

3. **Shared DataTable** (`ProgrammeListTable.tsx`)
   - Uses `<DataTable />` component from `@/components/shared/DataTable`
   - TanStack Table for column definitions
   - Column visibility persisted in localStorage
   - Mobile support with `StandardMobileCard`
   - Built-in search, pagination, and refresh

4. **Service Layer** (`programmeService.ts`)
   - Uses `URLSearchParams` for query building (not object params)
   - Proper error handling with try/catch
   - Consistent API endpoint structure

---

## File Structure

```
src/modules/StructureAcademique/
├── types/
│   └── programme.types.ts          # Types matching UsersGuard pattern
├── admin/
│   ├── components/
│   │   ├── ProgrammeList.tsx       # Context Provider (like UsersList)
│   │   ├── ProgrammeListTable.tsx  # DataTable implementation (like UserListTable)
│   │   ├── ProgrammeFormDialog.tsx # Add/Edit modal
│   │   └── ProgrammeDeleteDialog.tsx # Delete confirmation
│   ├── hooks/
│   │   └── useProgrammes.ts        # Complete hook with all operations
│   ├── services/
│   │   └── programmeService.ts     # API service with URLSearchParams
│   └── index.ts                    # Barrel exports
├── menu.config.ts                  # Menu configuration
└── index.ts                        # Module exports
```

---

## Pattern Details

### 1. Types (`programme.types.ts`)

Matches Laravel API response structure:

```typescript
// Query parameters (matching API)
export interface ProgrammeQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  type?: ProgrammeType;
  statut?: ProgrammeStatus;
}

// Pagination meta (Laravel structure)
export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

// Paginated response (Laravel structure)
export interface PaginatedProgrammesResponse {
  data: Programme[];
  links: PaginationLinks;
  meta: PaginationMeta;
}
```

### 2. Service (`programmeService.ts`)

Uses `URLSearchParams` pattern:

```typescript
async getProgrammes(
  tenantId?: string,
  params?: ProgrammeQueryParams
): Promise<PaginatedProgrammesResponse> {
  try {
    const client = createApiClient(tenantId);

    // Build query parameters with URLSearchParams
    const queryParams = new URLSearchParams();

    if (params?.per_page) {
      queryParams.append('per_page', String(params.per_page));
    }

    if (params?.page) {
      queryParams.append('page', String(params.page));
    }

    if (params?.search) {
      queryParams.append('search', params.search);
    }

    const queryString = queryParams.toString();
    const url = `/admin/structure-academique/programmes${queryString ? `?${queryString}` : ''}`;

    const response = await client.get<PaginatedProgrammesResponse>(url);

    return response.data;
  } catch (error) {
    console.error('Error fetching programmes:', error);
    throw error;
  }
}
```

### 3. Hook (`useProgrammes.ts`)

Complete hook with all operations:

```typescript
export const useProgrammes = (initialParams?: ProgrammeQueryParams) => {
  const { tenantId } = useTenant();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({...});
  const [params, setParams] = useState<ProgrammeQueryParams>({...});

  // Fetch function
  const fetchProgrammes = useCallback(async () => {
    // Implementation
  }, [tenantId, params]);

  // Returns ALL operations
  return {
    programmes,
    loading,
    error,
    pagination,
    params,
    updateParams,
    setPage,
    setPageSize,
    setSearch,
    refresh,
    createProgramme,    // ✅ CRUD operations included
    updateProgramme,    // ✅
    deleteProgramme,    // ✅
    changeStatus        // ✅
  };
};
```

### 4. Context (`ProgrammeList.tsx`)

Context pattern for sharing data:

```typescript
interface ProgrammesContextType {
  programmes: Programme[]
  loading: boolean
  error: Error | null
  pagination: PaginationMeta
  params: ProgrammeQueryParams
  updateParams: (newParams: Partial<ProgrammeQueryParams>) => void
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  setSearch: (search: string) => void
  refresh: () => void
  createProgramme: (data: ProgrammeFormData) => Promise<Programme>
  updateProgramme: (programmeId: number, data: Partial<ProgrammeFormData>) => Promise<Programme>
  deleteProgramme: (programmeId: number) => Promise<void>
  changeStatus: (programmeId: number, data: ChangeStatusData) => Promise<Programme>
}

const ProgrammesContext = createContext<ProgrammesContextType | undefined>(undefined)

export const useProgrammesContext = () => {
  const context = useContext(ProgrammesContext)
  if (!context) {
    throw new Error('useProgrammesContext must be used within ProgrammeList')
  }
  return context
}

export const ProgrammeList = () => {
  const programmesData = useProgrammes()

  return (
    <ProgrammesContext.Provider value={programmesData}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <ProgrammeListTable />
        </Grid>
      </Grid>
    </ProgrammesContext.Provider>
  )
}
```

### 5. Table (`ProgrammeListTable.tsx`)

Uses shared DataTable component:

```typescript
// Column definitions with TanStack Table
const columnHelper = createColumnHelper<ProgrammeWithAction>()

const columns = useMemo<ColumnDef<ProgrammeWithAction, any>[]>(
  () => [
    // Select column
    {
      id: 'select',
      header: ({ table }) => <Checkbox {...} />,
      cell: ({ row }) => <Checkbox {...} />
    },
    // Data columns
    columnHelper.accessor('code', {
      id: 'code',
      header: t('Code'),
      cell: ({ row }) => <Typography>{row.original.code}</Typography>
    }),
    // ... more columns
    // Actions column
    columnHelper.accessor('action', {
      header: t('Actions'),
      cell: ({ row }) => (
        <div className='flex items-center gap-0.5'>
          <IconButton onClick={() => handleOpenDeleteDialog(row.original)}>
            <i className='ri-delete-bin-line' />
          </IconButton>
          {/* More actions */}
        </div>
      )
    })
  ],
  [t, handleOpenDeleteDialog, handleOpenEditDialog]
)

// DataTable configuration
const tableConfig: DataTableConfig<Programme> = {
  columns,
  data: programmes,
  loading,
  pagination,
  availableColumns: AVAILABLE_COLUMNS,
  columnVisibility,
  onColumnVisibilityChange: setColumnVisibility,
  onPageChange: setPage,
  onPageSizeChange: setPageSize,
  onSearch: setSearch,
  onRefresh: refresh,
  searchPlaceholder: t('Rechercher un programme'),
  actions: [
    {
      label: t('Ajouter'),
      icon: 'ri-add-line',
      color: 'primary',
      onClick: handleOpenAddDialog
    }
  ],
  mobileCard: {
    renderCard: programme => (
      <StandardMobileCard
        avatar={<CustomAvatar>{programme.code.substring(0, 2)}</CustomAvatar>}
        title={programme.libelle}
        subtitle={programme.code}
        status={{ label: programme.statut, color: statusColorMap[programme.statut] }}
        fields={[...]}
        actions={[...]}
        item={programme}
      />
    )
  }
}

return <DataTable {...tableConfig} />
```

---

## Key Features

### ✅ Multi-Tenant Support
- Uses `useTenant()` hook from `@/shared/lib/tenant-context`
- Automatically adds `X-Tenant-ID` header via `createApiClient(tenantId)`

### ✅ Authentication
- Token automatically added via `createApiClient()`
- Stored in `localStorage.getItem('auth_token')` for admin
- Stored in `localStorage.getItem('superadmin_auth_token')` for superadmin

### ✅ Column Visibility
- Persisted in localStorage with key: `programmeListTableColumns`
- User preferences saved across sessions

### ✅ Mobile Support
- Responsive design with `StandardMobileCard`
- Desktop: Full table view
- Mobile: Card view with all essential information

### ✅ Search & Pagination
- Server-side pagination
- Global search across code and libelle
- Filters by type and statut

### ✅ Iconify Icons
- Uses `@iconify/iconify` with Remix Icons
- Format: `<i className="ri-icon-name" />`
- Examples: `ri-add-line`, `ri-edit-line`, `ri-delete-bin-line`

---

## Comparison with UsersGuard

| Feature | UsersGuard | StructureAcademique | Status |
|---------|-----------|---------------------|--------|
| Context Pattern | ✅ UsersList | ✅ ProgrammeList | ✅ Match |
| Complete Hook | ✅ useUsers | ✅ useProgrammes | ✅ Match |
| Shared DataTable | ✅ UserListTable | ✅ ProgrammeListTable | ✅ Match |
| URLSearchParams | ✅ userService | ✅ programmeService | ✅ Match |
| TanStack Table | ✅ Yes | ✅ Yes | ✅ Match |
| Column Visibility | ✅ localStorage | ✅ localStorage | ✅ Match |
| Mobile Support | ✅ StandardMobileCard | ✅ StandardMobileCard | ✅ Match |
| Multi-Tenant | ✅ useTenant() | ✅ useTenant() | ✅ Match |
| Authentication | ✅ createApiClient() | ✅ createApiClient() | ✅ Match |
| Iconify Icons | ✅ ri-* icons | ✅ ri-* icons | ✅ Match |

---

## Usage Example

```typescript
// In your page component
import { ProgrammeList } from '@/modules/StructureAcademique'

export default function ProgrammesPage() {
  return <ProgrammeList />
}
```

That's it! The Context, Hook, Service, and DataTable are all wired together automatically.

---

## Benefits of This Pattern

1. **Consistency**: Same pattern across all modules
2. **Reusability**: Shared DataTable component
3. **Maintainability**: Clear separation of concerns
4. **Type Safety**: Full TypeScript support
5. **Performance**: Optimized with useMemo and useCallback
6. **User Experience**: Column visibility, mobile support, search, pagination
7. **Multi-Tenant**: Built-in tenant context support
8. **Authentication**: Automatic token handling

---

## Next Steps

When creating new modules, follow this exact pattern:

1. Copy types structure from `programme.types.ts`
2. Copy service structure from `programmeService.ts`
3. Copy hook structure from `useProgrammes.ts`
4. Copy context structure from `ProgrammeList.tsx`
5. Copy table structure from `ProgrammeListTable.tsx`

**Reference Files**:
- `src/modules/UsersGuard/` - Original pattern
- `src/modules/StructureAcademique/` - This implementation

---

**Last Updated**: January 2026
**Pattern Version**: 2.0 (UsersGuard-compatible)
**Status**: ✅ Production Ready
