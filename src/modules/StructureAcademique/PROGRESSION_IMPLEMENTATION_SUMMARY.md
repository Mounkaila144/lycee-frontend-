# Implémentation Frontend: Validation Progression Pédagogique

## Story
**structure-academique.gestion-niveaux.03-validation-progression-pedagogique**
- Epic: Gestion des Niveaux
- Priorité: Haute
- Complexité: Moyenne
- Status Backend: ✅ Ready for Review
- Status Frontend: ✅ TYPES, SERVICE & HOOKS CRÉÉS

## Objectif
Définir et contrôler les règles de passage d'un niveau à l'autre selon normes LMD, avec gestion de la dette pédagogique et des modules éliminatoires.

## Fichiers Créés

### 1. Types TypeScript ✅
**Fichier**: `src/modules/StructureAcademique/types/progression.types.ts`

**Contenu**:
- `ProgressionRule` - Règle de progression entre niveaux
- `ProgressionRuleFormData` - Données du formulaire
- `EliminatoryModule` - Module éliminatoire
- `AddEliminatoryModuleRequest` - Ajout module éliminatoire
- `ProgressionResult` - Résultat de validation
- Types: `ProgressionLevel`, `ProgressionStatus`
- Helpers:
  - `getProgressionStatusLabel()` - Label du statut
  - `getProgressionStatusColor()` - Couleur du badge
  - `getTargetLevels()` - Niveaux cibles possibles
  - `getTransitionLabel()` - Label de la transition

### 2. Service API ✅
**Fichier**: `src/modules/StructureAcademique/admin/services/progressionService.ts`

**Méthodes**:
- `getProgressionRules(tenantId)` - Liste des règles
- `createProgressionRule(data, tenantId)` - Création règle
- `updateProgressionRule(id, data, tenantId)` - Modification règle
- `deleteProgressionRule(id, tenantId)` - Suppression règle
- `getEliminatoryModules(programId, tenantId)` - Modules éliminatoires d'un programme
- `addEliminatoryModule(programId, data, tenantId)` - Ajout module éliminatoire
- `removeEliminatoryModule(programId, moduleId, tenantId)` - Suppression module éliminatoire
- `validateStudentProgression(studentId, tenantId)` - Validation progression étudiant

### 3. Hooks Personnalisés ✅
**Fichier**: `src/modules/StructureAcademique/admin/hooks/useProgression.ts`

**Hooks**:
1. **`useProgressionRules()`**:
   - Gestion des règles de progression
   - CRUD operations (create, update, delete)
   - Refresh automatique

2. **`useEliminatoryModules(programId)`**:
   - Gestion des modules éliminatoires d'un programme
   - CRUD operations (add, remove)
   - Refresh automatique

## Composants à Créer (Recommandations)

### 1. ProgressionRuleFormDialog
**Objectif**: Créer/Modifier une règle de progression

**Champs**:
- Programme (select, nullable pour règle globale)
- Niveau source (select: L1, L2, L3, M1)
- Niveau cible (select: filtré selon niveau source)
- Crédits minimum requis (number, 0-60)
- Dette maximale autorisée (number, 0-30)
- Passage conditionnel autorisé (checkbox)
- Nombre max de redoublements avant exclusion (number, 1-3)

**Validation**:
- Crédits minimum: 0-60
- Dette maximale: 0-30
- Cohérence: niveau cible > niveau source
- Unicité: (program_id, from_level, to_level)

**Exemple**:
```typescript
// Règle L1 → L2
{
  program_id: 1, // ou null pour règle globale
  from_level: 'L1',
  to_level: 'L2',
  min_credits_required: 45, // 45/60 crédits minimum
  max_debt_allowed: 15, // max 15 crédits de dette
  allow_conditional_pass: true,
  max_repeats_before_exclusion: 2
}
```

### 2. ProgressionRuleListTable
**Objectif**: Afficher la liste des règles de progression

**Colonnes**:
- Programme (ou "Règle Globale")
- Transition (L1 → L2)
- Crédits Min (45/60)
- Dette Max (15)
- Passage Conditionnel (Oui/Non)
- Max Redoublements (2)
- Actions (Éditer, Supprimer)

**Filtres**:
- Par programme
- Par niveau source
- Règles globales uniquement

### 3. EliminatoryModulesDialog
**Objectif**: Gérer les modules éliminatoires d'un programme

**Sections**:
1. **Ajout**:
   - Autocomplete pour sélectionner un module
   - Select pour le niveau (L1-M2)
   - Bouton "Ajouter"
   - Filtrage: modules du programme uniquement

2. **Liste**:
   - Modules éliminatoires par niveau
   - Groupés par niveau (L1, L2, L3, M1, M2)
   - Badge "Éliminatoire" rouge
   - Bouton supprimer

**Exemple**:
```
Niveau L1:
- [MATH101] Mathématiques Fondamentales (6 ECTS) [X]
- [INF101] Programmation (6 ECTS) [X]

Niveau L2:
- [MATH201] Analyse (6 ECTS) [X]
```

### 4. ProgressionSimulatorDialog
**Objectif**: Simuler la progression d'un étudiant

**Inputs**:
- Étudiant (select)
- Niveau actuel (auto-détecté)
- Crédits acquis (auto-calculés)

**Outputs**:
- Statut: Passage Automatique / Conditionnel / Redoublement / Bloqué
- Badge coloré (vert/orange/rouge)
- Crédits acquis / requis
- Dette pédagogique (si applicable)
- Modules éliminatoires manquants (si applicable)
- Message explicatif

**Exemple de résultat**:
```
✅ Passage Automatique
Crédits acquis: 50/45 requis
Niveau cible: L2

⚠️ Passage Conditionnel
Crédits acquis: 42/45 requis
Dette pédagogique: 3 crédits (max 15 autorisés)
Niveau cible: L2

❌ Redoublement
Crédits acquis: 28/45 requis
Dette: 17 crédits (max 15 autorisés)
Niveau actuel: L1

❌ Bloqué (Module Éliminatoire)
Crédits acquis: 50/45 requis
Modules éliminatoires non validés:
- MATH101 - Mathématiques Fondamentales
```

### 5. Intégration dans ProgrammeListTable
**Ajout de boutons**:
- 📋 Règles de Progression (ouvre ProgressionRuleFormDialog)
- ⚠️ Modules Éliminatoires (ouvre EliminatoryModulesDialog)

## Règles de Progression

### Types de Progression

1. **Passage Automatique** (✅ Vert)
   - Crédits acquis >= crédits minimum requis
   - Tous les modules éliminatoires validés
   - Passage direct au niveau supérieur

2. **Passage Conditionnel** (⚠️ Orange)
   - Crédits acquis < crédits minimum requis
   - Mais dette <= dette maximale autorisée
   - Passage conditionnel autorisé = true
   - Tous les modules éliminatoires validés
   - Passage avec dette pédagogique

3. **Redoublement** (❌ Rouge)
   - Crédits acquis < crédits minimum requis
   - Dette > dette maximale autorisée
   - OU passage conditionnel non autorisé
   - Maintien au niveau actuel

4. **Bloqué (Module Éliminatoire)** (❌ Rouge)
   - Au moins un module éliminatoire non validé
   - Même si crédits suffisants
   - Blocage total

### Exemple de Configuration

**Règle L1 → L2 (Licence)**:
```
Crédits minimum requis: 45/60 (75%)
Dette maximale autorisée: 15 crédits
Passage conditionnel: Oui
Max redoublements: 2
```

**Scénarios**:
- Étudiant avec 50 crédits → ✅ Passage Automatique
- Étudiant avec 42 crédits → ⚠️ Passage Conditionnel (dette: 3)
- Étudiant avec 28 crédits → ❌ Redoublement (dette: 17 > 15)
- Étudiant avec 50 crédits mais MATH101 non validé → ❌ Bloqué

## API Endpoints Utilisés

```
GET    /api/admin/progression-rules                           - Liste règles
POST   /api/admin/progression-rules                           - Création
PUT    /api/admin/progression-rules/{id}                      - Modification
DELETE /api/admin/progression-rules/{id}                      - Suppression
GET    /api/admin/programmes/{id}/eliminatory-modules         - Modules éliminatoires
POST   /api/admin/programmes/{id}/eliminatory-modules         - Ajout module éliminatoire
DELETE /api/admin/programmes/{id}/eliminatory-modules/{moduleId} - Suppression
POST   /api/admin/students/{id}/validate-progression          - Validation étudiant
```

## Validation Backend

Le backend implémente la logique de validation complète:

```php
class ProgressionValidationService
{
    public function canProgress(Student $student, string $currentLevel, string $targetLevel): ProgressionResult
    {
        // 1. Récupérer la règle applicable
        $rule = ProgressionRule::getRule($student->program_id, $currentLevel, $targetLevel);
        
        // 2. Calculer les crédits acquis
        $acquiredCredits = $this->getAcquiredCredits($student, $currentLevel);
        
        // 3. Vérifier les modules éliminatoires
        $eliminatoryCheck = $this->checkEliminatoryModules($student, $currentLevel);
        
        if (!$eliminatoryCheck['all_validated']) {
            return new ProgressionResult(
                allowed: false,
                status: 'blocked_eliminatory',
                message: "Modules éliminatoires non validés: {$eliminatoryCheck['missing']}"
            );
        }
        
        // 4. Vérifier les crédits
        if ($acquiredCredits >= $rule->min_credits_required) {
            return new ProgressionResult(
                allowed: true,
                status: 'automatic_pass',
                credits: $acquiredCredits
            );
        }
        
        // 5. Vérifier la dette pédagogique
        $debt = $rule->min_credits_required - $acquiredCredits;
        
        if ($debt <= $rule->max_debt_allowed && $rule->allow_conditional_pass) {
            return new ProgressionResult(
                allowed: true,
                status: 'conditional_pass',
                credits: $acquiredCredits,
                debt: $debt,
                message: "Passage avec dette de {$debt} crédits"
            );
        }
        
        // 6. Redoublement
        return new ProgressionResult(
            allowed: false,
            status: 'must_repeat',
            credits: $acquiredCredits,
            debt: $debt
        );
    }
}
```

## Tests à Effectuer

### ✅ Test 1: Créer une Règle Globale
1. Créer une règle L1 → L2
2. Programme: null (règle globale)
3. Crédits min: 45
4. Dette max: 15
5. ✅ **Vérifier**: Règle créée et applicable à tous les programmes

### ✅ Test 2: Créer une Règle Spécifique
1. Créer une règle L1 → L2 pour un programme spécifique
2. Programme: Licence Informatique
3. Crédits min: 50 (plus strict que la règle globale)
4. ✅ **Vérifier**: Règle spécifique prioritaire sur règle globale

### ✅ Test 3: Ajouter un Module Éliminatoire
1. Ouvrir le dialog des modules éliminatoires
2. Sélectionner MATH101
3. Niveau: L1
4. ✅ **Vérifier**: Module ajouté avec badge rouge "Éliminatoire"

### ✅ Test 4: Simuler Passage Automatique
1. Étudiant avec 50 crédits L1
2. Tous modules éliminatoires validés
3. ✅ **Vérifier**: Statut "Passage Automatique" (vert)

### ✅ Test 5: Simuler Passage Conditionnel
1. Étudiant avec 42 crédits L1 (seuil: 45)
2. Dette: 3 crédits (max: 15)
3. ✅ **Vérifier**: Statut "Passage Conditionnel" (orange)

### ✅ Test 6: Simuler Redoublement
1. Étudiant avec 28 crédits L1 (seuil: 45)
2. Dette: 17 crédits (max: 15)
3. ✅ **Vérifier**: Statut "Redoublement" (rouge)

### ✅ Test 7: Simuler Blocage Module Éliminatoire
1. Étudiant avec 50 crédits L1
2. MATH101 (éliminatoire) non validé
3. ✅ **Vérifier**: Statut "Bloqué" avec message explicite

## Intégration Multi-Tenant

Toutes les fonctionnalités supportent le multi-tenancy:
- `createApiClient(tenantId)` dans tous les services
- `useTenant()` hook pour récupérer le tenantId
- Headers automatiques (`X-Tenant-ID`)
- Isolation stricte des données par tenant

## Résumé

✅ **3 fichiers créés** (types, service, hooks)
✅ **Types complets** pour règles et modules éliminatoires
✅ **Service API** avec 8 méthodes
✅ **2 hooks personnalisés** pour gestion d'état
✅ **Helpers** pour labels et couleurs
✅ **Multi-tenancy** support complet
✅ **Aucune erreur TypeScript**

## Composants Recommandés à Créer

Pour compléter l'implémentation frontend, créer:
1. `ProgressionRuleFormDialog.tsx` - Formulaire règles
2. `ProgressionRuleListTable.tsx` - Liste des règles
3. `EliminatoryModulesDialog.tsx` - Gestion modules éliminatoires
4. `ProgressionSimulatorDialog.tsx` - Simulateur de progression
5. Intégration dans `ProgrammeListTable.tsx` - Boutons d'accès

Ces composants suivront les mêmes patterns que les composants existants (ModuleFormDialog, ModulePrerequisitesDialog, etc.).

## Notes d'Implémentation

### Règles de Progression
- Une règle globale (program_id = null) s'applique à tous les programmes
- Une règle spécifique (program_id != null) est prioritaire sur la règle globale
- Transitions possibles: L1→L2, L2→L3, L3→M1, M1→M2

### Modules Éliminatoires
- Un module éliminatoire doit être validé obligatoirement
- Même avec crédits suffisants, un module éliminatoire non validé bloque la progression
- Les modules éliminatoires sont définis par programme et par niveau

### Dette Pédagogique
- Dette = Crédits requis - Crédits acquis
- Si dette <= dette max autorisée → Passage conditionnel possible
- Si dette > dette max autorisée → Redoublement obligatoire

Le système de validation de progression pédagogique est maintenant prêt côté types, service et hooks! 🎉
