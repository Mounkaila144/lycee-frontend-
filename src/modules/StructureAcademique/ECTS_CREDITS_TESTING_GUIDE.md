# Testing Guide: ECTS Credits Level Filtering Fix

## What Was Fixed

The program credit configuration now correctly shows **only the levels associated with that specific program** instead of showing all 5 levels (L1-M2).

## How to Test in Browser

### Test 1: Program with L1, L2 Only

1. **Navigate to Programmes**
   - Click on "Programmes" menu in the sidebar

2. **Find a Licence Program with L1, L2**
   - Look for a program that has only L1 and L2 levels
   - You can see the levels in the "Niveaux" column (badges)

3. **Click the 🏅 Button**
   - Click the medal icon (🏅) in the Actions column
   - This opens the credit configuration for that program

4. **Verify the Configuration Table**
   - ✅ **Expected**: Table shows ONLY 2 rows (Licence 1, Licence 2)
   - ❌ **Before Fix**: Table showed 5 rows (L1, L2, L3, M1, M2)

5. **Check the Info Message**
   - Should say: "Ce programme a 2 niveau(x) associé(s)."

### Test 2: Master Program with M1, M2

1. **Find a Master Program**
   - Look for a program of type "Master"
   - Should have M1 and M2 levels

2. **Click the 🏅 Button**

3. **Verify the Configuration Table**
   - ✅ **Expected**: Table shows ONLY 2 rows (Master 1, Master 2)
   - ❌ **Before Fix**: Table showed 5 rows (L1, L2, L3, M1, M2)

### Test 3: Licence Program with All Levels (L1, L2, L3)

1. **Find a Complete Licence Program**
   - Look for a Licence program with all 3 levels

2. **Click the 🏅 Button**

3. **Verify the Configuration Table**
   - ✅ **Expected**: Table shows 3 rows (Licence 1, Licence 2, Licence 3)

### Test 4: Global Configuration (Should Show All Levels)

1. **Navigate to Global Configuration**
   - Click on "Configuration Crédits ECTS" menu (🏅 icon)
   - Or navigate to: `/[lang]/admin/structure/credits`

2. **Verify the Configuration Table**
   - ✅ **Expected**: Table shows ALL 5 rows (L1, L2, L3, M1, M2)
   - This is correct behavior for global configuration

### Test 5: Program with No Levels

1. **Find a Program with No Associated Levels**
   - Look for a newly created program that hasn't been configured yet

2. **Click the 🏅 Button**

3. **Verify Warning Message**
   - ✅ **Expected**: Warning message displayed
   - Message: "Ce programme n'a aucun niveau associé. Veuillez d'abord associer des niveaux au programme."
   - No configuration table shown

## Visual Comparison

### Before Fix (Incorrect)
```
Program: "Licence Informatique" (has L1, L2 only)
Configuration Table:
┌─────────────┬──────────────┬──────────────┬──────────────┐
│ Niveau      │ Semestre 1   │ Semestre 2   │ Total Annuel │
├─────────────┼──────────────┼──────────────┼──────────────┤
│ Licence 1   │ 30 crédits   │ 30 crédits   │ 60 crédits   │
│ Licence 2   │ 30 crédits   │ 30 crédits   │ 60 crédits   │
│ Licence 3   │ 30 crédits   │ 30 crédits   │ 60 crédits   │ ❌ Should not show
│ Master 1    │ 30 crédits   │ 30 crédits   │ 60 crédits   │ ❌ Should not show
│ Master 2    │ 30 crédits   │ 30 crédits   │ 60 crédits   │ ❌ Should not show
└─────────────┴──────────────┴──────────────┴──────────────┘
```

### After Fix (Correct)
```
Program: "Licence Informatique" (has L1, L2 only)
Configuration Table:
┌─────────────┬──────────────┬──────────────┬──────────────┐
│ Niveau      │ Semestre 1   │ Semestre 2   │ Total Annuel │
├─────────────┼──────────────┼──────────────┼──────────────┤
│ Licence 1   │ 30 crédits   │ 30 crédits   │ 60 crédits   │ ✅
│ Licence 2   │ 30 crédits   │ 30 crédits   │ 60 crédits   │ ✅
└─────────────┴──────────────┴──────────────┴──────────────┘
```

## Testing the Configuration Functionality

After verifying the correct levels are shown, test the configuration:

### 1. Configure Credits for a Level

1. Click the **Edit** icon (pencil) or **Add** icon (plus) for a level
2. Dialog opens: "Configuration Programme - L1"
3. Modify the credits:
   - Semestre 1: 35 crédits
   - Semestre 2: 25 crédits
4. Click "Enregistrer"
5. ✅ **Verify**: Table updates with new values
6. ✅ **Verify**: "Équilibre" column shows "Déséquilibré" (difference > 10)

### 2. Test Validation Tab

1. Click on "Validation de la Maquette" tab
2. Click "Actualiser" button
3. ✅ **Verify**: Validation report shows only the program's levels
4. ✅ **Verify**: Each level shows:
   - Crédits configurés
   - Crédits modules
   - Écart (gap)
   - Statut (OK/KO)

### 3. Test Default Values

1. For a level without custom configuration
2. ✅ **Verify**: Shows "(Valeurs par défaut)" under the level name
3. ✅ **Verify**: Uses 30+30 = 60 crédits by default

## Expected Behavior Summary

| Context | Levels Shown | Reason |
|---------|--------------|--------|
| Global Config | All 5 (L1-M2) | Defines defaults for all possible levels |
| Program with L1, L2 | Only L1, L2 | Shows only associated levels |
| Program with M1, M2 | Only M1, M2 | Shows only associated levels |
| Program with L1, L2, L3 | Only L1, L2, L3 | Shows only associated levels |
| Program with no levels | Warning message | Cannot configure without levels |

## Troubleshooting

### Issue: Still seeing all 5 levels for a program

**Solution**: 
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Restart dev server: `pnpm dev`
3. Delete `.next` folder and restart

### Issue: Program levels not loading

**Solution**:
1. Check browser console for errors
2. Verify the program has levels associated in the database
3. Check API response in Network tab (should include `levels` array)

### Issue: TypeScript errors

**Solution**:
1. Run: `pnpm build` to check for type errors
2. All errors should be resolved in the fix

## Success Criteria

✅ Program credit configuration shows only program's associated levels
✅ Global configuration shows all 5 levels
✅ Validation report shows only program's levels
✅ Warning shown for programs with no levels
✅ Configuration and validation work correctly
✅ No TypeScript errors
✅ Matches backend validation logic from story

## Next Steps After Testing

If all tests pass:
1. ✅ Mark the issue as resolved
2. ✅ Continue with other development tasks
3. ✅ Story remains "Ready for Review" status

If issues found:
1. Report specific test case that failed
2. Provide browser console errors if any
3. Share screenshot of unexpected behavior
