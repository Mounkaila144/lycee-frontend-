# Testing Guide: Evaluation Periods Management

## Prerequisites

1. Backend API is running and accessible
2. You have an active academic year with at least one semester
3. You have proper permissions: `evaluation_periods.manage`
4. You're logged in as Superadmin or Responsable Pédagogique

## Test Scenarios

### Scenario 1: Access Evaluation Periods Dialog

**Steps:**
1. Navigate to `/[lang]/admin/structure/academic-years`
2. Find an active academic year
3. Click "Gérer les semestres" button
4. Locate a semester card
5. Click the calendar icon (🗓️) labeled "Périodes d'évaluation"

**Expected Result:**
- Dialog opens with title "Périodes d'Évaluation - [Semester Name]"
- If no periods exist, shows info message: "Aucune période d'évaluation configurée pour ce semestre."
- "Ajouter" button is visible and enabled

---

### Scenario 2: Create CC Period

**Steps:**
1. Open Evaluation Periods dialog (see Scenario 1)
2. Click "Ajouter" button
3. Form dialog opens
4. Select "Contrôle Continu" from Type dropdown
5. Set start date: 2024-09-01
6. Set end date: 2024-12-20
7. Click "Enregistrer"

**Expected Result:**
- Form submits successfully
- Dialog closes
- New period appears in the table
- Period shows blue "Contrôle Continu" chip
- Status shows "Active" or "Inactive" based on current date
- Dates display in French format: 01/09/2024 - 20/12/2024

---

### Scenario 3: Create Examen Period

**Steps:**
1. Open Evaluation Periods dialog
2. Click "Ajouter"
3. Select "Examens Normaux" from Type
4. Set start date: 2024-12-21
5. Set end date: 2025-01-10
6. Click "Enregistrer"

**Expected Result:**
- Period created successfully
- Shows orange "Examens Normaux" chip
- Appears in table below CC period

---

### Scenario 4: Create Rattrapage Period

**Steps:**
1. Open Evaluation Periods dialog
2. Click "Ajouter"
3. Select "Rattrapages" from Type
4. Set start date: 2025-01-15
5. Set end date: 2025-01-30
6. Click "Enregistrer"

**Expected Result:**
- Period created successfully
- Shows red "Rattrapages" chip
- Appears in table

---

### Scenario 5: Edit Evaluation Period

**Steps:**
1. Open Evaluation Periods dialog
2. Locate an existing period
3. Click the edit icon (✏️)
4. Form opens with pre-filled data
5. Change end date to a different date
6. Click "Enregistrer"

**Expected Result:**
- Period updates successfully
- Dialog closes
- Updated date reflects in the table

---

### Scenario 6: Delete Evaluation Period

**Steps:**
1. Open Evaluation Periods dialog
2. Locate a period to delete
3. Click the delete icon (🗑️)
4. Confirmation dialog appears
5. Click "OK" to confirm

**Expected Result:**
- Period is deleted
- Removed from table
- Remaining periods still display correctly

---

### Scenario 7: Validation - Required Fields

**Steps:**
1. Open Evaluation Periods dialog
2. Click "Ajouter"
3. Leave all fields empty
4. Click "Enregistrer"

**Expected Result:**
- Form does not submit
- Error messages appear:
  - "Le type est obligatoire"
  - "La date de début est obligatoire"
  - "La date de fin est obligatoire"

---

### Scenario 8: Multiple Periods Display

**Steps:**
1. Create 3 different periods (CC, Examen, Rattrapage)
2. View the table

**Expected Result:**
- All 3 periods display in table
- Each has correct color chip:
  - CC: Blue (info)
  - Examen: Orange (warning)
  - Rattrapage: Red (error)
- Dates are formatted correctly
- Status shows for each period

---

### Scenario 9: Empty State

**Steps:**
1. Open Evaluation Periods dialog for a semester with no periods
2. Observe the display

**Expected Result:**
- Info alert shows: "Aucune période d'évaluation configurée pour ce semestre."
- "Ajouter" button is still available
- No table is displayed

---

### Scenario 10: Loading State

**Steps:**
1. Open Evaluation Periods dialog
2. Observe during data fetch

**Expected Result:**
- Circular progress indicator displays
- No error messages
- Dialog remains open

---

### Scenario 11: Error Handling

**Steps:**
1. Disconnect from backend or cause API error
2. Open Evaluation Periods dialog

**Expected Result:**
- Error alert displays: "Erreur lors du chargement des périodes d'évaluation"
- No crash or blank screen
- Dialog remains functional

---

### Scenario 12: Closed Semester

**Steps:**
1. Open Evaluation Periods dialog for a closed semester
2. Try to view periods

**Expected Result:**
- Periods are still viewable
- Can still add/edit/delete (backend should enforce restrictions if needed)

---

## Visual Verification Checklist

### Dialog Layout
- [ ] Title shows semester name correctly
- [ ] "Ajouter" button aligned to right
- [ ] "Fermer" button in dialog actions
- [ ] Proper spacing and padding

### Table Display
- [ ] Headers: Type, Date Début, Date Fin, Statut, Actions
- [ ] Chips display with correct colors
- [ ] Dates formatted as DD/MM/YYYY
- [ ] Icons are visible and clickable
- [ ] Table is responsive

### Form Dialog
- [ ] Title changes based on mode (Ajouter/Modifier)
- [ ] Type dropdown shows all 3 options
- [ ] Date pickers work correctly
- [ ] Buttons: Annuler, Enregistrer
- [ ] Loading state disables form during submission

---

## API Call Verification

### Check Network Tab

**GET Request:**
```
GET /api/admin/semesters/{id}/evaluation-periods
Response: { data: [...] }
```

**POST Request:**
```
POST /api/admin/semesters/{id}/evaluation-periods
Body: { type: "CC", start_date: "2024-09-01", end_date: "2024-12-20" }
Response: { data: {...} }
```

**PUT Request:**
```
PUT /api/admin/evaluation-periods/{id}
Body: { end_date: "2024-12-25" }
Response: { data: {...} }
```

**DELETE Request:**
```
DELETE /api/admin/evaluation-periods/{id}
Response: 204 No Content
```

---

## Browser Console Checks

### No Errors Expected
- [ ] No TypeScript errors
- [ ] No React warnings
- [ ] No 404 errors
- [ ] No CORS errors

### Expected Logs (if any)
- Query invalidation after mutations
- Successful API responses

---

## Responsive Testing

### Desktop (1920x1080)
- [ ] Dialog displays at proper width (md = 960px)
- [ ] Table columns are well-spaced
- [ ] All buttons visible

### Tablet (768x1024)
- [ ] Dialog adapts to screen width
- [ ] Table remains readable
- [ ] Form fields stack properly

### Mobile (375x667)
- [ ] Dialog takes full width
- [ ] Table scrolls horizontally if needed
- [ ] Form is usable
- [ ] Buttons are tappable

---

## Performance Checks

- [ ] Dialog opens quickly (<500ms)
- [ ] Data loads without lag
- [ ] Form submission is responsive
- [ ] No memory leaks (check React DevTools)

---

## Accessibility Checks

- [ ] Dialog can be closed with Escape key
- [ ] Form fields have proper labels
- [ ] Error messages are announced
- [ ] Buttons have proper ARIA labels
- [ ] Keyboard navigation works

---

## Integration Testing

### With Semester Management
- [ ] Button appears in correct position
- [ ] Icon is appropriate (calendar)
- [ ] Tooltip shows on hover
- [ ] Opens correct semester's periods

### With Academic Calendar
- [ ] Periods relate to correct semester
- [ ] Dates respect semester boundaries (backend validation)
- [ ] No conflicts with academic periods

---

## Edge Cases

### Empty Semester
- [ ] Can add periods to brand new semester
- [ ] No errors with null/undefined data

### Many Periods
- [ ] Table handles 10+ periods gracefully
- [ ] Scrolling works if needed
- [ ] Performance remains good

### Date Edge Cases
- [ ] Same start and end date (backend should validate)
- [ ] Dates outside semester (backend should validate)
- [ ] Past dates work correctly
- [ ] Future dates work correctly

---

## Regression Testing

After implementation, verify these still work:
- [ ] Academic year management
- [ ] Semester creation/editing
- [ ] Academic periods management
- [ ] Semester modules management
- [ ] Other semester features

---

## Sign-Off Checklist

Before marking as complete:
- [ ] All test scenarios pass
- [ ] No console errors
- [ ] Visual design matches MUI standards
- [ ] Responsive on all screen sizes
- [ ] API calls work correctly
- [ ] Error handling works
- [ ] Loading states work
- [ ] Validation works
- [ ] Integration with semester management works
- [ ] Documentation is complete

---

**Testing Date:** _____________
**Tester:** _____________
**Result:** ☐ Pass ☐ Fail
**Notes:** _____________

