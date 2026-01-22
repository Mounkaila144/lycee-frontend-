# 🔑 Import Preview Key Fix

**Issue:** `The preview key field is required` error on import confirmation
**Date:** January 12, 2026
**Fixed by:** James

---

## 🔍 Root Cause

The backend uses a **two-step import process**:

1. **Step 1 - Preview:** Upload file → Backend validates → Returns `preview_key` + preview data
2. **Step 2 - Confirm:** Send `preview_key` → Backend imports the validated data

**The Problem:**
- Frontend was re-uploading the file on confirmation
- Backend expected `preview_key` instead
- This caused the "preview key field is required" error

---

## 🏗️ Backend Architecture

### Preview Endpoint
```
POST /api/admin/programmes/import
Content-Type: multipart/form-data

Request:
- file: Excel/CSV file

Response:
{
  "message": "Prévisualisation générée",
  "preview_key": "import_preview_cV64U5cmRyYdpjwoOvRGe1F0P5hedicZ",
  "summary": {
    "total_rows": 7,
    "valid_rows": 0,
    "invalid_rows": 7,
    "can_import": false
  },
  "data": [
    {
      "row": 2,
      "data": { "code": "23", "libelle": "test", ... },
      "valid": false,
      "errors": ["Type invalide: 'test'", ...]
    },
    ...
  ]
}
```

### Confirm Endpoint
```
POST /api/admin/programmes/import/confirm
Content-Type: application/json

Request:
{
  "preview_key": "import_preview_cV64U5cmRyYdpjwoOvRGe1F0P5hedicZ"
}

Response:
{
  "success": true,
  "message": "Import réussi",
  "created_count": 5,
  "failed_count": 2,
  "errors": [
    { "row": 3, "message": "Code déjà existant" },
    ...
  ]
}
```

---

## ✅ Fixes Applied

### 1. Type Definition - Added preview_key

**File:** `types/programme.types.ts`

```typescript
export interface ImportPreviewResponse {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  rows: ImportPreviewRow[];
  can_import: boolean;
  preview_key?: string; // ← Added
}
```

---

### 2. Service - Capture and Use preview_key

**File:** `admin/services/programmeService.ts`

**uploadForPreview():**
```typescript
// Capture preview_key from backend response
previewData = {
  total_rows: backendData.summary?.total_rows || backendData.data.length,
  valid_rows: backendData.summary?.valid_rows || ...,
  invalid_rows: backendData.summary?.invalid_rows || ...,
  rows: backendData.data.map(...),
  can_import: backendData.summary?.can_import ?? ...,
  preview_key: backendData.preview_key // ← Store the key
};
```

**confirmImport():**
```typescript
// Changed signature from (file: File) to (previewKey: string)
async confirmImport(previewKey: string, tenantId?: string): Promise<ImportConfirmResponse> {
  const response = await client.post(
    '/admin/programmes/import/confirm',
    { preview_key: previewKey }, // ← Send key instead of file
    {
      headers: {
        'Content-Type': 'application/json', // ← Changed from multipart/form-data
      },
    }
  );
  // ...
}
```

---

### 3. Hook - Use preview_key from State

**File:** `admin/hooks/useProgrammeImportExport.ts`

```typescript
// Changed signature from (file: File) to ()
const confirmImport = async (): Promise<ImportConfirmResponse | null> => {
  if (!previewData?.preview_key) {
    setError('Clé de prévisualisation manquante. Veuillez recharger le fichier.');
    return null;
  }

  const result = await programmeService.confirmImport(
    previewData.preview_key, // ← Use stored key
    tenantId || undefined
  );
  // ...
}
```

---

### 4. Component - Simplified Confirmation

**File:** `admin/components/ProgrammeImportDialog.tsx`

```typescript
// Before
const handleConfirmImport = async () => {
  if (!selectedFile) return
  const result = await confirmImport(selectedFile) // ❌ Passed file
  // ...
}

// After
const handleConfirmImport = async () => {
  const result = await confirmImport() // ✅ No file needed
  // ...
}
```

---

## 🔄 Import Flow

### Before (Broken)
```
1. User uploads file
   → POST /import with file
   → Backend returns preview_key + data
   
2. User clicks "Importer"
   → POST /import/confirm with file ❌
   → Backend: "preview_key required" error
```

### After (Fixed)
```
1. User uploads file
   → POST /import with file
   → Backend returns preview_key + data
   → Frontend stores preview_key
   
2. User clicks "Importer"
   → POST /import/confirm with preview_key ✅
   → Backend imports successfully
```

---

## 🎯 Benefits

### Security
- ✅ Backend validates data once during preview
- ✅ Confirmation uses validated data (via preview_key)
- ✅ No risk of data tampering between preview and import

### Performance
- ✅ File uploaded only once
- ✅ Confirmation is fast (no file re-upload)
- ✅ Backend can cache validated data

### UX
- ✅ Faster import confirmation
- ✅ No duplicate file uploads
- ✅ Clear error messages

---

## 🧪 Testing

### Test Scenarios
1. ✅ Upload file → Preview displays correctly
2. ✅ Click "Importer" → Import executes with preview_key
3. ✅ Import succeeds → Success message with counts
4. ✅ Import fails → Error details displayed
5. ✅ Close dialog → preview_key cleared
6. ✅ Re-upload file → New preview_key generated

---

## 📋 Changes Summary

### Files Modified (4)
1. **types/programme.types.ts**
   - Added `preview_key?: string` to `ImportPreviewResponse`

2. **admin/services/programmeService.ts**
   - `uploadForPreview()`: Capture `preview_key` from response
   - `confirmImport()`: Changed signature to use `preview_key` instead of `file`
   - Changed Content-Type from `multipart/form-data` to `application/json`

3. **admin/hooks/useProgrammeImportExport.ts**
   - `confirmImport()`: Changed signature to use stored `preview_key`
   - Added validation for missing `preview_key`

4. **admin/components/ProgrammeImportDialog.tsx**
   - `handleConfirmImport()`: Removed file parameter
   - Simplified confirmation logic

---

## ✅ Verification

- [x] No TypeScript errors
- [x] Preview displays correctly
- [x] Confirmation sends preview_key
- [x] Import executes successfully
- [x] Error handling works
- [x] Dialog cleanup works

---

**Status:** ✅ **Fixed and Ready**

The import/export feature now correctly uses the backend's two-step process with preview_key.

