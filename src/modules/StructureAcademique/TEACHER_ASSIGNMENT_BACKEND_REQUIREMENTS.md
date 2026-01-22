# Teacher Assignment - Exigences Backend à Clarifier

## Problème Actuel

Lors de l'affectation d'un enseignant, le backend retourne deux erreurs :

```json
{
  "message": "Le programme est obligatoire. (and 1 more error)",
  "errors": {
    "programme_id": ["Le programme est obligatoire."],
    "semester_id": ["Le semestre sélectionné n'existe pas."]
  }
}
```

## Payload Actuellement Envoyé

```json
{
  "module_id": 1,
  "teacher_id": 5,
  "level": "L1",
  "semester_id": 1,
  "type": "CM",
  "teaching_type": "CM",
  "hours_allocated": 1,
  "hours_assigned": 1,
  "academic_year": "2025-2026"
}
```

## Problèmes Identifiés

### 1. programme_id Manquant

**Erreur** : `"Le programme est obligatoire."`

**Cause Possible** :
- Le module n'a pas de programmes associés dans `module.programs`
- Le champ `programme_id` est obligatoire dans le backend

**Questions pour le Backend** :
- ❓ Est-ce que `programme_id` doit toujours être fourni ?
- ❓ Peut-on déduire `programme_id` depuis le `module_id` ?
- ❓ Un module peut-il exister sans programme ?

**Solution Temporaire** :
Le frontend envoie `programme_id` seulement si le module a des programmes associés :

```typescript
...(module.programs && module.programs.length > 0 && {
  programme_id: module.programs[0].id
})
```

### 2. semester_id N'existe Pas

**Erreur** : `"Le semestre sélectionné n'existe pas."`

**Cause Possible** :
- Le backend attend l'ID d'un enregistrement dans une table `semesters`
- Le frontend envoie juste le numéro (1, 2, 3, etc.)
- Le format attendu n'est pas clair

**Questions pour le Backend** :
- ❓ `semester_id` fait-il référence à une table `semesters` ?
- ❓ Quel est le format attendu ? (nombre, string "S1", ID de table ?)
- ❓ Peut-on déduire `semester_id` depuis le `module_id` ?

**Solution Temporaire** :
Le frontend envoie maintenant `semester` au format string ("S1", "S2", etc.) au lieu de `semester_id` :

```typescript
semester: module.semester, // "S1", "S2", etc.
```

## Modifications Apportées

### 1. Fichier : `ModuleTeachersDialog.tsx`

**Changements** :
- ✅ Ajout de logs pour debug
- ✅ `programme_id` rendu optionnel (envoyé seulement si disponible)
- ✅ `semester_id` remplacé par `semester` (format string)
- ✅ Meilleure gestion d'erreurs avec logs détaillés

**Code** :
```typescript
const payload = {
  module_id: module.id,
  teacher_id: selectedTeacherId,
  // Programme ID - optionnel
  ...(module.programs && module.programs.length > 0 && {
    programme_id: module.programs[0].id
  }),
  level: module.level,
  semester: module.semester, // "S1", "S2", etc.
  type: selectedTeachingType,
  hours_allocated: hoursAssigned,
  academic_year: selectedYear,
};
```

### 2. Fichier : `moduleTeacher.types.ts`

**Changements** :
- ✅ `programme_id` marqué comme optionnel
- ✅ Ajout du champ `semester` (string)
- ✅ `semester_id` gardé comme optionnel pour compatibilité

**Type** :
```typescript
export interface AssignTeacherRequest {
  module_id?: number;
  teacher_id: number;
  programme_id?: number;        // Optionnel
  level?: string;
  semester?: string;             // "S1", "S2", etc.
  semester_id?: number;          // Alternative - ID table
  type: TeachingType;
  hours_allocated: number;
  academic_year: string;
}
```

## Payload Maintenant Envoyé

```json
{
  "module_id": 1,
  "teacher_id": 5,
  "level": "L1",
  "semester": "S1",
  "type": "CM",
  "teaching_type": "CM",
  "hours_allocated": 1,
  "hours_assigned": 1,
  "academic_year": "2025-2026"
}
```

**Note** : `programme_id` n'est envoyé que si le module a des programmes associés.

## Logs de Debug

Pour aider à identifier le problème, des logs ont été ajoutés :

```typescript
console.log('Module data:', {
  id: module.id,
  level: module.level,
  semester: module.semester,
  programs: module.programs
});

console.log('Payload to send:', payload);
```

**Vérifier dans la console** :
1. Ouvrir DevTools (F12) → Console
2. Affecter un enseignant
3. Vérifier les logs pour voir les données du module et le payload envoyé

## Questions à Poser au Backend

### 1. Structure de la Table `teacher_assignments`

```sql
-- Quelle est la structure exacte ?
CREATE TABLE teacher_assignments (
  id BIGINT PRIMARY KEY,
  module_id BIGINT,           -- ✅ Confirmé
  teacher_id BIGINT,          -- ✅ Confirmé
  programme_id BIGINT,        -- ❓ Obligatoire ou optionnel ?
  level VARCHAR(10),          -- ✅ Confirmé
  semester_id BIGINT,         -- ❓ Référence à quelle table ?
  type VARCHAR(10),           -- ✅ Confirmé (CM/TD/TP)
  hours_allocated DECIMAL,    -- ✅ Confirmé
  academic_year VARCHAR(20),  -- ✅ Confirmé
  ...
);
```

### 2. Table `semesters`

```sql
-- Est-ce que cette table existe ?
CREATE TABLE semesters (
  id BIGINT PRIMARY KEY,
  code VARCHAR(10),  -- "S1", "S2", etc. ?
  name VARCHAR(50),
  ...
);
```

**Si oui** :
- Fournir la liste des IDs et codes
- Le frontend devra mapper "S1" → ID correspondant

**Si non** :
- Le backend devrait accepter `semester` au format string ("S1", "S2", etc.)

### 3. Relation Module-Programme

**Questions** :
- Un module peut-il exister sans programme ?
- Si oui, `programme_id` devrait être optionnel
- Si non, pourquoi certains modules n'ont pas de programmes ?

**Suggestion** :
Le backend pourrait déduire `programme_id` depuis la relation `module_programme` :

```php
// Dans le contrôleur
$module = Module::findOrFail($request->module_id);
$programme_id = $module->programmes()->first()?->id;
```

## Solutions Recommandées

### Option 1 : Backend Déduit les Champs (RECOMMANDÉ)

Le backend déduit automatiquement certains champs depuis le `module_id` :

```php
$module = Module::findOrFail($request->module_id);

$assignment = TeacherAssignment::create([
    'module_id' => $module->id,
    'teacher_id' => $request->teacher_id,
    'programme_id' => $module->programmes()->first()?->id,  // Déduit
    'level' => $module->level,                               // Déduit
    'semester_id' => $module->semester_id,                   // Déduit
    'type' => $request->type,
    'hours_allocated' => $request->hours_allocated,
    'academic_year' => $request->academic_year,
]);
```

**Avantages** :
- ✅ Payload simplifié côté frontend
- ✅ Pas de risque d'incohérence
- ✅ Moins de validation nécessaire

**Payload simplifié** :
```json
{
  "teacher_id": 5,
  "type": "CM",
  "hours_allocated": 1,
  "academic_year": "2025-2026"
}
```

### Option 2 : Backend Accepte les Deux Formats

Le backend accepte soit `semester_id` soit `semester` :

```php
public function rules()
{
    return [
        'module_id' => 'required|exists:modules,id',
        'teacher_id' => 'required|exists:users,id',
        'programme_id' => 'nullable|exists:programmes,id',
        'level' => 'required|string',
        'semester' => 'required_without:semester_id|string',
        'semester_id' => 'required_without:semester|exists:semesters,id',
        'type' => 'required|in:CM,TD,TP',
        'hours_allocated' => 'required|numeric|min:0',
        'academic_year' => 'required|string',
    ];
}
```

### Option 3 : Frontend Mappe les Valeurs

Si le backend fournit une API pour récupérer les semestres :

```typescript
// GET /api/admin/semesters
const semesters = await semesterService.getSemesters();
// [{ id: 1, code: "S1" }, { id: 2, code: "S2" }, ...]

// Mapper
const semesterId = semesters.find(s => s.code === module.semester)?.id;
```

## Test

### 1. Vérifier les Logs
1. Ouvrir DevTools (F12) → Console
2. Affecter un enseignant
3. Vérifier les logs :
   ```
   Module data: { id: 1, level: "L1", semester: "S1", programs: [...] }
   Payload to send: { module_id: 1, teacher_id: 5, ... }
   ```

### 2. Vérifier la Requête
1. DevTools → Network
2. Chercher `POST /api/admin/modules/1/teachers`
3. Vérifier le payload dans l'onglet "Payload"

### 3. Vérifier la Réponse
1. Vérifier le status code (200 = succès, 422 = validation error)
2. Si erreur, vérifier le message dans l'onglet "Response"

## Statut

⏳ **EN ATTENTE** - Clarification du backend nécessaire

## Actions Requises

### Frontend
- ✅ Logs ajoutés pour debug
- ✅ `programme_id` rendu optionnel
- ✅ `semester` envoyé au format string
- ⏳ En attente de confirmation du format attendu

### Backend
- ❓ Clarifier si `programme_id` est obligatoire
- ❓ Clarifier le format de `semester_id` / `semester`
- ❓ Fournir la structure exacte de la table `teacher_assignments`
- ❓ Considérer l'option de déduire les champs depuis `module_id`

---

**Date** : 13 janvier 2026  
**Statut** : En attente de clarification backend  
**Fichiers modifiés** : `ModuleTeachersDialog.tsx`, `moduleTeacher.types.ts`
