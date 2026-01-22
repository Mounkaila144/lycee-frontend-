# Fix Teacher Assignment Payload - Champs Manquants ✅

## Problème Identifié

Lors de l'affectation d'un enseignant à un module, le backend Laravel retournait une erreur de validation :

```json
{
  "message": "Le module est obligatoire. (and 5 more errors)",
  "errors": {
    "module_id": ["Le module est obligatoire."],
    "programme_id": ["Le programme est obligatoire."],
    "level": ["Le niveau est obligatoire."],
    "semester_id": ["Le semestre est obligatoire."],
    "type": ["Le type d'intervention est obligatoire."],
    "hours_allocated": ["Les heures affectées sont obligatoires."]
  }
}
```

### Cause
Le frontend envoyait seulement :
```typescript
{
  teacher_id: number,
  teaching_type: TeachingType,
  hours_assigned: number,
  academic_year: string
}
```

Mais le backend Laravel attendait :
```typescript
{
  module_id: number,
  teacher_id: number,
  programme_id: number,
  level: string,
  semester_id: number,
  type: TeachingType,
  hours_allocated: number,
  academic_year: string
}
```

## Solution Implémentée

### 1. Type `AssignTeacherRequest` Mis à Jour

**Fichier** : `src/modules/StructureAcademique/types/moduleTeacher.types.ts`

```typescript
export interface AssignTeacherRequest {
  module_id?: number;           // ✅ Ajouté
  teacher_id: number;
  programme_id?: number;         // ✅ Ajouté
  level?: string;                // ✅ Ajouté
  semester_id?: number;          // ✅ Ajouté
  type: TeachingType;            // ✅ Renommé de teaching_type
  teaching_type?: TeachingType;  // Gardé pour compatibilité
  hours_allocated: number;       // ✅ Renommé de hours_assigned
  hours_assigned?: number;       // Gardé pour compatibilité
  academic_year: string;
}
```

### 2. Composant `ModuleTeachersDialog` Mis à Jour

**Fichier** : `src/modules/StructureAcademique/admin/components/ModuleTeachersDialog.tsx`

**Avant** :
```typescript
await assignTeacher({
  teacher_id: selectedTeacherId,
  teaching_type: selectedTeachingType,
  hours_assigned: hoursAssigned,
  academic_year: selectedYear,
});
```

**Après** :
```typescript
await assignTeacher({
  module_id: module.id,
  teacher_id: selectedTeacherId,
  programme_id: module.programs && module.programs.length > 0 ? module.programs[0].id : undefined,
  level: module.level,
  semester_id: parseInt(module.semester.replace('S', '')), // S1 -> 1, S2 -> 2
  type: selectedTeachingType,
  teaching_type: selectedTeachingType, // Pour compatibilité
  hours_allocated: hoursAssigned,
  hours_assigned: hoursAssigned, // Pour compatibilité
  academic_year: selectedYear,
});
```

## Mapping des Champs

| Champ Backend | Source Frontend | Transformation | Exemple |
|---------------|-----------------|----------------|---------|
| `module_id` | `module.id` | Direct | `42` |
| `teacher_id` | `selectedTeacherId` | Direct | `5` |
| `programme_id` | `module.programs[0].id` | Premier programme du module | `12` |
| `level` | `module.level` | Direct | `"L1"` |
| `semester_id` | `module.semester` | Conversion S1→1, S2→2 | `1` |
| `type` | `selectedTeachingType` | Direct | `"CM"` |
| `hours_allocated` | `hoursAssigned` | Direct | `20` |
| `academic_year` | `selectedYear` | Direct | `"2025-2026"` |

## Transformation du Semestre

Le frontend utilise le format `"S1"`, `"S2"`, etc., mais le backend attend un nombre :

```typescript
semester_id: parseInt(module.semester.replace('S', ''))
```

**Exemples** :
- `"S1"` → `1`
- `"S2"` → `2`
- `"S10"` → `10`

## Gestion du Programme

Si le module est associé à plusieurs programmes, on prend le premier :

```typescript
programme_id: module.programs && module.programs.length > 0 
  ? module.programs[0].id 
  : undefined
```

**Note** : Si le module n'a pas de programme associé, `programme_id` sera `undefined`. Le backend devra gérer ce cas ou le champ doit être rendu optionnel.

## Compatibilité

Pour assurer la compatibilité avec d'éventuelles versions différentes du backend, on envoie les deux formats :

```typescript
{
  type: selectedTeachingType,           // Nouveau format
  teaching_type: selectedTeachingType,  // Ancien format
  hours_allocated: hoursAssigned,       // Nouveau format
  hours_assigned: hoursAssigned         // Ancien format
}
```

## Payload Complet Envoyé

```json
{
  "module_id": 42,
  "teacher_id": 5,
  "programme_id": 12,
  "level": "L1",
  "semester_id": 1,
  "type": "CM",
  "teaching_type": "CM",
  "hours_allocated": 20,
  "hours_assigned": 20,
  "academic_year": "2025-2026"
}
```

## Test

### 1. Ouvrir le Modal
1. Aller sur la page des modules
2. Cliquer sur "Affecter Enseignants" pour un module
3. Le modal s'ouvre

### 2. Affecter un Enseignant
1. Sélectionner un enseignant dans la liste
2. Choisir le type (CM/TD/TP)
3. Entrer le nombre d'heures
4. Cliquer sur "Ajouter"

### 3. Vérifier la Requête
1. Ouvrir DevTools (F12) → Network
2. Chercher la requête `POST /api/admin/modules/{id}/teachers`
3. Vérifier le payload contient tous les champs requis

### 4. Vérifier le Résultat
- ✅ L'affectation est créée sans erreur
- ✅ L'enseignant apparaît dans la liste
- ✅ Les heures sont correctement affichées

## Erreurs Possibles

### Si programme_id est undefined
**Erreur** : `"Le programme est obligatoire."`

**Solution** :
- Vérifier que le module a au moins un programme associé
- Ou rendre le champ `programme_id` optionnel dans le backend

### Si semester_id est NaN
**Erreur** : `"Le semestre est obligatoire."`

**Cause** : Le format du semestre n'est pas `"S1"`, `"S2"`, etc.

**Solution** : Vérifier le format du champ `module.semester`

### Si level est vide
**Erreur** : `"Le niveau est obligatoire."`

**Solution** : Vérifier que le module a un niveau défini

## Backend Laravel - Validation Attendue

```php
// TeacherAssignmentRequest.php
public function rules()
{
    return [
        'module_id' => 'required|exists:modules,id',
        'teacher_id' => 'required|exists:users,id',
        'programme_id' => 'required|exists:programmes,id',
        'level' => 'required|string',
        'semester_id' => 'required|integer|min:1|max:10',
        'type' => 'required|in:CM,TD,TP',
        'hours_allocated' => 'required|numeric|min:0',
        'academic_year' => 'required|string',
    ];
}
```

## Recommandations

### 1. Rendre programme_id Optionnel
Si un module peut ne pas être associé à un programme, le backend devrait accepter `programme_id` comme optionnel :

```php
'programme_id' => 'nullable|exists:programmes,id',
```

### 2. Validation Cohérente
Le backend devrait vérifier que :
- Le `module_id` correspond bien au module dans l'URL
- Le `level` et `semester_id` correspondent aux valeurs du module
- Le `programme_id` est bien associé au module

### 3. Simplification Future
Idéalement, le backend pourrait déduire certains champs du `module_id` :
- `level` → depuis `modules.level`
- `semester_id` → depuis `modules.semester`
- `programme_id` → depuis la relation `module_programme`

Cela simplifierait le payload à :
```json
{
  "teacher_id": 5,
  "type": "CM",
  "hours_allocated": 20,
  "academic_year": "2025-2026"
}
```

## Statut

✅ **COMPLET** - Le payload contient maintenant tous les champs requis par le backend

## Fichiers Modifiés

1. `src/modules/StructureAcademique/types/moduleTeacher.types.ts` - Type `AssignTeacherRequest` mis à jour
2. `src/modules/StructureAcademique/admin/components/ModuleTeachersDialog.tsx` - Payload complet envoyé

---

**Date** : 13 janvier 2026  
**Problème résolu** : Erreur de validation lors de l'affectation d'enseignant  
**Champs ajoutés** : `module_id`, `programme_id`, `level`, `semester_id`, `type`, `hours_allocated`
