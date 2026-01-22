# 📦 Enregistrement des Composants - Module Enrollment

## ✅ Modifications effectuées

### 1. Création du composant Students ✅
**Fichier**: `src/modules/Enrollment/admin/components/Students.tsx`

Ce composant est une page wrapper qui combine StudentList et StudentListTable:

```tsx
'use client';

import { StudentList } from './StudentList';
import { StudentListTable } from './StudentListTable';

export const Students = () => {
  return (
    <StudentList>
      <StudentListTable />
    </StudentList>
  );
};
```

### 2. Export dans index.ts ✅
**Fichier**: `src/modules/Enrollment/admin/components/index.ts`

```tsx
export { Students } from './Students';
export { StudentList } from './StudentList';
export { StudentListTable } from './StudentListTable';
// ...
```

### 3. Import dans component-registry.ts ✅
**Fichier**: `src/shared/config/component-registry.ts`

```tsx
import { Students } from '@/modules/Enrollment/admin/components/Students'
```

### 4. Enregistrement dans le registre ✅
**Fichier**: `src/shared/config/component-registry.ts`

```tsx
export const adminComponentRegistry: Record<string, ComponentType<any>> = {
  // Users module
  'Users:UsersList': UsersList,

  // Enrollment module
  'Enrollment:Students': Students,  // ← NOUVEAU
}
```

---

## 🔄 Comment fonctionne le Component Registry

### Architecture de routing dynamique

L'application utilise un système de routing dynamique basé sur le component-registry:

```
URL: /admin/enrollment/students
     ↓
Parse route segments:
  - Context: admin
  - Module: enrollment → Enrollment
  - Component: students → Students
     ↓
Build registry key: "Enrollment:Students"
     ↓
Lookup in adminComponentRegistry
     ↓
Trouve: Students component
     ↓
Render: <Students />
```

### Format des clés

Les clés dans le registre suivent le format:
```
'ModuleName:ComponentName'
```

**Exemples**:
- `'Enrollment:Students'` → Page liste étudiants
- `'Enrollment:Administrative'` → Page inscription administrative
- `'Users:UsersList'` → Page liste utilisateurs

### Conventions de nommage

1. **Module Name**: PascalCase (première lettre majuscule)
   - `Enrollment` ✅
   - `enrollment` ❌

2. **Component Name**: PascalCase (première lettre majuscule)
   - `Students` ✅
   - `students` ❌

3. **Le nom du composant doit correspondre au segment d'URL**:
   - URL: `/admin/enrollment/students` → Composant: `Students`
   - URL: `/admin/enrollment/administrative` → Composant: `Administrative`

---

## 📋 Mapping URL → Composant

| URL | Module | Composant | Clé Registry |
|-----|--------|-----------|--------------|
| `/admin/enrollment/students` | Enrollment | Students | `Enrollment:Students` |
| `/admin/enrollment/administrative` | Enrollment | Administrative | `Enrollment:Administrative` |
| `/admin/enrollment/pedagogical` | Enrollment | Pedagogical | `Enrollment:Pedagogical` |
| `/admin/enrollment/groups` | Enrollment | Groups | `Enrollment:Groups` |
| `/admin/enrollment/statistics` | Enrollment | Statistics | `Enrollment:Statistics` |

---

## 🛠️ Ajouter un nouveau composant de page

Pour ajouter une nouvelle page dynamique, suivez ces étapes:

### Étape 1: Créer le composant

**Fichier**: `src/modules/YourModule/admin/components/YourComponent.tsx`

```tsx
'use client';

export const YourComponent = () => {
  return (
    <div>
      <h1>Your Component</h1>
      {/* Votre contenu */}
    </div>
  );
};
```

### Étape 2: Exporter le composant

**Fichier**: `src/modules/YourModule/admin/components/index.ts`

```tsx
export { YourComponent } from './YourComponent';
```

### Étape 3: Importer dans le registry

**Fichier**: `src/shared/config/component-registry.ts`

```tsx
import { YourComponent } from '@/modules/YourModule/admin/components/YourComponent'
```

### Étape 4: Enregistrer dans le registre

**Fichier**: `src/shared/config/component-registry.ts`

```tsx
export const adminComponentRegistry: Record<string, ComponentType<any>> = {
  // ... autres composants
  'YourModule:YourComponent': YourComponent,
}
```

### Étape 5: Ajouter la route dans menu.config.ts

**Fichier**: `src/modules/YourModule/menu.config.ts`

```tsx
{
  id: 'your-module-your-component',
  label: 'Your Label',
  route: '/admin/your-module/your-component',  // ← Le segment 'your-component' doit correspondre à YourComponent
  // ...
}
```

---

## 🐛 Dépannage

### Erreur: "Component not found"

**Problème**: Le composant n'est pas trouvé dans le registry.

**Solutions**:

1. **Vérifier le nom du composant**
   - Le nom doit être exactement le même que le segment d'URL (en PascalCase)
   - URL `/students` → Composant `Students`
   - URL `/student-list` → Composant `StudentList`

2. **Vérifier l'import dans component-registry.ts**
   ```tsx
   import { Students } from '@/modules/Enrollment/admin/components/Students'
   ```

3. **Vérifier l'enregistrement**
   ```tsx
   'Enrollment:Students': Students,  // Clé doit être 'Module:Component'
   ```

4. **Vérifier que le composant est exporté**
   ```tsx
   // Dans index.ts
   export { Students } from './Students';
   ```

5. **Redémarrer le serveur**
   ```bash
   # Ctrl+C puis
   pnpm dev
   ```

### Erreur: Import path incorrect

**Problème**: Le chemin d'import ne correspond pas au fichier réel.

**Solution**:
```tsx
// ❌ MAUVAIS
import { Students } from '@/modules/Enrollment/admin/Students'

// ✅ BON
import { Students } from '@/modules/Enrollment/admin/components/Students'
```

### Le composant s'affiche mais avec erreurs

**Problème**: Le composant est trouvé mais il y a des erreurs à l'intérieur.

**Solution**: Vérifier les dépendances et imports du composant lui-même.

---

## 📝 Checklist pour un nouveau composant de page

- [ ] Composant créé dans `admin/components/`
- [ ] Composant exporté dans `admin/components/index.ts`
- [ ] Import ajouté dans `component-registry.ts`
- [ ] Clé ajoutée dans `adminComponentRegistry`
- [ ] Format de clé correct: `'ModuleName:ComponentName'`
- [ ] Nom de composant en PascalCase
- [ ] Route ajoutée dans `menu.config.ts`
- [ ] Segment d'URL correspond au nom du composant
- [ ] Serveur redémarré
- [ ] Page testée dans le navigateur

---

## 🎯 Résumé pour le module Enrollment

✅ **Composant créé**: `Students.tsx`
✅ **Exporté**: Dans `admin/components/index.ts`
✅ **Importé**: Dans `component-registry.ts`
✅ **Enregistré**: Clé `'Enrollment:Students'`
✅ **Route**: `/admin/enrollment/students`
✅ **Menu**: Configuré dans `menu.config.ts`

**La page devrait maintenant être accessible!** 🎉

### Test de la page

1. Se connecter à l'application
2. Naviguer vers: `http://tenant1.local/en/admin/enrollment/students`
3. Vérifier que la liste des étudiants s'affiche
4. Tester les fonctionnalités CRUD

---

## 🔗 Ressources

- [component-registry.ts](../../shared/config/component-registry.ts) - Registry central
- [Students.tsx](./admin/components/Students.tsx) - Composant page
- [menu.config.ts](./menu.config.ts) - Configuration menu
- [README.md](./README.md) - Documentation module

---

**Note**: Le component-registry est nécessaire car Next.js ne peut pas résoudre les imports dynamiques avec template literals. C'est une limitation de webpack qui nécessite cette approche de registry.
