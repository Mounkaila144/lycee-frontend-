# Module Structure Académique

Module de gestion de la structure académique (programmes, niveaux, modules, semestres, spécialités).

## 📁 Structure

```
StructureAcademique/
├── admin/                      # Fonctionnalités admin
│   ├── components/            # Composants UI
│   │   ├── ProgrammeList.tsx
│   │   ├── ProgrammeListTable.tsx
│   │   ├── ProgrammeFilters.tsx
│   │   ├── ProgrammeFormDialog.tsx
│   │   └── ProgrammeDeleteDialog.tsx
│   ├── hooks/                 # Custom hooks
│   │   ├── useProgrammes.ts
│   │   └── useProgrammeMutations.ts
│   ├── services/              # Services API
│   │   └── programmeService.ts
│   └── index.ts               # Barrel exports
├── types/                     # TypeScript types
│   ├── programme.types.ts
│   └── index.ts
├── index.ts                   # Module exports
├── menu.config.ts             # Configuration menu
└── README.md                  # Documentation
```

## 🚀 Utilisation

### Importer le composant principal

```typescript
import { ProgrammeList } from '@/modules/StructureAcademique';

export default function ProgrammesPage() {
  return <ProgrammeList />;
}
```

### Utiliser les hooks

```typescript
import { useProgrammes, useProgrammeMutations } from '@/modules/StructureAcademique';

const MyComponent = () => {
  const { programmes, loading, error, refetch } = useProgrammes();
  const { createProgramme, updateProgramme, deleteProgramme } = useProgrammeMutations();

  // ...
};
```

### Utiliser le service directement

```typescript
import { programmeService } from '@/modules/StructureAcademique';

const programmes = await programmeService.getProgrammes({ type: 'Licence' });
```

## 📋 Stories Implémentées

### ✅ Story 01 : CRUD Programmes (Complété)
- Liste paginée avec filtres (type, statut, recherche)
- Création de programme
- Modification de programme
- Suppression logique
- Changement de statut

### ⏳ Stories à venir
- Story 02 : Activation/Désactivation avec contrôles
- Story 03 : Historisation des modifications
- Story 04 : Import/Export CSV/Excel
- Story 05-18 : Niveaux, Modules, Semestres, Spécialités, Rapports

## 🎨 Composants

### ProgrammeList
Composant principal qui affiche la liste des programmes avec filtres et actions.

**Props**: Aucune

**Features**:
- Filtrage par type, statut, recherche
- Pagination
- Actions CRUD (Créer, Modifier, Supprimer)
- Actualisation

### ProgrammeFormDialog
Dialog pour créer ou modifier un programme.

**Props**:
- `open: boolean` - État d'ouverture du dialog
- `onClose: () => void` - Callback de fermeture
- `onSuccess: () => void` - Callback de succès
- `programme?: Programme` - Programme à modifier (optionnel)

### ProgrammeDeleteDialog
Dialog de confirmation de suppression.

**Props**:
- `open: boolean` - État d'ouverture du dialog
- `onClose: () => void` - Callback de fermeture
- `onSuccess: () => void` - Callback de succès
- `programme: Programme` - Programme à supprimer

## 🔌 API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/admin/programmes` | Liste des programmes |
| POST | `/admin/programmes` | Créer un programme |
| GET | `/admin/programmes/{id}` | Détails d'un programme |
| PUT | `/admin/programmes/{id}` | Modifier un programme |
| DELETE | `/admin/programmes/{id}` | Supprimer un programme |
| PATCH | `/admin/programmes/{id}/status` | Changer le statut |
| GET | `/admin/programmes/statistics` | Statistiques |

## 🎯 Types

### Programme
```typescript
interface Programme {
  id: number;
  code: string;
  libelle: string;
  type: 'Licence' | 'Master' | 'Doctorat';
  duree_annees: number;
  description?: string;
  responsable_id?: number;
  statut: 'Brouillon' | 'Actif' | 'Inactif' | 'Archivé';
  created_at: string;
  updated_at: string;
  // Relations et metadata...
}
```

## 🔐 Permissions

- `programmes.view` - Voir les programmes
- `programmes.create` - Créer un programme
- `programmes.update` - Modifier un programme
- `programmes.delete` - Supprimer un programme
- `programmes.activate` - Activer/désactiver un programme

## 📝 Notes

- Le module utilise le contexte `TenantContext` pour l'isolation multi-tenant
- Tous les appels API passent par `createApiClient()` qui gère automatiquement les headers
- Les composants suivent les standards MUI + TypeScript du projet
- Les formulaires utilisent la validation côté client et serveur

## 🐛 Troubleshooting

### Erreur 401 lors des appels API
Vérifier que le token d'authentification est présent dans localStorage.

### Programmes non affichés
Vérifier que le `tenantId` est correctement défini dans le contexte.

### Erreur de validation
Vérifier que les données du formulaire respectent les contraintes backend.
