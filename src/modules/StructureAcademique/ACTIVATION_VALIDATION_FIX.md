# Activation Validation Fix

## Issue

When trying to activate a programme that has a responsable assigned, the validation was incorrectly failing with the error:
```
Responsable de programme assigné
Un responsable doit être assigné au programme
```

## Root Cause

The validation logic was checking for `responsable_id` field:
```typescript
const hasResponsable = prog.responsable_id !== null && prog.responsable_id !== undefined
```

However, the API response includes the full `responsable` object instead:
```json
{
  "responsable": {
    "id": 2,
    "name": null,
    "email": "manager@.com"
  }
}
```

## Fix Applied

Updated the validation to check both `responsable` object and `responsable_id` field:

```typescript
// Before
const hasResponsable = prog.responsable_id !== null && prog.responsable_id !== undefined

// After
const hasResponsable = !!(prog.responsable?.id || prog.responsable_id)
```

This ensures the validation works whether the API returns:
- The full `responsable` object (with `id` property)
- Just the `responsable_id` field
- Both

## Additional Fix

Also improved the levels validation to check both `levels_count` and `levels` array:

```typescript
// Before
const hasLevels = (prog.levels_count ?? 0) > 0

// After
const levelsCount = prog.levels_count ?? prog.levels?.length ?? 0
const hasLevels = levelsCount > 0
```

This handles cases where:
- API returns `levels_count` metadata
- API returns `levels` array
- API returns both

## Testing

With the programme data:
```json
{
  "id": 2,
  "code": "niger",
  "responsable": {
    "id": 2,
    "name": null,
    "email": "manager@.com"
  },
  "levels": []
}
```

**Before fix:**
- ❌ Responsable check failed (incorrectly)
- ❌ Levels check failed (correctly - no levels)

**After fix:**
- ✅ Responsable check passes (correctly)
- ❌ Levels check fails (correctly - no levels)

## Impact

- ✅ Responsable validation now works correctly
- ✅ Levels validation is more robust
- ✅ No breaking changes
- ✅ Backward compatible with both API response formats

## Files Modified

- `src/modules/StructureAcademique/admin/hooks/useProgrammeActivation.ts`

## Date

January 12, 2026
