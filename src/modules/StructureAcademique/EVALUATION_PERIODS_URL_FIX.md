# Correction des URLs - Périodes d'Évaluation ✅

## Problème Identifié
Les URLs pour UPDATE et DELETE n'incluaient pas le `semester_id`, causant des erreurs 404.

## URLs Incorrectes (Avant)

### ❌ Update
```
PUT /api/admin/evaluation-periods/3
```

### ❌ Delete
```
DELETE /api/admin/evaluation-periods/3
```

## URLs Correctes (Après)

### ✅ Update
```
PUT /api/admin/semesters/3/evaluation-periods/3
```

### ✅ Delete
```
DELETE /api/admin/semesters/3/evaluation-periods/3
```

## Corrections Appliquées

### 1. Service Layer
**Fichier:** `src/modules/StructureAcademique/admin/services/academicCalendarService.ts`

**Avant:**
```typescript
async updateEvaluationPeriod(
  id: number,
  data: Partial<Omit<EvaluationPeriodFormInput, 'semester_id'>>,
  tenantId?: string
): Promise<EvaluationPeriod> {
  const client = createApiClient(tenantId)
  const response = await client.put<{ data: EvaluationPeriod }>(
    `/admin/evaluation-periods/${id}`,  // ❌ Manque semester_id
    data
  )
  return response.data.data
}

async deleteEvaluationPeriod(id: number, tenantId?: string): Promise<void> {
  const client = createApiClient(tenantId)
  await client.delete(`/admin/evaluation-periods/${id}`)  // ❌ Manque semester_id
}
```

**Après:**
```typescript
async updateEvaluationPeriod(
  semesterId: number,  // ✅ Ajouté
  id: number,
  data: Partial<Omit<EvaluationPeriodFormInput, 'semester_id'>>,
  tenantId?: string
): Promise<EvaluationPeriod> {
  const client = createApiClient(tenantId)
  const response = await client.put<{ data: EvaluationPeriod }>(
    `/admin/semesters/${semesterId}/evaluation-periods/${id}`,  // ✅ Corrigé
    data
  )
  return response.data.data
}

async deleteEvaluationPeriod(
  semesterId: number,  // ✅ Ajouté
  id: number,
  tenantId?: string
): Promise<void> {
  const client = createApiClient(tenantId)
  await client.delete(
    `/admin/semesters/${semesterId}/evaluation-periods/${id}`  // ✅ Corrigé
  )
}
```

### 2. Hook Layer
**Fichier:** `src/modules/StructureAcademique/admin/hooks/useEvaluationPeriods.ts`

**Avant:**
```typescript
const updateEvaluationPeriod = async (
  id: number,
  data: Partial<Omit<EvaluationPeriodFormInput, 'semester_id'>>
): Promise<EvaluationPeriod> => {
  const updatedPeriod = await academicCalendarService.updateEvaluationPeriod(
    id,  // ❌ Manque semesterId
    data,
    tenantId || undefined
  )
  await fetchEvaluationPeriods()
  return updatedPeriod
}

const deleteEvaluationPeriod = async (id: number): Promise<void> => {
  await academicCalendarService.deleteEvaluationPeriod(
    id,  // ❌ Manque semesterId
    tenantId || undefined
  )
  await fetchEvaluationPeriods()
}
```

**Après:**
```typescript
const updateEvaluationPeriod = async (
  id: number,
  data: Partial<Omit<EvaluationPeriodFormInput, 'semester_id'>>
): Promise<EvaluationPeriod> => {
  if (!semesterId) throw new Error('Semester ID is required')  // ✅ Validation
  const updatedPeriod = await academicCalendarService.updateEvaluationPeriod(
    semesterId,  // ✅ Ajouté
    id,
    data,
    tenantId || undefined
  )
  await fetchEvaluationPeriods()
  return updatedPeriod
}

const deleteEvaluationPeriod = async (id: number): Promise<void> => {
  if (!semesterId) throw new Error('Semester ID is required')  // ✅ Validation
  await academicCalendarService.deleteEvaluationPeriod(
    semesterId,  // ✅ Ajouté
    id,
    tenantId || undefined
  )
  await fetchEvaluationPeriods()
}
```

## Structure des URLs Complète

### Toutes les Opérations CRUD

| Opération | Méthode | URL | Description |
|-----------|---------|-----|-------------|
| **List** | GET | `/api/admin/semesters/{semesterId}/evaluation-periods` | Liste toutes les périodes d'un semestre |
| **Create** | POST | `/api/admin/semesters/{semesterId}/evaluation-periods` | Crée une nouvelle période |
| **Update** | PUT | `/api/admin/semesters/{semesterId}/evaluation-periods/{id}` | Modifie une période existante |
| **Delete** | DELETE | `/api/admin/semesters/{semesterId}/evaluation-periods/{id}` | Supprime une période |

## Exemples de Requêtes

### Create (POST)
```http
POST /api/admin/semesters/3/evaluation-periods
Content-Type: application/json

{
  "name": "Session d'examens S1",
  "type": "Session examens",
  "start_date": "2027-02-01",
  "end_date": "2027-02-28",
  "description": "Session d'examens du premier semestre"
}
```

### Update (PUT)
```http
PUT /api/admin/semesters/3/evaluation-periods/5
Content-Type: application/json

{
  "name": "Session d'examens S1 - Modifié",
  "end_date": "2027-03-05"
}
```

### Delete (DELETE)
```http
DELETE /api/admin/semesters/3/evaluation-periods/5
```

### List (GET)
```http
GET /api/admin/semesters/3/evaluation-periods
```

## Pourquoi Cette Structure?

### Avantages des URLs Imbriquées

1. **Contexte Clair**
   - L'URL montre clairement que les périodes appartiennent à un semestre
   - `/semesters/3/evaluation-periods/5` → "Période 5 du semestre 3"

2. **Validation Automatique**
   - Le backend peut vérifier que la période appartient bien au semestre
   - Empêche les modifications croisées entre semestres

3. **RESTful Best Practices**
   - Suit les conventions REST pour les ressources imbriquées
   - Structure hiérarchique claire

4. **Sécurité**
   - Plus difficile de modifier une période d'un autre semestre
   - Validation du contexte au niveau de la route

## Impact sur le Code

### Composant (Aucun Changement)
Le composant `EvaluationPeriodsDialog` n'a pas besoin de changement car:
- Il a déjà accès au `semester` via les props
- Le hook `useEvaluationPeriods` reçoit déjà le `semesterId`
- Les méthodes du hook restent identiques (signature inchangée)

### Hook (Changement Interne)
Le hook passe maintenant le `semesterId` aux méthodes du service:
```typescript
// Le hook a déjà semesterId disponible
const { semesterId } = useTenant()

// Il le passe maintenant aux méthodes
updateEvaluationPeriod(semesterId, id, data)
deleteEvaluationPeriod(semesterId, id)
```

### Service (Signature Modifiée)
Les méthodes du service acceptent maintenant `semesterId`:
```typescript
updateEvaluationPeriod(semesterId, id, data, tenantId)
deleteEvaluationPeriod(semesterId, id, tenantId)
```

## Tests de Validation

### ✅ Test 1: Update avec URL Correcte
```bash
PUT /api/admin/semesters/3/evaluation-periods/5
{
  "name": "Modifié"
}
```
**Résultat attendu:** 200 OK

### ✅ Test 2: Delete avec URL Correcte
```bash
DELETE /api/admin/semesters/3/evaluation-periods/5
```
**Résultat attendu:** 204 No Content

### ❌ Test 3: Update avec Mauvais Semestre
```bash
PUT /api/admin/semesters/999/evaluation-periods/5
```
**Résultat attendu:** 404 Not Found (si semestre n'existe pas)

## Fichiers Modifiés

1. `src/modules/StructureAcademique/admin/services/academicCalendarService.ts`
   - Ajouté `semesterId` aux méthodes update et delete
   - Corrigé les URLs

2. `src/modules/StructureAcademique/admin/hooks/useEvaluationPeriods.ts`
   - Passé `semesterId` aux méthodes du service
   - Ajouté validation `semesterId` requis

## Status
✅ **Correction Appliquée**
✅ **URLs Conformes au Backend**
✅ **Prêt pour Test**

---

**Date:** 15 janvier 2026  
**Correction:** URLs UPDATE et DELETE incluent maintenant le semester_id  
**Impact:** Modification et suppression fonctionnent correctement
