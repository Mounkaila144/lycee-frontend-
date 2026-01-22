# Module Enrollment (Inscriptions)

## Vue d'ensemble

Le module **Enrollment** gère l'ensemble du processus d'inscription des étudiants, de la création du dossier administratif à l'inscription pédagogique. Ce module est au cœur du système de gestion académique et assure le suivi complet des étudiants.

## Statut d'implémentation

### ✅ Story 01 - Création Dossier Étudiant (Frontend)

**Backend**: ✅ Complètement implémenté (API opérationnelle)
**Frontend**: ✅ Implémenté

#### Fonctionnalités implémentées

- ✅ Création de dossier étudiant avec informations complètes
- ✅ Génération automatique du matricule (format: YYYY-CODE-XXX)
- ✅ Formulaire avec validation complète (frontend + backend)
- ✅ Gestion des informations personnelles
- ✅ Gestion des coordonnées
- ✅ Contact d'urgence
- ✅ Affectation au programme
- ✅ Liste paginée des étudiants avec recherche
- ✅ Modification de dossier
- ✅ Suppression (soft delete)
- ✅ Support multilingue (FR, EN, AR)

## Structure du module

```
src/modules/Enrollment/
├── admin/
│   ├── components/
│   │   ├── StudentList.tsx              # Container avec context
│   │   ├── StudentListTable.tsx         # Table avec colonnes configurables
│   │   ├── StudentFormDialog.tsx        # Formulaire création/édition
│   │   ├── StudentDeleteDialog.tsx      # Dialogue de confirmation
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useStudents.ts               # Hook pour liste paginée
│   │   ├── useStudentMutations.ts       # Hook pour CRUD
│   │   └── index.ts
│   ├── services/
│   │   └── studentService.ts            # Service API
│   └── index.ts
├── types/
│   ├── student.types.ts                 # Types TypeScript
│   └── index.ts
├── translations/
│   ├── fr.json                          # Traductions françaises
│   ├── en.json                          # Traductions anglaises
│   └── ar.json                          # Traductions arabes
├── menu.config.ts                       # Configuration menu
├── index.ts                             # Exports principaux
└── README.md                            # Cette documentation
```

## API Backend

### Endpoints disponibles

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/admin/enrollment/students` | Liste paginée avec filtres |
| POST | `/api/admin/enrollment/students` | Créer un étudiant |
| GET | `/api/admin/enrollment/students/{id}` | Détails étudiant |
| PUT | `/api/admin/enrollment/students/{id}` | Modifier étudiant |
| DELETE | `/api/admin/enrollment/students/{id}` | Supprimer (soft delete) |
| POST | `/api/admin/enrollment/students/{id}/documents` | Upload document |
| GET | `/api/admin/enrollment/students/{id}/check-completeness` | Vérifier complétude |
| GET | `/api/admin/enrollment/students/{id}/audit-log` | Historique modifications |
| POST | `/api/admin/enrollment/students/check-duplicates` | Détecter doublons |
| GET | `/api/admin/enrollment/students/search/autocomplete` | Autocomplete |
| GET | `/api/admin/enrollment/students/export` | Export Excel |
| GET | `/api/admin/enrollment/students/statistics/summary` | Statistiques |

## Utilisation

### 1. Afficher la liste des étudiants

```tsx
import { StudentList, StudentListTable } from '@/modules/Enrollment';

function StudentsPage() {
  return (
    <StudentList>
      <StudentListTable />
    </StudentList>
  );
}
```

### 2. Utiliser le hook useStudents

```tsx
import { useStudents } from '@/modules/Enrollment';

function MyComponent() {
  const {
    students,
    loading,
    error,
    pagination,
    setPage,
    setSearch,
    setFilters,
    refresh
  } = useStudents({
    page: 1,
    per_page: 10,
    status: 'Actif'
  });

  return (
    // Votre composant
  );
}
```

### 3. Utiliser le hook useStudentMutations

```tsx
import { useStudentMutations } from '@/modules/Enrollment';

function MyComponent() {
  const {
    createStudent,
    updateStudent,
    deleteStudent,
    loading,
    error
  } = useStudentMutations();

  const handleCreate = async (data) => {
    try {
      const student = await createStudent(data);
      console.log('Student created:', student);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    // Votre composant
  );
}
```

### 4. Service API direct

```tsx
import { studentService } from '@/modules/Enrollment';

// Récupérer les étudiants
const response = await studentService.getStudents('tenant-id', {
  page: 1,
  per_page: 10,
  search: 'John',
  status: 'Actif'
});

// Créer un étudiant
const student = await studentService.create({
  firstname: 'John',
  lastname: 'Doe',
  email: 'john@example.com',
  // ...
}, 'tenant-id');

// Vérifier la complétude
const completeness = await studentService.checkCompleteness(studentId, 'tenant-id');
```

## Types disponibles

### Student
```typescript
interface Student {
  id: number;
  matricule: string;
  firstname: string;
  lastname: string;
  birthdate: string;
  birthplace: string;
  sex: 'M' | 'F' | 'O';
  email: string;
  mobile: string;
  phone?: string;
  address?: string;
  city?: string;
  country: string;
  nationality: string;
  status: 'Actif' | 'Suspendu' | 'Exclu' | 'Diplômé';
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
  updated_at: string;
  programme?: {
    id: number;
    name: string;
    code: string;
  };
}
```

### StudentFormData
```typescript
interface StudentFormData {
  firstname: string;
  lastname: string;
  birthdate: string;
  birthplace: string;
  sex: 'M' | 'F' | 'O';
  email: string;
  mobile: string;
  phone?: string;
  address?: string;
  city?: string;
  country: string;
  nationality: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  programme_id: number;
}
```

### StudentFilters
```typescript
interface StudentFilters {
  search?: string;
  status?: StudentStatus;
  programme_id?: number;
  sex?: Sex;
  nationality?: string;
  year_enrolled?: number;
}
```

## Validations

### Frontend
- Prénom, nom: requis, max 255 caractères
- Email: requis, format valide, unique
- Mobile: requis, format international (+227...)
- Date de naissance: requis, âge entre 15 et 60 ans
- Lieu de naissance: requis
- Programme: requis

### Backend
- Validation identique + vérifications en base
- Génération automatique du matricule
- Détection de doublons potentiels
- Validation MIME types pour uploads

## Sécurité

- ✅ Authentification requise (TenantSanctumAuth middleware)
- ✅ Isolation multi-tenant
- ✅ Soft deletes pour traçabilité
- ✅ Audit log des modifications
- ⏳ Permissions basées sur les rôles (à implémenter)

## Configuration du menu

Le menu est configuré dans `menu.config.ts` et inclut:

- **Étudiants** (`/admin/enrollment/students`)
- **Inscription Administrative** (`/admin/enrollment/administrative`)
- **Inscription Pédagogique** (`/admin/enrollment/pedagogical`)
- **Affectation Groupes** (`/admin/enrollment/groups`)
- **Statistiques** (`/admin/enrollment/statistics`)

## Traductions

Les traductions sont disponibles en 3 langues:
- Français (fr.json)
- Anglais (en.json)
- Arabe (ar.json)

Utilisation:
```tsx
import { useTranslation } from '@/shared/i18n';

const { t } = useTranslation('Enrollment');

// Utilisation
<h1>{t('students.title')}</h1>
```

## Prochaines stories (Epic 1)

- [ ] **Story 02** - Modification Dossier (interface UI déjà implémentée)
- [ ] **Story 03** - Recherche et Consultation
- [ ] **Story 04** - Gestion des Statuts
- [ ] **Story 05** - Import Masse CSV

## Epic 2 - Inscription Pédagogique

- [ ] **Story 06** - Inscription aux Modules
- [ ] **Story 07** - Choix Options
- [ ] **Story 08** - Affectation Groupes
- [ ] **Story 09** - Validation Inscription
- [ ] **Story 10** - Génération Carte Étudiant

## Notes techniques

### Multi-tenancy
Tous les appels API utilisent le `tenantId` du contexte pour garantir l'isolation des données.

### Pagination serveur
La pagination est gérée côté serveur avec support de:
- Taille de page configurable
- Navigation par page
- Total d'enregistrements
- Métadonnées de pagination

### État de chargement
Tous les hooks gèrent les états de chargement, erreur et succès pour une meilleure UX.

### Mobile responsive
Les composants utilisent le système DataTable qui bascule automatiquement en mode carte sur mobile.

## Dépendances

### Modules requis
- **StructureAcademique** - Pour la sélection des programmes

### Packages externes
- `@mui/material` - Composants UI
- `@tanstack/react-table` - Tables avancées
- `axios` - Client HTTP

## Tests

### Backend
```bash
cd C:\laragon\www\crm-api
php artisan test tests/Feature/Enrollment/StudentApiTest.php
# 15 tests, 100+ assertions - ALL PASS
```

### Frontend
Tests à implémenter avec Jest + React Testing Library

## Support

Pour toute question ou problème:
1. Consulter la documentation backend dans `docs/stories/inscriptions.*.story.md`
2. Vérifier les types dans `src/modules/Enrollment/types/`
3. Consulter les exemples d'utilisation ci-dessus

## Changelog

### v1.0.0 - 2025-01-18
- ✅ Implémentation initiale Story 01
- ✅ CRUD complet étudiants (frontend)
- ✅ Integration avec backend API
- ✅ Support multilingue
- ✅ Configuration menu
- ✅ Documentation complète
