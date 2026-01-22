# Specializations Management - Testing Guide

## 🧪 Quick Testing Guide

### Prerequisites
1. Backend API is running
2. User is logged in with admin permissions
3. At least one programme exists in the system

## 📋 Test Scenarios

### Scenario 1: Create a New Specialization

**Steps:**
1. Navigate to `/admin/structure/specializations`
2. Click "Create Specialization" button
3. Fill in the form:
   - Code: `IA-2026`
   - Name: `Intelligence Artificielle`
   - Description: `Spécialisation en IA et Machine Learning`
   - Programme: Select an existing programme
   - Available From Level: `3` (L3)
   - Capacity: `30`
   - Min Average Required: `12.00`
   - Application Start Date: `2026-01-01`
   - Application End Date: `2026-03-31`
   - Type: `Obligatoire`
   - Selection Mode: `Exclusive`
   - Active: `Yes`
4. Click "Save"

**Expected Result:**
- ✅ Specialization is created
- ✅ Success message appears
- ✅ New specialization appears in the list
- ✅ All fields are correctly displayed

---

### Scenario 2: Edit Existing Specialization

**Steps:**
1. In the specializations list, find the specialization created above
2. Click the edit icon (pencil)
3. Modify some fields:
   - Capacity: Change to `40`
   - Min Average Required: Change to `13.00`
4. Click "Save"

**Expected Result:**
- ✅ Specialization is updated
- ✅ Changes are reflected in the list
- ✅ No data loss on other fields

---

### Scenario 3: View Candidates (Empty State)

**Steps:**
1. Click the eye icon on a specialization with 0 candidates
2. View the candidates dialog

**Expected Result:**
- ✅ Dialog opens
- ✅ Message: "No candidates yet for this specialization"
- ✅ No errors in console

---

### Scenario 4: Delete Specialization

**Steps:**
1. Click the delete icon (trash) on a specialization
2. Read the confirmation dialog
3. Click "Delete"

**Expected Result:**
- ✅ Confirmation dialog appears
- ✅ Warning message if candidates exist
- ✅ Specialization is deleted
- ✅ List is refreshed

---

### Scenario 5: Create Multiple Specializations

**Steps:**
1. Create 3 specializations for the same programme:
   - `IA-2026` - Intelligence Artificielle
   - `CYBER-2026` - Cybersécurité
   - `DEV-2026` - Développement Web

**Expected Result:**
- ✅ All 3 specializations are created
- ✅ They appear in the list
- ✅ Each has correct programme association

---

### Scenario 6: Test Capacity Display

**Steps:**
1. Create a specialization with capacity = 20
2. View the list
3. Check the "Places" column

**Expected Result:**
- ✅ Shows "20/20" (available/total)
- ✅ Or "Unlimited" if no capacity set

---

### Scenario 7: Test Status Chips

**Steps:**
1. Create an active specialization
2. Create an inactive specialization (uncheck "Active")
3. View the list

**Expected Result:**
- ✅ Active shows green "Active" chip
- ✅ Inactive shows gray "Inactive" chip

---

### Scenario 8: Test Type and Mode Chips

**Steps:**
1. Create specializations with different types and modes:
   - Obligatoire + Exclusive
   - Optionnelle + Multiple
2. View the list

**Expected Result:**
- ✅ Type chips show correct colors (Obligatoire=red, Optionnelle=blue)
- ✅ Mode chips show correct colors (Exclusive=orange, Multiple=green)

---

## 🔍 API Testing

### Test API Endpoints Directly

```bash
# Get all specializations
curl -X GET http://localhost:8000/api/admin/specializations \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create specialization
curl -X POST http://localhost:8000/api/admin/specializations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TEST-2026",
    "name": "Test Specialization",
    "programme_id": 1,
    "available_from_level": 3,
    "type": "Obligatoire",
    "selection_mode": "Exclusive",
    "is_active": true
  }'

# Get specialization details
curl -X GET http://localhost:8000/api/admin/specializations/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update specialization
curl -X PUT http://localhost:8000/api/admin/specializations/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TEST-2026-UPDATED",
    "name": "Test Specialization Updated",
    "programme_id": 1,
    "available_from_level": 3,
    "type": "Optionnelle",
    "selection_mode": "Multiple",
    "is_active": true
  }'

# Delete specialization
curl -X DELETE http://localhost:8000/api/admin/specializations/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to fetch specializations"
**Cause**: Backend API not running or wrong URL
**Solution**: 
- Check backend is running
- Verify API_URL in `.env`
- Check network tab in browser DevTools

### Issue 2: "Programme is required" error
**Cause**: No programmes exist in the system
**Solution**: Create at least one programme first

### Issue 3: Form validation errors
**Cause**: Missing required fields
**Solution**: Ensure all required fields are filled:
- Code
- Name
- Programme
- Available From Level
- Type
- Selection Mode

### Issue 4: Candidates dialog not loading
**Cause**: API endpoint not implemented or wrong ID
**Solution**: 
- Check backend route exists
- Verify specialization ID is correct
- Check console for errors

---

## ✅ Validation Checklist

### Form Validation
- [ ] Code is required
- [ ] Name is required
- [ ] Programme is required
- [ ] Level must be >= 1
- [ ] Capacity must be positive number (if provided)
- [ ] Min average must be valid number (if provided)
- [ ] Application dates are valid dates
- [ ] Type is required (Obligatoire/Optionnelle)
- [ ] Selection mode is required (Exclusive/Multiple)

### Business Logic
- [ ] Cannot delete specialization with accepted candidates (should warn)
- [ ] Capacity limit is enforced during assignment
- [ ] Application period is respected
- [ ] Min average requirement is checked
- [ ] Exclusive mode prevents multiple selections
- [ ] Multiple mode allows multiple selections

### UI/UX
- [ ] Loading states show during API calls
- [ ] Error messages are user-friendly
- [ ] Success messages appear after actions
- [ ] Dialogs close after successful operations
- [ ] List refreshes after CRUD operations
- [ ] Responsive design works on mobile

---

## 📊 Test Data Examples

### Example 1: Computer Science Specializations
```json
[
  {
    "code": "IA-2026",
    "name": "Intelligence Artificielle",
    "programme_id": 1,
    "available_from_level": 3,
    "capacity": 30,
    "min_average_required": 12.0,
    "type": "Obligatoire",
    "selection_mode": "Exclusive"
  },
  {
    "code": "CYBER-2026",
    "name": "Cybersécurité",
    "programme_id": 1,
    "available_from_level": 3,
    "capacity": 25,
    "min_average_required": 13.0,
    "type": "Obligatoire",
    "selection_mode": "Exclusive"
  },
  {
    "code": "DEV-2026",
    "name": "Développement Web",
    "programme_id": 1,
    "available_from_level": 3,
    "capacity": 35,
    "min_average_required": 11.0,
    "type": "Optionnelle",
    "selection_mode": "Multiple"
  }
]
```

---

## 🎯 Performance Testing

### Load Testing
- [ ] Create 50+ specializations
- [ ] Check list rendering performance
- [ ] Test search/filter functionality
- [ ] Verify pagination (if implemented)

### Stress Testing
- [ ] Rapid create/delete operations
- [ ] Multiple concurrent users
- [ ] Large candidate lists (100+)

---

## 📝 Test Report Template

```markdown
## Test Report - Specializations Management

**Date**: [Date]
**Tester**: [Name]
**Environment**: [Dev/Staging/Prod]

### Test Results

| Scenario | Status | Notes |
|----------|--------|-------|
| Create Specialization | ✅/❌ | |
| Edit Specialization | ✅/❌ | |
| Delete Specialization | ✅/❌ | |
| View Candidates | ✅/❌ | |
| Assign Students | ✅/❌ | |
| Promote Waitlist | ✅/❌ | |

### Issues Found
1. [Issue description]
2. [Issue description]

### Recommendations
1. [Recommendation]
2. [Recommendation]
```

---

**Happy Testing! 🚀**
