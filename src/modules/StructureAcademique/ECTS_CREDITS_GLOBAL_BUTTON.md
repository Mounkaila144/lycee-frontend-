# Configuration Globale ECTS - Bouton dans Page Programmes

## Changement Implémenté

**Avant**: Menu séparé "Configuration Crédits ECTS" 🏅 dans la sidebar

**Après**: Bouton "Configuration Globale ECTS" directement dans la page de liste des programmes

## Modifications Apportées

### 1. Suppression du Menu
**Fichier**: `src/modules/StructureAcademique/menu.config.ts`

**Supprimé**:
```typescript
{
  id: 'structure-credits-ects',
  label: 'Configuration Crédits ECTS',
  route: '/admin/structure/credits',
  icon: {
    type: 'emoji',
    value: '🏅',
  },
  order: 3,
  // ...
}
```

**Résultat**: Le menu "Configuration Crédits ECTS" n'apparaît plus dans la sidebar

### 2. Nouveau Composant: GlobalCreditConfigDialog
**Fichier**: `src/modules/StructureAcademique/admin/components/GlobalCreditConfigDialog.tsx`

Un modal pour la configuration globale des crédits ECTS:

**Caractéristiques**:
- ✅ Dialog fullWidth avec maxWidth="lg"
- ✅ Affiche les 5 niveaux (L1-M2)
- ✅ Permet de configurer les crédits par niveau
- ✅ Message d'info sur les normes LMD
- ✅ Dialog imbriqué pour éditer les crédits d'un niveau
- ✅ Bouton "Fermer" pour fermer le modal

**Structure**:
```typescript
interface GlobalCreditConfigDialogProps {
  open: boolean;
  onClose: () => void;
}
```

### 3. Ajout du Bouton dans ProgrammeListTable
**Fichier**: `src/modules/StructureAcademique/admin/components/ProgrammeListTable.tsx`

**Ajouts**:
```typescript
// Import du nouveau dialog
import GlobalCreditConfigDialog from './GlobalCreditConfigDialog'

// Nouvel état
const [globalCreditConfigDialogOpen, setGlobalCreditConfigDialogOpen] = useState(false)

// Nouveaux handlers
const handleOpenGlobalCreditConfigDialog = useCallback(() => {
  setGlobalCreditConfigDialogOpen(true)
}, [])

const handleCloseGlobalCreditConfigDialog = useCallback(() => {
  setGlobalCreditConfigDialogOpen(false)
}, [])
```

**Bouton ajouté dans les actions**:
```typescript
actions: [
  {
    label: t('Ajouter'),
    icon: 'ri-add-line',
    color: 'primary',
    onClick: handleOpenAddDialog,
    disabled: loading
  },
  {
    label: 'Configuration Globale ECTS', // ✅ NOUVEAU
    icon: 'ri-medal-line',
    color: 'secondary',
    onClick: handleOpenGlobalCreditConfigDialog,
    disabled: loading
  },
  {
    label: t('Importer'),
    icon: 'ri-upload-line',
    color: 'secondary',
    onClick: handleOpenImportDialog,
    disabled: loading
  },
  {
    label: t('Exporter'),
    icon: 'ri-download-line',
    color: 'info',
    onClick: handleOpenExportDialog,
    disabled: loading
  }
]
```

**Dialog ajouté dans le render**:
```typescript
{/* Global Credit Configuration Dialog */}
<GlobalCreditConfigDialog
  open={globalCreditConfigDialogOpen}
  onClose={handleCloseGlobalCreditConfigDialog}
/>
```

### 4. Export du Nouveau Composant
**Fichier**: `src/modules/StructureAcademique/admin/index.ts`

```typescript
export { default as GlobalCreditConfigDialog } from './components/GlobalCreditConfigDialog';
```

## Comportement Utilisateur

### Workflow Complet

1. **Utilisateur va sur la page Programmes**
2. **Voit le bouton "Configuration Globale ECTS"** 🏅 dans la barre d'actions (en haut)
3. **Clique sur le bouton**
4. **Modal s'ouvre** avec le titre "Configuration Globale des Crédits ECTS"
5. **Voit les 5 niveaux** (L1, L2, L3, M1, M2) avec leurs crédits
6. **Clique sur éditer** (icône crayon) pour un niveau
7. **Dialog imbriqué s'ouvre** pour configurer S1 et S2
8. **Modifie les crédits** et clique "Enregistrer"
9. **Dialog imbriqué se ferme**, tableau se met à jour
10. **Clique "Fermer"** pour fermer le modal principal
11. **Retour à la liste** des programmes

### Position du Bouton

Le bouton "Configuration Globale ECTS" apparaît dans la barre d'actions en haut de la page, entre "Ajouter" et "Importer":

```
┌─────────────────────────────────────────────────────────┐
│  Programmes                                              │
├─────────────────────────────────────────────────────────┤
│  [+ Ajouter] [🏅 Configuration Globale ECTS] [↑ Importer] [↓ Exporter]  │
│                                                          │
│  [Recherche...]                                          │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Tableau des programmes                           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Comparaison Avant/Après

### Avant (Menu Séparé)

```
Sidebar Menu
├── Structure Académique
│   ├── Programmes
│   ├── Niveaux
│   ├── Configuration Crédits ECTS 🏅 ← Menu séparé
│   ├── Modules/UE
│   ├── Semestres
│   └── Spécialités

Workflow:
1. Cliquer sur "Configuration Crédits ECTS" dans le menu
2. Navigation vers /admin/structure/credits
3. Page dédiée se charge
4. Configuration des crédits
5. Navigation retour vers Programmes
```

### Après (Bouton dans Page)

```
Sidebar Menu
├── Structure Académique
│   ├── Programmes
│   ├── Niveaux
│   ├── Modules/UE
│   ├── Semestres
│   └── Spécialités

Page Programmes:
[+ Ajouter] [🏅 Configuration Globale ECTS] [↑ Importer] [↓ Exporter]

Workflow:
1. Sur la page Programmes
2. Cliquer sur "Configuration Globale ECTS"
3. Modal s'ouvre (pas de navigation)
4. Configuration des crédits
5. Fermer le modal
6. Toujours sur la page Programmes
```

## Avantages

✅ **Moins de navigation**: Pas besoin de changer de page
✅ **Contexte préservé**: Reste sur la page Programmes
✅ **Accès rapide**: Bouton visible directement
✅ **Cohérence**: Même pattern que les autres actions (modal)
✅ **Menu simplifié**: Moins d'items dans la sidebar
✅ **UX améliorée**: Workflow plus fluide

## Architecture Finale

```
Configuration Crédits ECTS
│
├── Configuration Globale (Modal dans page Programmes)
│   ├── Déclencheur: Bouton "Configuration Globale ECTS" 🏅
│   ├── Composant: GlobalCreditConfigDialog
│   ├── Affiche: Tous les 5 niveaux (L1-M2)
│   └── Utilité: Valeurs par défaut pour tous les programmes
│
└── Configuration Programme (Modal dans liste)
    ├── Déclencheur: Bouton 🏅 dans la ligne du programme
    ├── Composant: ProgrammeCreditConfigDialog
    ├── Affiche: Uniquement les niveaux du programme
    └── Utilité: Override des valeurs globales pour un programme spécifique
```

## Fichiers Créés

1. `src/modules/StructureAcademique/admin/components/GlobalCreditConfigDialog.tsx` (nouveau)

## Fichiers Modifiés

1. `src/modules/StructureAcademique/menu.config.ts`
   - Suppression du menu "Configuration Crédits ECTS"

2. `src/modules/StructureAcademique/admin/components/ProgrammeListTable.tsx`
   - Import du nouveau dialog
   - Ajout de l'état `globalCreditConfigDialogOpen`
   - Ajout des handlers `handleOpenGlobalCreditConfigDialog` et `handleCloseGlobalCreditConfigDialog`
   - Ajout du bouton "Configuration Globale ECTS" dans les actions
   - Ajout du dialog dans le render

3. `src/modules/StructureAcademique/admin/index.ts`
   - Export du nouveau composant `GlobalCreditConfigDialog`

## Tests à Effectuer

### ✅ Test 1: Menu Supprimé
1. Ouvrir la sidebar
2. Aller dans "Structure Académique"
3. ✅ **Vérifier**: Pas de menu "Configuration Crédits ECTS"
4. ✅ **Vérifier**: Menus visibles: Programmes, Niveaux, Modules/UE, Semestres, Spécialités

### ✅ Test 2: Bouton Visible
1. Aller sur la page Programmes
2. ✅ **Vérifier**: Bouton "Configuration Globale ECTS" 🏅 visible en haut
3. ✅ **Vérifier**: Bouton entre "Ajouter" et "Importer"

### ✅ Test 3: Modal Fonctionne
1. Cliquer sur "Configuration Globale ECTS"
2. ✅ **Vérifier**: Modal s'ouvre (pas de navigation)
3. ✅ **Vérifier**: Titre "Configuration Globale des Crédits ECTS"
4. ✅ **Vérifier**: 5 niveaux affichés (L1-M2)
5. Configurer un niveau
6. ✅ **Vérifier**: Sauvegarde fonctionne
7. Fermer le modal
8. ✅ **Vérifier**: Retour à la liste des programmes

### ✅ Test 4: Ancienne URL Ne Fonctionne Plus
1. Essayer d'accéder à `/admin/structure/credits`
2. ✅ **Vérifier**: Page se charge toujours (page dédiée existe encore)
3. **Note**: La page `/admin/structure/credits` existe toujours mais n'est plus accessible via le menu

### ✅ Test 5: Configuration Programme Toujours Disponible
1. Dans la liste des programmes
2. Cliquer sur le bouton 🏅 d'un programme (dans la ligne)
3. ✅ **Vérifier**: Modal de configuration programme s'ouvre
4. ✅ **Vérifier**: Seuls les niveaux du programme sont affichés

## Note Importante

La page `/admin/structure/credits` existe toujours et fonctionne, mais elle n'est plus accessible via le menu. Elle peut être:
- Supprimée si vous ne voulez plus l'utiliser du tout
- Conservée comme page de secours accessible via URL directe
- Utilisée pour d'autres fonctionnalités futures

**Recommandation**: Garder la page pour l'instant, au cas où vous voudriez y accéder directement via URL.

## Résumé

✅ **Menu "Configuration Crédits ECTS" supprimé** de la sidebar
✅ **Bouton "Configuration Globale ECTS" ajouté** dans la page Programmes
✅ **Modal GlobalCreditConfigDialog créé** pour la configuration globale
✅ **Workflow simplifié**: Pas de navigation, modal au lieu de page
✅ **Cohérence**: Même pattern que les autres actions
✅ **Aucune erreur TypeScript**

La configuration globale des crédits ECTS est maintenant accessible directement depuis la page Programmes via un bouton dans la barre d'actions! 🎉
