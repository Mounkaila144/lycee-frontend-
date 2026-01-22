# Fix: Programme Level Editing Issue

**Date**: 2026-01-12
**Issue**: Levels not saving when editing programme via ProgrammeFormDialog
**Status**: ✅ FIXED

## Problem Description

When editing a programme through the form dialog (Edit button), the selected levels were not being saved. However, when using the dedicated "Manage Levels" button, it worked correctly.

### Symptoms
- ✅ "Manage Levels" button → Works correctly
- ❌ Edit programme form → Levels not saved
- ❌ Create programme form → Levels not saved

## Root Cause

The issue was in `ProgrammeFormDialog.tsx`:

1. **Hook Initialization Problem**: The component was using `useProgrammeLevels(programme?.id)` hook
2. **Timing Issue**: The hook was initialized with the programme ID, but the `associateLevels` function from the hook was bound to the initial programme ID
3. **Stale Closure**: When saving, the hook's `associateLevels` was trying to use a stale reference

### Original Code (Problematic)
```typescript
const { levels, associateLevels } = useProgrammeLevels(programme?.id);

// Later in handleSubmit:
if (selectedLevels.length > 0 && savedProgramme.id) {
  await associateLevels(selectedLevels); // ❌ Uses stale programme ID
}
```

## Solution

Replace the hook usage with direct service calls:

### Changes Made

1. **Removed Hook**: Removed `useProgrammeLevels` hook usage
2. **Added Direct Service Import**: Import `programmeLevelService` directly
3. **Added Tenant Context**: Import `useTenant` to get tenantId
4. **Manual Level Loading**: Fetch levels manually in useEffect
5. **Direct Service Calls**: Call `programmeLevelService.associateLevels()` directly with correct IDs

### Fixed Code
```typescript
// Import service directly
import { programmeLevelService } from '../services/programmeLevelService';
import { useTenant } from '@/shared/lib/tenant-context';

// Get tenantId
const { tenantId } = useTenant();

// Load levels manually
useEffect(() => {
  if (programme && isEditMode) {
    if (programme.levels && programme.levels.length > 0) {
      setSelectedLevels(programme.levels.map(l => l.level as ProgrammeLevel));
    } else {
      const fetchLevels = async () => {
        try {
          const levelsData = await programmeLevelService.getLevels(
            programme.id,
            tenantId || undefined
          );
          setSelectedLevels(levelsData.map(l => l.level));
        } catch (err) {
          console.error('Error fetching levels:', err);
        }
      };
      fetchLevels();
    }
  }
}, [programme, isEditMode, open, tenantId]);

// Save levels directly with correct IDs
const handleSubmit = async (e: React.FormEvent) => {
  // ... save programme first ...
  
  // Then associate levels with the saved programme ID
  if (selectedLevels.length > 0) {
    await programmeLevelService.associateLevels(
      savedProgramme.id,  // ✅ Uses fresh programme ID
      selectedLevels,
      tenantId || undefined
    );
  }
};
```

## Why This Works

1. **Fresh IDs**: We always use the fresh `savedProgramme.id` from the save operation
2. **No Stale Closures**: Direct service calls don't have closure issues
3. **Explicit Control**: We have full control over when and how levels are saved
4. **Works for Both**: Works for both create and edit operations

## Testing

### Test Cases
- [x] Create new programme with levels → Levels saved ✅
- [x] Edit programme and change levels → Levels updated ✅
- [x] Edit programme and add levels → Levels added ✅
- [x] Edit programme and remove levels → Levels removed ✅
- [x] TypeScript compilation → No errors ✅

### Manual Testing Steps
1. Open programme list
2. Click "Edit" on a programme
3. Select/deselect levels
4. Click "Save"
5. Verify levels are saved (check table badges or click "Manage Levels")

## Files Modified

- `src/modules/StructureAcademique/admin/components/ProgrammeFormDialog.tsx`
  - Removed `useProgrammeLevels` hook
  - Added direct service imports
  - Added manual level loading
  - Fixed level saving logic

## Impact

- ✅ No breaking changes
- ✅ Backward compatible
- ✅ Works for create and edit
- ✅ Works with "Manage Levels" dialog (unchanged)
- ✅ Zero TypeScript errors

## Lessons Learned

1. **Hooks with Dynamic IDs**: Be careful when using hooks with IDs that change
2. **Closure Issues**: React hooks can have stale closure issues
3. **Direct Service Calls**: Sometimes direct service calls are clearer than hooks
4. **Testing Both Paths**: Always test both create and edit paths

## Related Files

- `src/modules/StructureAcademique/admin/components/ProgrammeLevelDialog.tsx` - Still uses hook (works correctly because ID is stable)
- `src/modules/StructureAcademique/admin/hooks/useProgrammeLevels.ts` - Hook still valid for other use cases
- `src/modules/StructureAcademique/admin/services/programmeLevelService.ts` - Service layer (unchanged)

---

**Status**: ✅ FIXED and TESTED
**Ready for**: Production deployment
