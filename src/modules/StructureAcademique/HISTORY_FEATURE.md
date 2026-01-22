# Programme History Feature - Documentation

## Overview

This feature provides complete traceability of all modifications made to academic programmes, including a visual timeline, filtering capabilities, and PDF export functionality.

## Components

### 1. ProgrammeHistoryTimeline

**Location:** `src/modules/StructureAcademique/admin/components/ProgrammeHistoryTimeline.tsx`

**Purpose:** Visual timeline display of programme modification history.

**Features:**
- Timeline layout with MUI Timeline components
- Color-coded action types (created, updated, deleted, restored, activated, deactivated)
- Icon-based action indicators
- Before/after value comparison with visual highlighting
- Selection for comparison (up to 2 versions)
- Restore version button (for 'updated' actions)
- User information display
- IP address tracking
- Reason display (if provided)

**Props:**
```typescript
interface ProgrammeHistoryTimelineProps {
  history: ProgrammeHistory[]
  loading?: boolean
  error?: string | null
  onCompare?: (historyId: number) => void
  onRestore?: (historyId: number) => void
}
```

### 2. ProgrammeHistoryView

**Location:** `src/modules/StructureAcademique/admin/components/ProgrammeHistoryView.tsx`

**Purpose:** Complete history view with filtering and export capabilities.

**Features:**
- Filter by action type
- Filter by date range (start/end)
- Pagination support
- PDF export button
- Integration with ProgrammeHistoryTimeline
- Automatic data fetching

**Props:**
```typescript
interface ProgrammeHistoryViewProps {
  programme: Programme
}
```

### 3. ProgrammeHistoryDialog

**Location:** `src/modules/StructureAcademique/admin/components/ProgrammeHistoryDialog.tsx`

**Purpose:** Modal dialog wrapper for history view.

**Features:**
- Full-screen dialog (maxWidth="lg")
- Scrollable content
- Close button
- Programme information in header

**Props:**
```typescript
interface ProgrammeHistoryDialogProps {
  open: boolean
  onClose: () => void
  programme: Programme | null
}
```

## Hooks

### useProgrammeHistory

**Location:** `src/modules/StructureAcademique/admin/hooks/useProgrammeHistory.ts`

**Purpose:** Custom hook for managing programme history data and operations.

**API:**
```typescript
const {
  history,              // Array of history entries
  loading,              // Loading state
  error,                // Error message
  pagination,           // Pagination info
  fetchHistory,         // Function to fetch with filters
  compareVersions,      // Function to compare two versions
  restoreVersion,       // Function to restore a version
  exportPDF,            // Function to export history as PDF
} = useProgrammeHistory(programmeId)
```

**Features:**
- Automatic data fetching on mount
- Pagination management
- Filter support
- Tenant context integration
- Error handling
- PDF download with automatic file naming

## Services

### programmeHistoryService

**Location:** `src/modules/StructureAcademique/admin/services/programmeHistoryService.ts`

**Purpose:** API service for history-related operations.

**Methods:**

1. **getHistory(programmeId, tenantId?, params?)**
   - Fetches paginated history
   - Supports filtering by action, date range, user
   - Returns: `PaginatedHistoryResponse`

2. **compareVersions(programmeId, params, tenantId?)**
   - Compares two versions
   - Returns: `HistoryComparison` with differences

3. **restoreVersion(programmeId, data, tenantId?)**
   - Restores programme to a previous version
   - Requires history_id and optional reason

4. **exportHistoryPDF(programmeId, tenantId?)**
   - Exports history as PDF
   - Returns: Blob for download

## Types

### ProgrammeHistory

```typescript
interface ProgrammeHistory {
  id: number
  programme_id: number
  user_id: number
  action: HistoryAction
  field_changed?: string
  old_value?: any
  new_value?: any
  ip_address?: string
  user_agent?: string
  reason?: string
  created_at: string
  
  // Relations
  user?: {
    id: number
    name: string
    email: string
  }
  programme?: {
    id: number
    code: string
    libelle: string
  }
}
```

### HistoryAction

```typescript
type HistoryAction = 
  | 'created' 
  | 'updated' 
  | 'deleted' 
  | 'restored' 
  | 'activated' 
  | 'deactivated'
```

## Integration

### In ProgrammeListTable

A new "History" button has been added to the actions column:

```typescript
// Desktop view
<IconButton onClick={() => handleOpenHistoryDialog(programme)}>
  <i className='ri-history-line' />
</IconButton>

// Mobile view
{
  icon: 'ri-history-line',
  color: 'default',
  onClick: () => handleOpenHistoryDialog(programme)
}
```

## API Endpoints

### Expected Backend Endpoints

1. **GET** `/api/admin/programmes/{id}/history`
   - Query params: page, per_page, start_date, end_date, user_id, action, field_changed
   - Response: Paginated history list

2. **GET** `/api/admin/programmes/{id}/history/compare`
   - Query params: version1_id, version2_id
   - Response: Comparison data with differences

3. **POST** `/api/admin/programmes/{id}/restore/{historyId}`
   - Body: { reason?: string }
   - Response: Success status

4. **GET** `/api/admin/programmes/{id}/history/export`
   - Response: PDF blob

## Visual Design

### Timeline Colors

- **Created** → Green (success)
- **Updated** → Blue (info)
- **Deleted** → Red (error)
- **Restored** → Orange (warning)
- **Activated** → Green (success)
- **Deactivated** → Gray (secondary)

### Value Comparison

- **Old value** → Red background with strikethrough
- **New value** → Green background

### Icons

- Created: `ri-add-circle-line`
- Updated: `ri-edit-line`
- Deleted: `ri-delete-bin-line`
- Restored: `ri-history-line`
- Activated: `ri-play-circle-line`
- Deactivated: `ri-pause-circle-line`

## Translations

All UI text is internationalized with support for:
- French (fr)
- English (en)
- Arabic (ar)

**Key translations:**
- Historique / History / السجل
- Historique des modifications / Modification history / سجل التعديلات
- Exporter PDF / Export PDF / تصدير PDF
- Création / Creation / إنشاء
- Modification / Modification / تعديل
- Suppression / Deletion / حذف
- Restauration / Restoration / استعادة
- Activation / Activation / تفعيل
- Désactivation / Deactivation / إلغاء التفعيل

## User Flow

### Viewing History

1. User clicks "History" button on a programme
2. Dialog opens with full history view
3. Timeline displays all modifications chronologically
4. User can filter by action type or date range
5. User can export to PDF

### Comparing Versions

1. User selects first version (checkbox icon)
2. User selects second version
3. Floating chip appears: "Compare selected versions"
4. User clicks chip to compare
5. Comparison view shows differences

### Restoring Version

1. User clicks restore icon on an 'updated' entry
2. Confirmation dialog appears
3. User provides optional reason
4. System restores programme to that version
5. New history entry created for restoration
6. Timeline refreshes

## Backend Assumptions

The frontend assumes the backend provides:

1. **Observer Pattern** - Automatic history capture on model changes
2. **ProgrammeHistory Model** - With all required fields
3. **API Endpoints** - As documented above
4. **PDF Generation** - Server-side PDF export
5. **Permissions** - `programmes.view_history`, `programmes.restore`

## Testing Recommendations

### Manual Testing

- [ ] View history for a programme
- [ ] Filter by action type
- [ ] Filter by date range
- [ ] Paginate through history
- [ ] Export PDF
- [ ] Select two versions for comparison
- [ ] Restore a previous version
- [ ] Check translations (fr/en/ar)
- [ ] Test on mobile view
- [ ] Verify timeline visual layout

### Edge Cases

- [ ] Programme with no history
- [ ] Programme with 100+ history entries
- [ ] History with null values
- [ ] History with complex JSON values
- [ ] Concurrent modifications
- [ ] Restore with active enrollments (should fail)

## Performance Considerations

- Pagination prevents loading all history at once
- Lazy loading of comparison data
- PDF generation on-demand
- Efficient filtering on backend
- Index on programme_id and created_at

## Security

- Permission checks before viewing history
- Permission checks before restoring
- IP address and user agent tracking
- Audit trail for all restorations
- No sensitive data exposed in frontend

## Future Enhancements

1. **Real-time Updates** - WebSocket for live history updates
2. **Advanced Comparison** - Side-by-side diff view
3. **Bulk Export** - Export multiple programmes' history
4. **History Analytics** - Charts and statistics
5. **Scheduled Archiving** - Auto-archive old history
6. **Notification System** - Alert on critical changes
7. **Rollback Workflow** - Multi-step restoration with approval

## Related Files

- `src/modules/StructureAcademique/admin/components/ProgrammeHistoryTimeline.tsx`
- `src/modules/StructureAcademique/admin/components/ProgrammeHistoryView.tsx`
- `src/modules/StructureAcademique/admin/components/ProgrammeHistoryDialog.tsx`
- `src/modules/StructureAcademique/admin/hooks/useProgrammeHistory.ts`
- `src/modules/StructureAcademique/admin/services/programmeHistoryService.ts`
- `src/modules/StructureAcademique/types/programme-history.types.ts`
- `src/modules/StructureAcademique/admin/components/ProgrammeListTable.tsx` (modified)
- `src/modules/StructureAcademique/translations/*.json` (modified)

## Status

✅ **Implemented** - Frontend history viewing with timeline, filtering, and PDF export.

**Note:** Backend Observer pattern, ProgrammeHistory model, and API endpoints are assumed to be implemented as per story requirements.
