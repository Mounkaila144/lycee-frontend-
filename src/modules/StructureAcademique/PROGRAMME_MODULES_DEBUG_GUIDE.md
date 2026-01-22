# Guide de Débogage - Association Programme ↔ Module

## 🐛 Problèmes Identifiés et Corrigés

### 1. ✅ Niveaux Vides dans le Message d'Erreur

**Symptôme:**
```
Ce programme nécessite des modules de niveau , , .
```

**Cause:** `programme.levels` est un `string[]` mais le code essayait d'accéder à `.level`

**Fix:** Normalisation des niveaux dans `ProgrammeModulesDialog.tsx`
```typescript
const programmeLevels = useMemo(() => {
  if (!programme?.levels) return [];
  
  // Si c'est déjà un array de strings
  if (typeof programme.levels[0] === 'string') {
    return programme.levels as string[];
  }
  
  // Si c'est un array d'objets
  return (programme.levels as Array<{ level: string }>).map(l => l.level);
}, [programme?.levels]);
```

---

### 2. 🔍 Module Compatible Non Affiché

**Situation Actuelle:**
- Programme: Licence avec niveaux `["L1", "L2", "L3"]`
- Module: "Photoshop" niveau `"L1"`
- **Résultat:** Module devrait apparaître mais message "Aucun module compatible"

**Logs de Debug Ajoutés:**
```typescript
console.log('🔍 ProgrammeModuleSelector - Debug:', {
  programmeLevels,
  availableModulesCount,
  availableModules
});
```

---

## 🧪 Comment Débugger

### Étape 1: Ouvrir la Console du Navigateur
1. Ouvrir DevTools (F12)
2. Aller dans l'onglet "Console"
3. Ouvrir le modal "Gérer les Modules"

### Étape 2: Vérifier les Logs
Vous devriez voir:
```
🔍 ProgrammeModulesDialog - programmeLevels: ["L1", "L2", "L3"]
🔍 ProgrammeModuleSelector - Debug: {
  programmeLevels: ["L1", "L2", "L3"],
  availableModulesCount: 1,
  availableModules: [{id: 1, code: "Photoshop", level: "L1"}]
}
  Module Photoshop (L1): ✅ Inclus
  Résultat filtrage: 1 modules
```

### Étape 3: Identifier le Problème

#### Cas 1: programmeLevels est vide `[]`
**Problème:** Le programme n'a pas de niveaux associés
**Solution:** Associer des niveaux au programme d'abord

#### Cas 2: availableModules est vide `[]`
**Problème:** Aucun module n'existe dans la base
**Solution:** Créer des modules

#### Cas 3: Module exclu `❌ Exclu`
**Problème:** Le niveau du module ne correspond pas
**Vérifier:**
- `module.level` est bien une string ("L1", "L2", etc.)
- `programmeLevels` contient bien ce niveau
- Pas de problème de casse (L1 vs l1)

#### Cas 4: Tout semble correct mais rien ne s'affiche
**Problème possible:** Erreur dans `groupModulesByLevel`
**Vérifier:** La fonction de groupement dans `programmeModule.types.ts`

---

## 📊 Données API à Vérifier

### 1. GET /api/admin/programmes/{id}
```json
{
  "data": {
    "id": 1,
    "levels": ["L1", "L2", "L3"]  // ✅ Doit être un array
  }
}
```

### 2. GET /api/admin/modules?per_page=1000
```json
{
  "data": [{
    "id": 1,
    "code": "Photoshop",
    "level": "L1",  // ✅ Doit être une string
    "programmes": []  // Peut être vide si pas encore associé
  }]
}
```

### 3. GET /api/admin/programmes/{id}/modules
```json
{
  "data": []  // Vide si aucun module associé
}
```

---

## 🔧 Checklist de Vérification

### Backend
- [ ] L'endpoint `/api/admin/modules` retourne tous les modules
- [ ] Le champ `level` est bien une string ("L1", "L2", etc.)
- [ ] Le champ `programmes` existe (peut être vide)
- [ ] Pas d'erreur 500 dans les requêtes API

### Frontend
- [ ] `programme.levels` est bien un array (pas null/undefined)
- [ ] `availableModules` contient des modules
- [ ] Les niveaux sont correctement normalisés (string[])
- [ ] Le filtrage fonctionne (vérifier les logs console)

### Données
- [ ] Le programme a au moins un niveau associé
- [ ] Il existe au moins un module avec un niveau correspondant
- [ ] Les niveaux utilisent la même casse (L1, pas l1)

---

## 🎯 Scénarios de Test

### Test 1: Programme Licence + Module L1
```typescript
// Données
Programme: { type: "Licence", levels: ["L1", "L2", "L3"] }
Module: { code: "Photoshop", level: "L1" }

// Résultat attendu
✅ Module apparaît dans la liste
✅ Peut être sélectionné
✅ Sauvegarde réussit
```

### Test 2: Programme Master + Module L1
```typescript
// Données
Programme: { type: "Master", levels: ["M1", "M2"] }
Module: { code: "Photoshop", level: "L1" }

// Résultat attendu
❌ Module n'apparaît PAS (niveau incompatible)
⚠️ Message: "Aucun module compatible trouvé"
```

### Test 3: Programme sans Niveaux
```typescript
// Données
Programme: { type: "Licence", levels: [] }
Module: { code: "Photoshop", level: "L1" }

// Résultat attendu
⚠️ Message: "Veuillez d'abord associer des niveaux à ce programme"
```

### Test 4: Aucun Module Existant
```typescript
// Données
Programme: { type: "Licence", levels: ["L1", "L2", "L3"] }
Modules: []

// Résultat attendu
ℹ️ Message: "Aucun module disponible pour les niveaux de ce programme"
```

---

## 🚀 Prochaines Étapes

### Si le Module Apparaît Maintenant ✅
1. Retirer les `console.log` de debug
2. Tester l'association (sélectionner + sauvegarder)
3. Vérifier que l'association est bien créée dans la BD
4. Vérifier que le module apparaît dans la liste après refresh

### Si le Problème Persiste ❌
1. Copier les logs de la console
2. Vérifier les réponses API dans l'onglet Network
3. Vérifier la structure des données retournées
4. Comparer avec les exemples ci-dessus

---

## 📝 Logs à Fournir en Cas de Problème

```javascript
// Dans la console du navigateur
console.log('=== DEBUG PROGRAMME MODULES ===');
console.log('Programme:', programme);
console.log('Programme Levels:', programme?.levels);
console.log('Available Modules:', availableModules);
console.log('Filtered Modules:', filteredModules);
console.log('Selected Module IDs:', selectedModuleIds);
```

---

## 🔄 Retirer les Logs de Debug

Une fois le problème résolu, retirer les `console.log` dans:
- `ProgrammeModulesDialog.tsx`
- `ProgrammeModuleSelector.tsx`

```typescript
// Retirer ces lignes:
console.log('🔍 ProgrammeModuleSelector - Debug:', ...);
console.log(`  Module ${module.code} (${module.level}): ...`);
console.log('  Résultat filtrage:', ...);
```

---

**Date:** 2026-01-14  
**Status:** 🔍 En cours de débogage  
**Prochaine étape:** Vérifier les logs dans la console du navigateur
