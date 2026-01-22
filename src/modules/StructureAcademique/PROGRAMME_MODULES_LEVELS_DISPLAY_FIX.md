# Fix: Affichage des Niveaux dans ProgrammeModulesDialog

## 🐛 Problème

### Symptôme
Dans le modal "Gérer les Modules", le message d'erreur affiche:
```
Aucun module compatible trouvé.
Ce programme nécessite des modules de niveau , , .
Les modules existants ne correspondent pas à ces niveaux.
Créez des modules pour les niveaux , , ou vérifiez les associations existantes.
```

**Les niveaux sont vides!** Au lieu de `L1, L2, L3`.

---

## 🔍 Analyse

### Données API
```json
// GET /api/admin/programmes/1
{
  "data": {
    "id": 1,
    "code": "test",
    "type": "Licence",
    "levels": ["L1", "L2", "L3"]  // ✅ Array de strings
  }
}
```

### Code Problématique (Avant)
```typescript
// ProgrammeModulesDialog.tsx
const programmeLevels = programme?.levels?.map(l => l.level) || [];
//                                                   ^^^^^^
//                                                   Essaie d'accéder à .level
//                                                   mais levels est déjà string[]
```

**Erreur:** Le code suppose que `levels` est un array d'objets `[{level: "L1"}]`, mais l'API retourne un array de strings `["L1", "L2", "L3"]`.

---

## ✅ Solution

### Type Programme
Le type `Programme` définit `levels` comme pouvant être **deux formats différents**:

```typescript
// src/modules/StructureAcademique/types/programme.types.ts
export interface Programme {
  // ...
  levels?: Array<{
    id: number;
    level: string;
  }> | string[];  // ✅ Peut être string[] OU object[]
}
```

### Fix Implémenté
```typescript
// ProgrammeModulesDialog.tsx
const programmeLevels = useMemo(() => {
  if (!programme?.levels) return [];
  
  // Si c'est déjà un array de strings
  if (typeof programme.levels[0] === 'string') {
    return programme.levels as string[];
  }
  
  // Si c'est un array d'objets avec propriété level
  return (programme.levels as Array<{ level: string }>).map(l => l.level);
}, [programme?.levels]);
```

**Explication:**
1. Vérifier si `levels` existe
2. Vérifier le type du premier élément
3. Si c'est une string → retourner directement
4. Si c'est un objet → extraire la propriété `level`

---

## 🧪 Test

### Avant le Fix
```typescript
programme.levels = ["L1", "L2", "L3"]
programmeLevels = [undefined, undefined, undefined]  // ❌
// Parce que "L1".level === undefined
```

### Après le Fix
```typescript
programme.levels = ["L1", "L2", "L3"]
programmeLevels = ["L1", "L2", "L3"]  // ✅
```

---

## 📋 Endpoints API et Formats

### Format 1: Array de Strings (GET /programmes/{id})
```json
{
  "levels": ["L1", "L2", "L3"]
}
```

### Format 2: Array d'Objets (GET /programmes/{id}/levels)
```json
{
  "data": [
    {"id": 1, "program_id": 1, "level": "L1"},
    {"id": 2, "program_id": 1, "level": "L2"},
    {"id": 3, "program_id": 1, "level": "L3"}
  ]
}
```

**Le composant doit gérer les deux formats!**

---

## 🎯 Résultat

### Avant
```
Ce programme nécessite des modules de niveau , , .
```

### Après
```
Ce programme nécessite des modules de niveau L1, L2, L3.
```

---

## 📝 Fichiers Modifiés

- `src/modules/StructureAcademique/admin/components/ProgrammeModulesDialog.tsx`
  - Ajout de `useMemo` pour normaliser les niveaux
  - Gestion des deux formats (string[] et object[])

---

## 🔄 Pattern Réutilisable

Ce pattern peut être utilisé partout où on manipule `programme.levels`:

```typescript
// Helper function (à ajouter dans types/programme.types.ts si besoin)
export const normalizeProgrammeLevels = (
  levels?: Array<{ level: string }> | string[]
): string[] => {
  if (!levels || levels.length === 0) return [];
  
  if (typeof levels[0] === 'string') {
    return levels as string[];
  }
  
  return (levels as Array<{ level: string }>).map(l => l.level);
};

// Usage
const programmeLevels = normalizeProgrammeLevels(programme?.levels);
```

---

## ✅ Validation

### Test Manuel
1. Créer un programme Licence avec niveaux L1, L2, L3
2. Créer un module L1
3. Ouvrir "Gérer les Modules"
4. Vérifier que le message affiche: `"Ce programme nécessite des modules de niveau L1, L2, L3"`

### Test avec Module Compatible
1. Le module L1 doit apparaître dans la liste
2. Pouvoir le sélectionner
3. Sauvegarder → succès

---

**Date:** 2026-01-14  
**Status:** ✅ Fixed  
**Impact:** Affichage correct des niveaux dans tous les messages
