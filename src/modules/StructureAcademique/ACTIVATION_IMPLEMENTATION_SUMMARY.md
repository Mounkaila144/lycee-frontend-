# Programme Activation/Deactivation - Implementation Summary

## Story
**ID:** structure-academique.gestion-programmes.02-activation-desactivation
**Status:** ✅ Ready for Review
**Date:** January 2026

## What Was Implemented

### 1. ProgrammeActivationDialog Component
**File:** `src/modules/StructureAcademique/admin/components/ProgrammeActivationDialog.tsx`

A comprehensive modal dialog for managing programme lifecycle:

**Features:**
- ✅ Real-time validation checks with visual feedback
- ✅ Separate flows for activation and deactivation
- ✅ Success/error alerts with detailed messages
- ✅ Loading states during validation and submission
- ✅ Icon-based check status (✓ green / ✗ red)
- ✅ Disabled state when validations fail
- ✅ Warning message for deactivation impact

**Validation Display:**
```
✓ Au moins 1 niveau associé
✓ Responsable de programme assigné
✓ Structure du programme valide
✓ Programme non déjà actif
```

### 2. useProgrammeActivation Hook
**File:** `src/modules/StructureAcademique/admin/hooks/useProgrammeActivation.ts`

Custom hook managing all activation/deactivation logic:

**Capabilities:**
- ✅ Automatic validation on mount
- ✅ Separate validation logic for activation vs deactivation
- ✅ Real-time validation checks
- ✅ API integration via programmeService
- ✅ Refresh mechanism after status change
- ✅ Loading states management

**Validation Rules Implemented:**

**Activation:**
1. Has at least 1 level (`levels_count > 0`)
2. Has responsable assigned (`responsable_id !== null`)
3. Valid structure (code, libelle, type, duree_annees)
4. Not already active (`statut !== 'Actif'`)

**Deactivation:**
1. Currently active (`statut === 'Actif'`)
2. No active enrollments (`students_count === 0`)
3. User has permission (`can_be_modified !== false`)

### 3. ProgrammeListTable Integration
**File:** `src/modules/StructureAcademique/admin/components/ProgrammeListTable.tsx` (modified)

**Changes:**
- ✅ Added activation/deactivation buttons in actions column
- ✅ Conditional rendering based on programme status:
  - Active → Pause icon (deactivate)
  - Inactive/Draft → Play icon (activate)
  - Archived → No button
- ✅ Mobile view support with action buttons
- ✅ Dialog state management
- ✅ Success callback with table refresh

**Desktop View:**
```tsx
{statut === 'Actif' ? (
  <IconButton onClick={handleDeactivate}>
    <i className='ri-pause-circle-line text-warning' />
  </IconButton>
) : (
  <IconButton onClick={handleActivate}>
    <i className='ri-play-circle-line text-success' />
  </IconButton>
)}
```

**Mobile View:**
```tsx
actions={[
  { icon: 'ri-play-circle-line', color: 'success', onClick: handleActivate }
]}
```

### 4. Translations
**Files:** 
- `src/modules/StructureAcademique/translations/fr.json`
- `src/modules/StructureAcademique/translations/en.json`
- `src/modules/StructureAcademique/translations/ar.json`

**Added Keys:**
- `Activer` / `Activate` / `تفعيل`
- `Désactiver` / `Deactivate` / `إلغاء التفعيل`
- `Activer le programme` / `Activate program` / `تفعيل البرنامج`
- `Désactiver le programme` / `Deactivate program` / `إلغاء تفعيل البرنامج`
- `Programme` / `Program` / `البرنامج`
- `Statut actuel` / `Current status` / `الحالة الحالية`
- `Impossible d'activer ce programme` / `Cannot activate this program` / `لا يمكن تفعيل هذا البرنامج`
- `Impossible de désactiver ce programme` / `Cannot deactivate this program` / `لا يمكن إلغاء تفعيل هذا البرنامج`
- `Veuillez corriger les problèmes ci-dessous avant de continuer.` / `Please fix the issues below before continuing.` / `يرجى تصحيح المشاكل أدناه قبل المتابعة.`
- `Le programme peut être activé` / `The program can be activated` / `يمكن تفعيل البرنامج`
- `Le programme peut être désactivé` / `The program can be deactivated` / `يمكن إلغاء تفعيل البرنامج`
- `Toutes les vérifications sont passées avec succès.` / `All checks passed successfully.` / `تم اجتياز جميع الفحوصات بنجاح.`
- `Aucun obstacle à la désactivation.` / `No obstacles to deactivation.` / `لا توجد عوائق لإلغاء التفعيل.`
- `Vérifications` / `Checks` / `الفحوصات`
- `La désactivation rendra ce programme indisponible pour de nouvelles inscriptions.` / `Deactivation will make this program unavailable for new enrollments.` / `سيؤدي إلغاء التفعيل إلى جعل هذا البرنامج غير متاح للتسجيلات الجديدة.`
- `En cours...` / `In progress...` / `جاري المعالجة...`

### 5. Module Exports
**File:** `src/modules/StructureAcademique/admin/index.ts` (modified)

**Added Exports:**
```typescript
export { default as ProgrammeActivationDialog } from './components/ProgrammeActivationDialog';
export { useProgrammeActivation } from './hooks/useProgrammeActivation';
```

### 6. Documentation
**Files Created:**
- `src/modules/StructureAcademique/ACTIVATION_FEATURE.md` - Complete feature documentation
- `src/modules/StructureAcademique/ACTIVATION_IMPLEMENTATION_SUMMARY.md` - This file

## API Integration

**Endpoint Used:** `PATCH /api/admin/programmes/{id}/status`

**Request:**
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
  }
}
```

**Service Method:**
```typescript
programmeService.changeStatus(
  programmeId: number,
  data: { statut: ProgrammeStatus },
  tenantId?: string
): Promise<Programme>
```

## User Experience Flow

### Activation Flow
1. User sees inactive/draft programme in table
2. Clicks green play icon button
3. Dialog opens with validation checks
4. System validates requirements
5. If all pass → Green alert + "Activer" button enabled
6. If any fail → Red alert + specific error messages + button disabled
7. User clicks "Activer"
8. API call updates status
9. Dialog closes, table refreshes
10. Programme now shows as "Actif" with pause icon

### Deactivation Flow
1. User sees active programme in table
2. Clicks orange pause icon button
3. Dialog opens with validation checks
4. System validates (no students, has permission)
5. If all pass → Green alert + warning message + "Désactiver" button enabled
6. If any fail → Red alert + specific error messages + button disabled
7. User clicks "Désactiver"
8. API call updates status
9. Dialog closes, table refreshes
10. Programme now shows as "Inactif" with play icon

## Technical Highlights

### 1. Validation Architecture
- Client-side validation before API call
- Prevents unnecessary API requests
- Immediate feedback to user
- Extensible validation system

### 2. State Management
- React hooks for local state
- Context integration for tenant
- Automatic refresh after changes
- Loading states for better UX

### 3. Responsive Design
- Desktop: IconButtons in actions column
- Mobile: Action buttons in mobile card
- Consistent behavior across devices

### 4. Internationalization
- Full i18n support (fr/en/ar)
- RTL support for Arabic
- Consistent translations across components

### 5. Error Handling
- Graceful API error handling
- User-friendly error messages
- Console logging for debugging
- Non-blocking errors

## Code Quality

### TypeScript
- ✅ Full type safety
- ✅ No `any` types used
- ✅ Proper interface definitions
- ✅ Type exports for reusability

### React Best Practices
- ✅ Functional components
- ✅ Custom hooks for logic separation
- ✅ useCallback for performance
- ✅ Proper dependency arrays
- ✅ Client component directives

### MUI Standards
- ✅ MUI components used throughout
- ✅ Consistent styling with sx prop
- ✅ Theme colors for status
- ✅ Responsive design patterns

## Testing Recommendations

### Manual Testing Checklist
- [ ] Activate programme with all requirements met
- [ ] Try to activate programme without levels
- [ ] Try to activate programme without responsable
- [ ] Try to activate already active programme
- [ ] Deactivate programme with no students
- [ ] Try to deactivate programme with enrolled students
- [ ] Try to deactivate without permission
- [ ] Test in French, English, and Arabic
- [ ] Test on mobile devices
- [ ] Test loading states
- [ ] Test error scenarios

### Automated Testing (Future)
- Unit tests for useProgrammeActivation hook
- Component tests for ProgrammeActivationDialog
- Integration tests for full flow
- E2E tests for user scenarios

## Files Modified/Created

### Created
1. `src/modules/StructureAcademique/admin/components/ProgrammeActivationDialog.tsx`
2. `src/modules/StructureAcademique/admin/hooks/useProgrammeActivation.ts`
3. `src/modules/StructureAcademique/ACTIVATION_FEATURE.md`
4. `src/modules/StructureAcademique/ACTIVATION_IMPLEMENTATION_SUMMARY.md`

### Modified
1. `src/modules/StructureAcademique/admin/components/ProgrammeListTable.tsx`
2. `src/modules/StructureAcademique/admin/index.ts`
3. `src/modules/StructureAcademique/translations/fr.json`
4. `src/modules/StructureAcademique/translations/en.json`
5. `src/modules/StructureAcademique/translations/ar.json`
6. `docs/stories/structure-academique.gestion-programmes.02-activation-desactivation.story.md`

### Existing (Used)
1. `src/modules/StructureAcademique/admin/services/programmeService.ts` (changeStatus method)
2. `src/modules/StructureAcademique/types/programme.types.ts`

## Backend Assumptions

The frontend implementation assumes the backend provides:

1. **API Endpoint:** `PATCH /api/admin/programmes/{id}/status`
2. **Programme Data Fields:**
   - `levels_count` - Number of levels
   - `students_count` - Number of enrolled students
   - `responsable_id` - ID of responsible person
   - `can_be_modified` - Permission flag
   - `statut` - Current status

3. **Backend Validation:** Additional server-side validation for:
   - Levels have modules with ECTS credits
   - No planned exam sessions
   - Business rules enforcement

4. **Events (Optional):**
   - `ProgrammeActivated` event
   - `ProgrammeDeactivated` event
   - Notification system integration

## Next Steps

### Immediate
- [x] Frontend implementation complete
- [ ] Backend validation review
- [ ] Integration testing with backend
- [ ] User acceptance testing

### Future Enhancements
- [ ] Real-time event notifications
- [ ] Activation/deactivation history
- [ ] Bulk operations
- [ ] Advanced validation rules
- [ ] Audit trail display

## Conclusion

The programme activation/deactivation feature is **fully implemented on the frontend** with:
- ✅ Comprehensive validation logic
- ✅ User-friendly interface
- ✅ Complete internationalization
- ✅ Responsive design
- ✅ Full documentation

The implementation follows all project coding standards and is ready for integration with the backend API.

---

**Implementation Date:** January 2026
**Developer:** James (B-MAD Dev Agent)
**Status:** ✅ Ready for Review
