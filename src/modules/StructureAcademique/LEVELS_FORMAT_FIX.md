# Fix: Levels Not Showing in Edit Form

**Date**: 2026-01-12
**Issue**: Selected levels not displayed when editing a programme
**Status**: ✅ FIXED

## Problem Description

When editing a programme that already has levels associated (e.g., `["L1","L2"]`), the level checkboxes were not pre-selected in the edit form. The form showed all checkboxes as unchecked even though the programme had levels.

### API Response Format
```json
{
  "id": 5,
  "code": "423",
  "libelle": "test",
  "type": "Licence",
  "levels": ["L1", "L2"],  // ← Array of strings
  ...
}
```

### Expected vs Actual

**Expected**: When opening edit form, L1 and L2 checkboxes should be checked ✅
**Actual**: All checkboxes were unchecked ❌

## Root Cause

The code was expecting `levels` to be an array of objects:
```typescript
levels?: Array<{
  id: number;
  level: string;
}>
```

But the API was returning an array of strings:
```typescript
levels?: string[]  // ["L1", "L2"]
```

### Problematic Code

**In ProgrammeFormDialog.tsx:**
```typescript
// ❌ This failed when levels is string[]
if (programme.levels && programme.levels.length > 0) {
  setSelectedLevels(programme.levels.map(l => l.level as ProgrammeLevel));
  //                                          ^^^^^^^ 
  //                                          Trying to access .level on a string
}
```

**In ProgrammeListTable.tsx:**
```typescript
// ❌ Same issue in table display
const levels = row.original.levels?.map(l => l.level as ProgrammeLevel) || [];
```

## Solution

Updated the code to handle **both formats**:
1. Array of strings: `["L1", "L2"]`
2. Array of objects: `[{id: 1, level: "L1"}, {id: 2, level: "L2"}]`

### 1. Updated Type Definition

**File**: `types/programme.types.ts`

```typescript
export interface Programme {
  // ...
  // Levels can be returned as array of strings or array of objects
  levels?: Array<{
    id: number;
    level: string;
  }> | string[];
  // ...
}
```

### 2. Fixed Form Initialization

**File**: `admin/components/ProgrammeFormDialog.tsx`

```typescript
// Load levels from programme data or fetch from API
if (programme.levels && programme.levels.length > 0) {
  // Handle both formats: array of strings ["L1","L2"] or array of objects [{id, level}]
  const levelsArray = programme.levels.map(l => {
    // If it's already a string, use it directly
    if (typeof l === 'string') {
      return l as ProgrammeLevel;
    }
    // If it's an object with level property, extract it
    return l.level as ProgrammeLevel;
  });
  setSelectedLevels(levelsArray);
}
```

### 3. Fixed Table Display

**File**: `admin/components/ProgrammeListTable.tsx`

```typescript
cell: ({ row }) => {
  // Handle both formats: array of strings ["L1","L2"] or array of objects [{id, level}]
  const levels = row.original.levels?.map(l => {
    if (typeof l === 'string') {
      return l as ProgrammeLevel;
    }
    return l.level as ProgrammeLevel;
  }) || [];
  
  return levels.length > 0 ? (
    <ProgrammeLevelBadges levels={levels} size="small" max={3} />
  ) : (
    <Chip variant='outlined' label="Aucun" size='small' color='default' />
  );
}
```

## How It Works Now

### Type Check Logic
```typescript
programme.levels.map(l => {
  if (typeof l === 'string') {
    // Format 1: ["L1", "L2"]
    return l as ProgrammeLevel;
  }
  // Format 2: [{id: 1, level: "L1"}]
  return l.level as ProgrammeLevel;
})
```

### Example Scenarios

**Scenario 1: API returns strings**
```typescript
Input:  levels: ["L1", "L2"]
Output: selectedLevels: ["L1", "L2"]
Result: ✅ L1 and L2 checkboxes checked
```

**Scenario 2: API returns objects**
```typescript
Input:  levels: [{id: 1, level: "L1"}, {id: 2, level: "L2"}]
Output: selectedLevels: ["L1", "L2"]
Result: ✅ L1 and L2 checkboxes checked
```

**Scenario 3: No levels**
```typescript
Input:  levels: []
Output: selectedLevels: []
Result: ✅ All checkboxes unchecked
```

## Testing

### Test Cases
- [x] Edit programme with levels as strings → Checkboxes pre-selected ✅
- [x] Edit programme with levels as objects → Checkboxes pre-selected ✅
- [x] Edit programme with no levels → All checkboxes unchecked ✅
- [x] Create new programme → All checkboxes unchecked ✅
- [x] Table displays level badges correctly → Badges shown ✅
- [x] TypeScript compilation → No errors ✅

### Manual Testing Steps
1. Create a programme with levels (e.g., L1, L2)
2. Save and close
3. Click "Edit" on that programme
4. **Verify**: L1 and L2 checkboxes are checked ✅
5. Change levels (add L3, remove L1)
6. Save
7. **Verify**: Changes are saved correctly ✅

## Visual Confirmation

### Before Fix
```
Edit Programme Dialog:
┌─────────────────────────────┐
│ Code: 423                   │
│ Type: Licence               │
│                             │
│ Niveaux disponibles:        │
│ ☐ L1  ☐ L2  ☐ L3           │  ← All unchecked ❌
│                             │
└─────────────────────────────┘
```

### After Fix
```
Edit Programme Dialog:
┌─────────────────────────────┐
│ Code: 423                   │
│ Type: Licence               │
│                             │
│ Niveaux disponibles:        │
│ ☑ L1  ☑ L2  ☐ L3           │  ← Correctly checked ✅
│                             │
└─────────────────────────────┘
```

## Files Modified

1. **types/programme.types.ts**
   - Updated `Programme.levels` type to accept both formats

2. **admin/components/ProgrammeFormDialog.tsx**
   - Added type checking in level initialization
   - Handles both string[] and object[] formats

3. **admin/components/ProgrammeListTable.tsx**
   - Added type checking in table cell rendering
   - Handles both formats for badge display

## Impact

- ✅ Edit form now correctly shows selected levels
- ✅ Table badges display correctly
- ✅ Backward compatible with both API formats
- ✅ No breaking changes
- ✅ TypeScript type-safe

## Why Two Formats?

The API might return different formats depending on:
1. **List endpoint** (`/api/admin/programmes`): Returns simplified format `["L1","L2"]` for performance
2. **Detail endpoint** (`/api/admin/programmes/{id}`): Returns full objects `[{id, level}]` with relations
3. **After save**: Might return either format depending on backend implementation

Our solution handles both gracefully! 🎉

## Related Issues

This fix also resolves:
- Level badges not showing in table
- Level count mismatch
- Edit form not populating correctly

---

**Status**: ✅ FIXED and TESTED
**Ready for**: Production deployment
