# Fix: Import TenantContext, Mot Réservé 'eval' & URLs API

## 🐛 Problème 1: Import TenantContext

Erreur lors du build Next.js:
```
Module not found: Can't resolve '@/shared/contexts/TenantContext'
```

### 🔍 Cause
Mauvais chemin d'import pour `useTenant`. Le hook se trouve dans `@/shared/lib/tenant-context` et non `@/shared/contexts/TenantContext`.

### ✅ Solution

#### Fichier Corrigé
- `src/modules/StructureAcademique/admin/hooks/useEvaluationConfig.ts`

#### Changement
```typescript
// ❌ AVANT (incorrect)
import { useTenant } from '@/shared/contexts/TenantContext'

// ✅ APRÈS (correct)
import { useTenant } from '@/shared/lib/tenant-context'
```

---

## 🐛 Problème 2: Mot Réservé 'eval'

Erreur runtime:
```
SyntaxError: Unexpected eval or arguments in strict mode
```

### 🔍 Cause
Utilisation de `eval` comme nom de variable dans une fonction `.map()`. `eval` est un mot réservé en JavaScript et ne peut pas être utilisé comme nom de variable en mode strict.

### ✅ Solution

#### Fichier Corrigé
- `src/modules/StructureAcademique/admin/components/TemplateSelector.tsx`

#### Changement
```typescript
// ❌ AVANT (incorrect - eval est un mot réservé)
{template.config_json.evaluations.map((eval, index) => (
  <Box key={index}>
    <Typography>{eval.name}</Typography>
    <Chip label={eval.type} />
    <Typography>{eval.coefficient}%</Typography>
  </Box>
))}

// ✅ APRÈS (correct - utilisation de 'evaluation')
{template.config_json.evaluations.map((evaluation, index) => (
  <Box key={index}>
    <Typography>{evaluation.name}</Typography>
    <Chip label={evaluation.type} />
    <Typography>{evaluation.coefficient}%</Typography>
  </Box>
))}
```

---

## 🐛 Problème 3: URLs API Incorrectes

Erreur 404 lors des appels API:
```
❌ URL incorrecte : /api/admin/modules/1/evaluation-config/1
✅ URL correcte : /api/admin/modules/1/semesters/1/evaluation-config
```

### 🔍 Cause
Les URLs implémentées ne correspondaient pas à la structure des routes backend. Le backend utilise `/modules/{id}/semesters/{semesterId}/evaluation-config` au lieu de `/modules/{id}/evaluation-config/{semesterId}`.

### ✅ Solution

#### Fichier Corrigé
- `src/modules/StructureAcademique/admin/services/evaluationConfigService.ts`

#### Changements

**GET Configurations:**
```typescript
// ❌ AVANT
`/admin/modules/${moduleId}/evaluation-config/${semesterId}`

// ✅ APRÈS
`/admin/modules/${moduleId}/semesters/${semesterId}/evaluation-config`
```

**POST Create Configuration:**
```typescript
// ❌ AVANT
`/admin/modules/${moduleId}/evaluation-config/${semesterId}`

// ✅ APRÈS
`/admin/modules/${moduleId}/semesters/${semesterId}/evaluation-config`
```

**POST Apply Template:**
```typescript
// ❌ AVANT
`/admin/modules/${moduleId}/apply-template/${templateId}`
// avec body: { semester_id: semesterId }

// ✅ APRÈS
`/admin/modules/${moduleId}/semesters/${semesterId}/apply-template/${templateId}`
// sans body semester_id (déjà dans l'URL)
```

**POST Validate:**
```typescript
// ❌ AVANT
`/admin/modules/${moduleId}/evaluation-config/validate`
// avec body: { semester_id: semesterId }

// ✅ APRÈS
`/admin/modules/${moduleId}/semesters/${semesterId}/evaluation-config/validate`
// sans body semester_id
```

**POST Publish:**
```typescript
// ❌ AVANT
`/admin/modules/${moduleId}/evaluation-config/publish`
// avec body: { semester_id: semesterId }

// ✅ APRÈS
`/admin/modules/${moduleId}/semesters/${semesterId}/evaluation-config/publish`
// sans body semester_id
```

**PUT/DELETE (inchangés):**
```typescript
// ✅ Ces URLs restent identiques
PUT `/admin/modules/${moduleId}/evaluation-config/${configId}`
DELETE `/admin/modules/${moduleId}/evaluation-config/${configId}`
```

### 📋 URLs Finales Correctes

**Configuration des Évaluations:**
- ✅ `GET /admin/modules/{id}/semesters/{semesterId}/evaluation-config`
- ✅ `POST /admin/modules/{id}/semesters/{semesterId}/evaluation-config`
- ✅ `PUT /admin/modules/{id}/evaluation-config/{configId}`
- ✅ `DELETE /admin/modules/{id}/evaluation-config/{configId}`
- ✅ `POST /admin/modules/{id}/semesters/{semesterId}/apply-template/{templateId}`
- ✅ `POST /admin/modules/{id}/semesters/{semesterId}/evaluation-config/validate`
- ✅ `POST /admin/modules/{id}/semesters/{semesterId}/evaluation-config/publish`

**Templates (inchangés):**
- ✅ `GET /admin/evaluation-templates`
- ✅ `POST /admin/evaluation-templates`
- ✅ `PUT /admin/evaluation-templates/{id}`
- ✅ `DELETE /admin/evaluation-templates/{id}`
- ✅ `POST /admin/evaluation-templates/{id}/toggle-active`

---

## 📋 Vérification

Tous les autres hooks du module StructureAcademique utilisent déjà le bon import:
- `useModuleTeachers.ts` ✅
- `useProgrammeImportExport.ts` ✅
- `useProgrammeHistory.ts` ✅
- `useProgrammeActivation.ts` ✅
- `useProgrammeLevels.ts` ✅
- `useProgrammeModules.ts` ✅
- `useProgrammes.ts` ✅
- `useProgression.ts` ✅
- `useTeachers.ts` ✅
- `useModules.ts` ✅
- `useModulePrerequisites.ts` ✅
- `useLevelCredits.ts` ✅

## 🧪 Tests

```bash
# Vérifier qu'il n'y a plus d'erreurs
pnpm dev

# Vérifier TypeScript
pnpm type-check

# Tester les appels API
# 1. Ouvrir le dialog de configuration
# 2. Vérifier dans DevTools Network que les URLs sont correctes
# 3. Tester l'application d'un template
# 4. Tester la création d'une évaluation
```

## ✅ Statut

**RÉSOLU** - L'application compile, s'exécute et communique correctement avec le backend.

### Mots Réservés JavaScript à Éviter

Pour référence, voici les mots réservés à ne jamais utiliser comme noms de variables:
- `eval`
- `arguments`
- `await`
- `break`
- `case`
- `catch`
- `class`
- `const`
- `continue`
- `debugger`
- `default`
- `delete`
- `do`
- `else`
- `export`
- `extends`
- `finally`
- `for`
- `function`
- `if`
- `import`
- `in`
- `instanceof`
- `let`
- `new`
- `return`
- `super`
- `switch`
- `this`
- `throw`
- `try`
- `typeof`
- `var`
- `void`
- `while`
- `with`
- `yield`

---

**Date**: 2026-01-14
**Fix par**: James (dev agent)
