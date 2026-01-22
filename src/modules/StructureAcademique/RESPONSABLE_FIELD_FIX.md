# Fix: Responsable Field Not Pre-Selected in Edit Mode

## Problem
When clicking the "Édition" button to edit a programme, the "Responsable" field was not being pre-selected with the current responsable, even though the API was returning the correct data.

Additionally, clicking "Éditer" was triggering an unnecessary API call to reload the full programme details, when the data was already available in the table.

## Root Cause

### Issue 1: Responsable Not Pre-Selected
The API returns the responsable as an **object** with structure:
```json
{
  "responsable": {
    "id": 2,
    "name": null,
    "email": "manager@.com"
  }
}
```

But the code was looking for `responsable_id` field directly, which doesn't exist in the API response.

### Issue 2: Unnecessary API Call
The dialog was making a separate API call to `GET /api/admin/programmes/{id}` to load full programme details, even though the programme data was already available from the table (passed as props).

## Solution Applied

### 1. Fixed Data Extraction
Updated the useEffect that populates the form to extract the ID from the `responsable` object:

```typescript
// Extract responsable_id from responsable object (API returns responsable object, not responsable_id)
const responsableId = programme.responsable?.id || programme.responsable_id;
```

The order matters! The API returns `responsable.id`, not `responsable_id`.

### 2. Removed Unnecessary API Call
Removed the separate `loadProgrammeDetails` useEffect that was calling the API. Now the dialog uses the programme data passed as props directly:

```typescript
// Before (unnecessary API call)
useEffect(() => {
  const loadProgrammeDetails = async () => {
    const details = await programmeService.getProgramme(programme.id, tenantId);
    setFullProgramme(details);
  };
  loadProgrammeDetails();
}, [programme, isEditMode, open, tenantId]);

// After (use props directly)
useEffect(() => {
  if (programme && isEditMode) {
    const responsableId = programme.responsable?.id || programme.responsable_id;
    setFormData({
      code: programme.code,
      libelle: programme.libelle,
      // ... other fields
      responsable_id: responsableId || null,
    });
  }
}, [programme, isEditMode, open]);
```

### 3. Fixed Responsable Selection
Updated the useEffect that sets the selected responsable in the Autocomplete:

```typescript
// Extract ID from responsable object (API returns responsable object)
const responsableId = programme.responsable?.id || programme.responsable_id;

if (responsableId) {
  const numericId = typeof responsableId === 'string' ? parseInt(responsableId) : responsableId;
  const responsable = users.find(u => u.id === numericId);
  
  if (responsable) {
    setSelectedResponsable(responsable);
  }
}
```

### 4. Fixed Deprecated InputProps Warning
Changed from `InputProps` to `slotProps.input` to follow MUI v6 best practices:

```typescript
// Before (deprecated)
InputProps={{
  ...params.InputProps,
  endAdornment: (...)
}}

// After (correct)
slotProps={{
  input: {
    ...params.InputProps,
    endAdornment: (...)
  }
}}
```

## How It Works Now

### Edit Flow
1. User clicks "Édition" button on a programme
2. Dialog opens with programme data from props (no API call needed!)
3. Dialog loads users list: `GET /api/admin/users?per_page=100`
4. Extract `responsable.id` from the programme data
5. When users list arrives, find the user matching `responsable.id`
6. Set that user as the selected value in the Autocomplete
7. User sees the responsable pre-selected ✅

### Create Flow
1. User clicks "Nouveau programme" button
2. Dialog opens and loads users list
3. Form is empty, no responsable selected
4. User must select a responsable (required field)
5. User fills form and submits

## Performance Improvements

### Before
- Click "Éditer" → 2 API calls:
  - `GET /api/admin/users?per_page=100`
  - `GET /api/admin/programmes/{id}` ❌ (unnecessary)

### After
- Click "Éditer" → 1 API call:
  - `GET /api/admin/users?per_page=100` ✅ (only this one)

The programme data is already available from the table, so we don't need to fetch it again!

## Future Optimizations

The dialog still loads 100 users every time it opens. This could be further optimized by:

1. **Caching users at parent level** - Load once in ProgrammeList, pass to dialog
2. **Backend search endpoint** - Implement autocomplete search on backend
3. **Lazy loading** - Load users on demand as user types

For now, the current approach is simple and works well for small to medium user bases.

## Files Modified
- `src/modules/StructureAcademique/admin/components/ProgrammeFormDialog.tsx`

## Testing Checklist
- [x] Create new programme - responsable field works
- [x] Edit existing programme - responsable is pre-selected
- [x] Edit mode - no unnecessary API call to load programme details
- [x] Change responsable in edit mode - saves correctly
- [x] Required validation works - cannot submit without responsable
- [x] No console errors
- [x] No TypeScript errors
- [x] MUI v6 best practices followed (slotProps instead of InputProps)

## Related Issues
- User reported: "Le champ 'Responsable' ne vient pas par défaut"
- User reported: "Lorsque je clique sur éditer, ça fait une requête pour récupérer toute la liste des programmes"
- API returns `responsable` object, not `responsable_id` field
- Fixed by extracting ID from `responsable.id` instead of looking for `responsable_id`
- Fixed by removing unnecessary API call to load programme details

---

**Status**: ✅ Fixed and tested
**Date**: 2026-01-12
