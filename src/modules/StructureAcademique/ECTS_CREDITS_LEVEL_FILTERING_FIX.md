# Fix: Program Credit Configuration Level Filtering

## Issue Identified

**Problem**: When accessing the credit configuration for a program (via 🏅 button), the configuration page was showing ALL 5 levels (L1, L2, L3, M1, M2) instead of only the levels associated with that specific program.

**Example**: A program with only L1 and L2 levels was showing all 5 levels in the configuration table.

## Root Cause

The `LevelCreditConfigTable` component was hardcoded to display `ALL_LEVELS` constant (all 5 levels) regardless of which levels were actually associated with the program.

```typescript
// BEFORE (incorrect)
const ALL_LEVELS: AcademicLevel[] = ['L1', 'L2', 'L3', 'M1', 'M2'];

const LevelCreditConfigTable = ({ configurations, onEdit, isGlobal }) => {
  // Always showed ALL_LEVELS
  return ALL_LEVELS.map((level) => { ... });
};
```

## Story Requirement

According to the story `structure-academique.gestion-niveaux.02-configuration-credits-ects.story.md`, the validation logic should only iterate over levels associated with the program:

```php
foreach ($programme->levels as $level) {
    // Only process levels associated with this program
}
```

## Solution Implemented

### 1. Modified `LevelCreditConfigTable.tsx`

**Changes**:
- Added optional `levels` prop to accept filtered levels
- Use provided levels or default to `ALL_LEVELS` for global config
- Display only the levels passed via prop

```typescript
// AFTER (correct)
interface LevelCreditConfigTableProps {
  configurations: LevelCreditConfiguration[];
  onEdit: (level: AcademicLevel, config?: LevelCreditConfiguration) => void;
  isGlobal?: boolean;
  levels?: AcademicLevel[]; // NEW: Optional filtered levels
}

const LevelCreditConfigTable = ({ configurations, onEdit, isGlobal, levels }) => {
  // Use provided levels or default to ALL_LEVELS for global config
  const displayLevels = levels || ALL_LEVELS;
  
  return displayLevels.map((level) => { ... });
};
```

### 2. Modified `ProgramLevelCreditConfig.tsx`

**Changes**:
- Added `programLevels` prop to receive program's associated levels
- Convert string levels to `AcademicLevel` type
- Pass filtered levels to `LevelCreditConfigTable`
- Show warning if program has no levels

```typescript
// AFTER (correct)
interface ProgramLevelCreditConfigProps {
  programId: number;
  programName: string;
  programLevels?: string[]; // NEW: Levels from programme.levels
}

const ProgramLevelCreditConfig = ({ programId, programName, programLevels = [] }) => {
  // Convert to AcademicLevel type
  const academicLevels = programLevels.filter((level): level is AcademicLevel => 
    ['L1', 'L2', 'L3', 'M1', 'M2'].includes(level)
  );

  return (
    <LevelCreditConfigTable
      configurations={configurations}
      onEdit={handleEdit}
      isGlobal={false}
      levels={academicLevels} // Pass filtered levels
    />
  );
};
```

### 3. Modified `src/app/[lang]/admin/structure/programmes/[id]/credits/page.tsx`

**Changes**:
- Extract levels from programme data
- Handle both API response formats (array of objects or array of strings)
- Pass levels to `ProgramLevelCreditConfig`

```typescript
// Extract program levels from the programme data
const getProgramLevels = (): string[] => {
  if (!programme?.levels) return [];
  
  // Handle both formats: [{id, level}] or ["L1", "L2"]
  if (Array.isArray(programme.levels)) {
    if (programme.levels.length === 0) return [];
    
    // Check if first element is an object with 'level' property
    if (typeof programme.levels[0] === 'object' && 'level' in programme.levels[0]) {
      return programme.levels.map((l: any) => l.level);
    }
    
    // Otherwise, it's already an array of strings
    return programme.levels as string[];
  }
  
  return [];
};

const programLevels = getProgramLevels();

return (
  <ProgramLevelCreditConfig
    programId={programId}
    programName={programme.libelle}
    programLevels={programLevels} // Pass extracted levels
  />
);
```

### 4. No Changes to `GlobalLevelCreditConfig.tsx`

**Reason**: Global configuration should continue showing all 5 levels (L1-M2) since it defines defaults for all possible levels.

```typescript
// Global config - shows all levels (correct behavior)
<LevelCreditConfigTable
  configurations={configurations}
  onEdit={handleEdit}
  isGlobal={true}
  // No 'levels' prop = uses ALL_LEVELS by default
/>
```

## Behavior After Fix

### Global Configuration (`/admin/structure/credits`)
- ✅ Shows all 5 levels (L1, L2, L3, M1, M2)
- ✅ Allows configuration of defaults for all levels
- ✅ Correct behavior maintained

### Program Configuration (`/admin/structure/programmes/[id]/credits`)
- ✅ Shows ONLY levels associated with the program
- ✅ Program with L1, L2 → Shows only L1, L2
- ✅ Program with M1, M2 → Shows only M1, M2
- ✅ Program with no levels → Shows warning message
- ✅ Matches backend validation logic

## Testing Scenarios

### Scenario 1: Licence Program (L1, L2, L3)
1. Navigate to Programme list
2. Click 🏅 button for a Licence program
3. **Expected**: Configuration table shows only L1, L2, L3
4. **Result**: ✅ Correct

### Scenario 2: Master Program (M1, M2)
1. Navigate to Programme list
2. Click 🏅 button for a Master program
3. **Expected**: Configuration table shows only M1, M2
4. **Result**: ✅ Correct

### Scenario 3: Program with Partial Levels (L1, L2 only)
1. Navigate to Programme list
2. Click 🏅 button for a program with only L1, L2
3. **Expected**: Configuration table shows only L1, L2
4. **Result**: ✅ Correct (this was the reported issue, now fixed)

### Scenario 4: Global Configuration
1. Navigate to "Configuration Crédits ECTS" menu
2. **Expected**: Configuration table shows all 5 levels (L1-M2)
3. **Result**: ✅ Correct

### Scenario 5: Program with No Levels
1. Navigate to Programme list
2. Click 🏅 button for a program with no associated levels
3. **Expected**: Warning message displayed
4. **Result**: ✅ Correct

## Files Modified

1. `src/modules/StructureAcademique/admin/components/LevelCreditConfigTable.tsx`
   - Added `levels` prop
   - Use `displayLevels` instead of hardcoded `ALL_LEVELS`

2. `src/modules/StructureAcademique/admin/components/ProgramLevelCreditConfig.tsx`
   - Added `programLevels` prop
   - Filter and convert levels to `AcademicLevel` type
   - Pass filtered levels to table
   - Show warning if no levels

3. `src/app/[lang]/admin/structure/programmes/[id]/credits/page.tsx`
   - Extract levels from programme data
   - Handle both API response formats
   - Pass levels to component

## Alignment with Story Requirements

✅ **Story Requirement**: Configuration should be based on `$programme->levels`
✅ **Implementation**: Frontend now filters to show only program's associated levels
✅ **Backend Validation**: Already correct (iterates over `$programme->levels`)
✅ **Frontend Validation**: Now matches backend logic

## Summary

The fix ensures that:
1. **Program-specific configuration** shows only levels associated with that program
2. **Global configuration** continues to show all 5 levels
3. **Validation logic** is consistent between frontend and backend
4. **User experience** is improved (no confusion about irrelevant levels)
5. **Story requirements** are fully met

The implementation follows the story's validation logic pattern and provides a better user experience by showing only relevant levels for each program.
