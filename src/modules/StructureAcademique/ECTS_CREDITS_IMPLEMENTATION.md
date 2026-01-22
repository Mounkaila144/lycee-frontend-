# Configuration des Crédits ECTS - Implémentation Frontend

## 📋 Vue d'ensemble

Implémentation complète de la configuration des crédits ECTS par niveau avec validation de la maquette pédagogique.

## ✅ Fonctionnalités Implémentées

### 1. Types TypeScript
**Fichier:** `types/levelCredit.types.ts`
- `AcademicLevel`: Type pour les niveaux académiques (L1, L2, L3, M1, M2)
- `LevelCreditConfiguration`: Configuration des crédits pour un niveau
- `LevelCreditFormData`: Données du formulaire de configuration
- `CreditValidationResult`: Résultat de validation pour un niveau
- `CreditValidationReport`: Rapport complet de validation

### 2. Service API
**Fichier:** `admin/services/levelCreditService.ts`

**Méthodes:**
- `getGlobalConfigurations()`: Récupère les configurations globales
- `updateGlobalConfiguration()`: Met à jour une configuration globale
- `getProgramConfigurations()`: Récupère les configurations d'un programme
- `updateProgramConfiguration()`: Met à jour une configuration de programme
- `validateProgramCredits()`: Valide les crédits d'un programme

### 3. Hooks Personnalisés
**Fichier:** `admin/hooks/useLevelCredits.ts`

**Hooks:**
- `useGlobalLevelCredits()`: Gestion des configurations globales
- `useProgramLevelCredits(programId)`: Gestion des configurations par programme
- `useProgramCreditValidation(programId)`: Validation des crédits d'un programme

### 4. Composants UI

#### LevelCreditConfigDialog
**Fichier:** `admin/components/LevelCreditConfigDialog.tsx`

**Fonctionnalités:**
- Formulaire de configuration des crédits par niveau
- Validation en temps réel (15-45 crédits par semestre)
- Calcul automatique du total annuel
- Alertes pour répartition déséquilibrée (>10 crédits de différence)
- Alertes pour total non-LMD (≠60 crédits)

#### LevelCreditConfigTable
**Fichier:** `admin/components/LevelCreditConfigTable.tsx`

**Fonctionnalités:**
- Tableau récapitulatif des 5 niveaux (L1, L2, L3, M1, M2)
- Affichage des crédits S1, S2, et total
- Badges de statut (LMD/Non-LMD, Équilibré/Déséquilibré)
- Indication des valeurs par défaut vs configurées
- Actions d'édition par niveau

#### CreditValidationReport
**Fichier:** `admin/components/CreditValidationReport.tsx`

**Fonctionnalités:**
- Rapport de validation de la maquette pédagogique
- Comparaison crédits configurés vs crédits modules
- Calcul automatique des écarts (manque/surplus)
- Statut visuel (Valide/Invalide)
- Alertes globales pour blocage d'activation
- Suggestions de correction

#### GlobalLevelCreditConfig
**Fichier:** `admin/components/GlobalLevelCreditConfig.tsx`

**Fonctionnalités:**
- Page de configuration globale des crédits
- Gestion des valeurs par défaut pour tous les programmes
- Informations sur les normes LMD
- Intégration avec le tableau et le dialogue

#### ProgramLevelCreditConfig
**Fichier:** `admin/components/ProgramLevelCreditConfig.tsx`

**Fonctionnalités:**
- Configuration spécifique à un programme
- Onglets: Configuration / Validation
- Override des valeurs globales
- Validation en temps réel de la maquette
- Bouton d'actualisation de la validation

## 🎨 Patterns Utilisés

### Architecture
- **Service Layer**: Séparation claire entre logique API et UI
- **Custom Hooks**: Encapsulation de la logique métier et state management
- **Component Composition**: Composants réutilisables et modulaires

### State Management
- React hooks (`useState`, `useEffect`, `useCallback`)
- Context API via `useTenant()` pour multi-tenancy
- Gestion d'erreurs et loading states

### Validation
- Validation côté client (15-45 crédits par semestre)
- Alertes en temps réel (déséquilibre, non-LMD)
- Validation côté serveur via API

### UI/UX
- Material-UI components (Dialog, Table, Tabs, Chips, Alerts)
- Feedback visuel (badges de statut, couleurs sémantiques)
- Tooltips informatifs
- Loading states et error handling

## 📊 Normes LMD Implémentées

### Valeurs Standard
- **Total annuel**: 60 crédits
- **Par semestre**: 30 crédits (équilibré)
- **Plage autorisée**: 15-45 crédits par semestre

### Alertes
- **Warning**: Total ≠ 60 crédits
- **Info**: Déséquilibre > 10 crédits entre S1 et S2
- **Error**: Incohérence entre crédits configurés et modules

## 🔄 Flux de Travail

### Configuration Globale
1. Accéder à la page de configuration globale
2. Modifier les crédits pour chaque niveau (L1-M2)
3. Système valide automatiquement (15-45 par semestre)
4. Enregistrement avec feedback visuel

### Configuration Programme
1. Accéder à un programme spécifique
2. Onglet "Configuration": Override des valeurs globales
3. Onglet "Validation": Vérification de la maquette
4. Système compare crédits configurés vs modules
5. Rapport détaillé avec écarts et statuts

### Validation Maquette
1. Calcul automatique des crédits modules par niveau
2. Comparaison avec crédits configurés
3. Détection des écarts (manque/surplus)
4. Blocage activation si incohérence
5. Suggestions de correction

## 🧪 Points de Test

### Tests Fonctionnels
- [ ] Configuration globale: créer/modifier pour chaque niveau
- [ ] Configuration programme: override des valeurs globales
- [ ] Validation: détection manque de crédits
- [ ] Validation: détection surplus de crédits
- [ ] Alertes: déséquilibre S1/S2 > 10 crédits
- [ ] Alertes: total ≠ 60 crédits
- [ ] Priorité: config programme > config globale
- [ ] Multi-tenant: isolation des configurations

### Tests UI
- [ ] Dialogue: validation 15-45 crédits
- [ ] Dialogue: calcul automatique total
- [ ] Tableau: affichage badges statut
- [ ] Tableau: indication valeurs par défaut
- [ ] Rapport: affichage écarts corrects
- [ ] Rapport: statuts visuels (vert/rouge)
- [ ] Onglets: navigation Configuration/Validation
- [ ] Loading states: affichage pendant requêtes

## 📁 Fichiers Créés

```
src/modules/StructureAcademique/
├── types/
│   └── levelCredit.types.ts                    ✅ Nouveau
├── admin/
│   ├── services/
│   │   └── levelCreditService.ts               ✅ Nouveau
│   ├── hooks/
│   │   └── useLevelCredits.ts                  ✅ Nouveau
│   ├── components/
│   │   ├── LevelCreditConfigDialog.tsx         ✅ Nouveau
│   │   ├── LevelCreditConfigTable.tsx          ✅ Nouveau
│   │   ├── CreditValidationReport.tsx          ✅ Nouveau
│   │   ├── GlobalLevelCreditConfig.tsx         ✅ Nouveau
│   │   └── ProgramLevelCreditConfig.tsx        ✅ Nouveau
│   └── index.ts                                ✅ Modifié
├── types/
│   └── index.ts                                ✅ Modifié
├── translations/
│   └── fr.json                                 ✅ Modifié
└── ECTS_CREDITS_IMPLEMENTATION.md              ✅ Nouveau
```

## 🚀 Utilisation

### Configuration Globale
```tsx
import { GlobalLevelCreditConfig } from '@/modules/StructureAcademique';

function GlobalCreditsPage() {
  return <GlobalLevelCreditConfig />;
}
```

### Configuration Programme
```tsx
import { ProgramLevelCreditConfig } from '@/modules/StructureAcademique';

function ProgramCreditsPage({ programId, programName }) {
  return (
    <ProgramLevelCreditConfig
      programId={programId}
      programName={programName}
    />
  );
}
```

### Hooks Personnalisés
```tsx
import {
  useGlobalLevelCredits,
  useProgramLevelCredits,
  useProgramCreditValidation
} from '@/modules/StructureAcademique';

// Configuration globale
const { configurations, updateConfiguration } = useGlobalLevelCredits();

// Configuration programme
const { configurations, updateConfiguration } = useProgramLevelCredits(programId);

// Validation
const { validationReport, validate } = useProgramCreditValidation(programId);
```

## 🔗 Intégration Backend

### Endpoints Utilisés
- `GET /api/admin/levels/credits` - Config globale
- `POST /api/admin/levels/credits` - Update globale
- `GET /api/admin/programmes/{id}/credits` - Config programme
- `POST /api/admin/programmes/{id}/credits` - Update programme
- `GET /api/admin/programmes/{id}/credits/validate` - Validation

### Format Réponse
```json
{
  "data": [
    {
      "id": 1,
      "program_id": null,
      "level": "L1",
      "semester_1_credits": 30,
      "semester_2_credits": 30,
      "total_credits": 60,
      "created_at": "2026-01-10T...",
      "updated_at": "2026-01-10T..."
    }
  ]
}
```

### Format Validation
```json
{
  "data": {
    "L1": {
      "configured_credits": 60,
      "modules_credits": 58,
      "status": "KO",
      "gap": 2
    }
  }
}
```

## 📝 Notes Techniques

### Multi-Tenancy
- Toutes les requêtes utilisent `createApiClient(tenantId)`
- Isolation automatique des configurations par tenant

### Performance
- Hooks avec `useCallback` pour éviter re-renders
- Validation on-demand (pas automatique)
- Cache côté serveur (TTL 1h selon backend)

### Accessibilité
- Labels ARIA sur tous les champs
- Tooltips informatifs
- Feedback visuel clair (couleurs, icônes)

### Responsive
- Grilles MUI adaptatives
- Dialogues fullWidth sur mobile
- Tableaux scrollables

## ✅ Critères d'Acceptation Story

- [x] Paramétrage global: crédits requis par niveau
- [x] Valeurs par défaut: 60 crédits/année (30+30)
- [x] Possibilité de personnaliser par programme
- [x] Validation: total crédits >= somme modules
- [x] Crédits S1 + S2 = Total année
- [x] Configuration indépendante par semestre
- [x] Alerte si répartition déséquilibrée
- [x] Calcul automatique crédits modules
- [x] Comparaison configurés vs modules
- [x] Blocage activation si incohérence
- [x] Rapport détaillé avec écarts
- [x] Tableau récapitulatif avec statuts
- [x] Indicateurs visuels OK/KO

## 🎯 Prochaines Étapes

### Phase 2 (Optionnel)
- [ ] Export PDF de la maquette avec crédits
- [ ] Documentation normes LMD intégrée
- [ ] Historique des modifications de configuration
- [ ] Notifications lors de changements

### Intégration
- [ ] Ajouter routes Next.js pour les pages
- [ ] Intégrer dans le menu de navigation
- [ ] Tester avec données réelles
- [ ] Validation E2E complète

---

**Implémentation complète et prête pour intégration!** 🎉
