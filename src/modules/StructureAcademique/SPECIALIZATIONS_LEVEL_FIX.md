# Specializations - Level Field Fix

## Issue
Backend validation error when creating specialization:
```json
{
  "message": "The available from level field must be a string.",
  "errors": {
    "available_from_level": [
      "The available from level field must be a string.",
      "Le niveau doit être L1, L2, L3, M1 ou M2."
    ]
  }
}
```

## Root Cause
The frontend was sending `available_from_level` as a number (1, 2, 3, etc.) but the backend expects a string enum value ('L1', 'L2', 'L3', 'M1', 'M2').

## Solution Applied

### 1. Updated Types
**File**: `src/modules/StructureAcademique/types/specialization.types.ts`

Added `AcademicLevel` type:
```typescript
export type AcademicLevel = 'L1' | 'L2' | 'L3' | 'M1' | 'M2'
```

Changed `available_from_level` from `number` to `AcademicLevel`:
```typescript
export interface Specialization {
  // ...
  available_from_level: AcademicLevel  // Was: number
  // ...
}

export interface SpecializationFormInput {
  // ...
  available_from_level: AcademicLevel  // Was: number
  // ...
}
```

### 2. Updated Form Component
**File**: `src/modules/StructureAcademique/admin/components/SpecializationFormDialog.tsx`

**Before** (TextField with number input):
```typescript
<TextField
  {...field}
  fullWidth
  type="number"
  label="Available From Level"
/>
```

**After** (Select with enum values):
```typescript
<FormControl fullWidth>
  <InputLabel>Available From Level</InputLabel>
  <Select {...field} label="Available From Level">
    <MenuItem value="L1">L1 (Licence 1)</MenuItem>
    <MenuItem value="L2">L2 (Licence 2)</MenuItem>
    <MenuItem value="L3">L3 (Licence 3)</MenuItem>
    <MenuItem value="M1">M1 (Master 1)</MenuItem>
    <MenuItem value="M2">M2 (Master 2)</MenuItem>
  </Select>
</FormControl>
```

**Default value changed**:
```typescript
// Before
available_from_level: 1

// After
available_from_level: 'L1' as AcademicLevel
```

### 3. Updated Table Display
**File**: `src/modules/StructureAcademique/admin/components/SpecializationListTable.tsx`

**Before**:
```typescript
<Chip label={`L${spec.available_from_level}+`} size="small" />
```

**After**:
```typescript
<Chip label={spec.available_from_level} size="small" />
```

## Testing

### Test Case 1: Create Specialization
1. Navigate to `/admin/structure/specializations`
2. Click "Create Specialization"
3. Fill form with:
   - Code: TEST-2026
   - Name: Test Specialization
   - Programme: Select any
   - Available From Level: Select "L3 (Licence 3)"
   - Type: Obligatoire
   - Selection Mode: Exclusive
4. Click Save

**Expected**: ✅ Specialization created successfully
**Actual**: ✅ Works correctly

### Test Case 2: Edit Specialization
1. Edit an existing specialization
2. Change level from L1 to M1
3. Save

**Expected**: ✅ Level updated successfully
**Actual**: ✅ Works correctly

### Test Case 3: Display in Table
1. View specializations list
2. Check "Level" column

**Expected**: ✅ Shows "L1", "L2", "L3", "M1", or "M2"
**Actual**: ✅ Displays correctly

## Backend Validation Rules

The backend expects:
- **Type**: String
- **Values**: 'L1', 'L2', 'L3', 'M1', 'M2'
- **Validation**: Must be one of the enum values

## Files Modified

1. `src/modules/StructureAcademique/types/specialization.types.ts`
   - Added `AcademicLevel` type
   - Changed `available_from_level` type

2. `src/modules/StructureAcademique/admin/components/SpecializationFormDialog.tsx`
   - Changed TextField to Select
   - Updated default values
   - Added enum options

3. `src/modules/StructureAcademique/admin/components/SpecializationListTable.tsx`
   - Updated display logic

## Status

✅ **Fixed and Tested**

The specialization creation now works correctly with the backend validation rules.

---

**Date**: January 15, 2026
**Issue**: Backend validation error for `available_from_level`
**Resolution**: Changed from number to string enum ('L1', 'L2', 'L3', 'M1', 'M2')
