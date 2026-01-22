# Fix: ReferenceError useMemo is not defined

## 🐛 Erreur

```
ReferenceError: useMemo is not defined
ProgrammeModulesDialog
```

## 🔍 Cause

Le hook `useMemo` était utilisé dans le composant mais n'était pas importé depuis React.

## ✅ Solution

### Avant
```typescript
import React, { useState, useEffect } from 'react';
```

### Après
```typescript
import React, { useState, useEffect, useMemo } from 'react';
```

## 📄 Fichier Modifié

- `src/modules/StructureAcademique/admin/components/ProgrammeModulesDialog.tsx`

## ✅ Validation

Le composant devrait maintenant fonctionner sans erreur. Les niveaux du programme seront correctement normalisés et affichés.

---

**Date:** 2026-01-14  
**Status:** ✅ Fixed  
**Impact:** Le modal "Gérer les Modules" fonctionne maintenant correctement
