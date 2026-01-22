# Programme Activation/Deactivation Feature

## Overview

This feature implements the lifecycle management of academic programmes with validation checks before activation and safe deactivation.

## Components

### 1. ProgrammeActivationDialog

**Location:** `src/modules/StructureAcademique/admin/components/ProgrammeActivationDialog.tsx`

**Purpose:** Modal dialog for activating or deactivating programmes with validation feedback.

**Features:**
- Real-time validation checks display
- Visual feedback (success/error icons)
- Detailed error messages for failed checks
- Loading states during validation and submission
- Confirmation workflow

**Props:**
```typescript
interface ProgrammeActivationDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  programme: Programme | null
  action: 'activate' | 'deactivate'
}
```

### 2. useProgrammeActivation Hook

**Location:** `src/modules/StructureAcademique/admin/hooks/useProgrammeActivation.ts`

**Purpose:** Custom hook managing activation/deactivation logic and validations.

**Features:**
- Automatic validation on mount
- Separate validation logic for activation and deactivation
- API integration for status changes
- Refresh mechanism after status change

**API:**
```typescript
const {
  programme,              // Current programme data
  loading,                // Loading state
  activationChecks,       // Array of activation validation checks
  deactivationChecks,     // Array of deactivation validation checks
  canActivate,            // Boolean - can programme be activated
  canDeactivate,          // Boolean - can programme be deactivated
  activateProgramme,      // Function to activate
  deactivateProgramme,    // Function to deactivate
  refresh                 // Function to refresh validations
} = useProgrammeActivation(programmeId)
```

## Validation Rules

### Activation Checks

1. **Has Levels** - Programme must have at least 1 level associated
   - Checks: `levels_count > 0`
   - Error: "Le programme doit avoir au moins un niveau"

2. **Has Responsable** - Programme must have a responsible person assigned
   - Checks: `responsable_id !== null`
   - Error: "Un responsable doit être assigné au programme"

3. **Valid Structure** - Programme must have complete basic information
   - Checks: `code && libelle && type && duree_annees > 0`
   - Error: "Le programme doit avoir un code, libellé, type et durée valides"

4. **Not Already Active** - Programme must not already be active
   - Checks: `statut !== 'Actif'`
   - Error: "Le programme est déjà actif"

### Deactivation Checks

1. **Currently Active** - Only active programmes can be deactivated
   - Checks: `statut === 'Actif'`
   - Error: "Seuls les programmes actifs peuvent être désactivés"

2. **No Active Enrollments** - Programme must have no enrolled students
   - Checks: `students_count === 0`
   - Error: "{count} étudiant(s) inscrit(s) - impossible de désactiver"

3. **Can Be Modified** - User must have permission to modify
   - Checks: `can_be_modified !== false`
   - Error: "Vous n'avez pas la permission de modifier ce programme"

## Integration

### In ProgrammeListTable

The activation/deactivation buttons are integrated into the actions column:

```typescript
// Desktop view - IconButton in actions column
{row.original.statut === 'Actif' ? (
  <IconButton onClick={() => handleOpenActivationDialog(row.original, 'deactivate')}>
    <i className='ri-pause-circle-line text-warning' />
  </IconButton>
) : (
  <IconButton onClick={() => handleOpenActivationDialog(row.original, 'activate')}>
    <i className='ri-play-circle-line text-success' />
  </IconButton>
)}

// Mobile view - Action in mobile card
actions={[
  ...(programme.statut === 'Actif'
    ? [{ icon: 'ri-pause-circle-line', color: 'warning', onClick: ... }]
    : [{ icon: 'ri-play-circle-line', color: 'success', onClick: ... }]
  )
]}
```

## API Integration

### Endpoint Used

**PATCH** `/api/admin/programmes/{id}/status`

**Request Body:**
```json
{
  "statut": "Actif" | "Inactif"
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "code": "PROG001",
    "statut": "Actif",
    ...
  },
  "message": "Status updated successfully"
}
```

### Service Method

```typescript
programmeService.changeStatus(
  programmeId: number,
  data: { statut: ProgrammeStatus },
  tenantId?: string
): Promise<Programme>
```

## Translations

All UI text is internationalized with support for:
- French (fr)
- English (en)
- Arabic (ar)

**Key translations added:**
- `Activer` / `Activate` / `تفعيل`
- `Désactiver` / `Deactivate` / `إلغاء التفعيل`
- `Activer le programme` / `Activate program` / `تفعيل البرنامج`
- `Désactiver le programme` / `Deactivate program` / `إلغاء تفعيل البرنامج`
- Validation messages and check labels

## User Flow

### Activation Flow

1. User clicks activation button (play icon) on inactive/draft programme
2. Dialog opens showing validation checks
3. System validates:
   - Has levels
   - Has responsable
   - Valid structure
   - Not already active
4. If all checks pass:
   - Green success alert shown
   - "Activer" button enabled
5. User clicks "Activer"
6. API call to change status
7. Success → Dialog closes, table refreshes
8. Programme now shows as "Actif" with deactivation button

### Deactivation Flow

1. User clicks deactivation button (pause icon) on active programme
2. Dialog opens showing validation checks
3. System validates:
   - Currently active
   - No active enrollments
   - User has permission
4. If all checks pass:
   - Green success alert shown
   - Warning about impact displayed
   - "Désactiver" button enabled
5. User clicks "Désactiver"
6. API call to change status
7. Success → Dialog closes, table refreshes
8. Programme now shows as "Inactif" with activation button

## Error Handling

### Validation Failures

When validation checks fail:
- Red error alert displayed at top
- Failed checks shown with red X icon
- Specific error message for each failed check
- Action button disabled

### API Errors

When API call fails:
- Error logged to console
- Dialog remains open
- User can retry or cancel

## Testing Recommendations

### Unit Tests

1. **useProgrammeActivation hook:**
   - Test activation validation logic
   - Test deactivation validation logic
   - Test API integration
   - Test refresh mechanism

2. **ProgrammeActivationDialog component:**
   - Test rendering with different validation states
   - Test button enable/disable logic
   - Test submission flow
   - Test error display

### Integration Tests

1. Complete activation flow
2. Complete deactivation flow
3. Validation failure scenarios
4. Permission-based access control

### Manual Testing Checklist

- [ ] Activate programme with all requirements met
- [ ] Try to activate programme without levels
- [ ] Try to activate programme without responsable
- [ ] Try to activate already active programme
- [ ] Deactivate programme with no students
- [ ] Try to deactivate programme with enrolled students
- [ ] Try to deactivate without permission
- [ ] Check translations in all languages (fr/en/ar)
- [ ] Test on mobile view
- [ ] Test loading states
- [ ] Test error handling

## Future Enhancements

1. **Backend Events Integration:**
   - Listen for `ProgrammeActivated` event
   - Listen for `ProgrammeDeactivated` event
   - Show real-time notifications

2. **Advanced Validations:**
   - Check if levels have modules with ECTS credits
   - Check for planned exam sessions
   - Validate academic year constraints

3. **Audit Trail:**
   - Display activation/deactivation history
   - Show who activated/deactivated and when
   - Track reason for deactivation

4. **Bulk Operations:**
   - Activate multiple programmes at once
   - Deactivate multiple programmes at once
   - Batch validation feedback

## Related Files

- `src/modules/StructureAcademique/admin/components/ProgrammeActivationDialog.tsx`
- `src/modules/StructureAcademique/admin/hooks/useProgrammeActivation.ts`
- `src/modules/StructureAcademique/admin/components/ProgrammeListTable.tsx`
- `src/modules/StructureAcademique/admin/services/programmeService.ts`
- `src/modules/StructureAcademique/types/programme.types.ts`
- `src/modules/StructureAcademique/translations/*.json`

## Status

✅ **Implemented** - Frontend activation/deactivation with validations complete.

**Note:** Backend validation logic and events are assumed to be implemented on the Laravel API side as per the story requirements.
