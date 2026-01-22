# 🎯 Intégration des Menus - Module Enrollment

## ✅ Modifications effectuées

### 1. Création du fichier de configuration menu ✅
**Fichier**: `src/modules/Enrollment/menu.config.ts`

Configuration du menu principal "Inscriptions" avec 5 sous-menus:
- 👨‍🎓 **Étudiants** → `/admin/enrollment/students`
- 📋 **Inscription Administrative** → `/admin/enrollment/administrative`
- 📚 **Inscription Pédagogique** → `/admin/enrollment/pedagogical`
- 👥 **Affectation Groupes** → `/admin/enrollment/groups`
- 📊 **Statistiques** → `/admin/enrollment/statistics`

### 2. Export dans index.ts du module ✅
**Fichier**: `src/modules/Enrollment/index.ts`

```typescript
export { enrollmentMenuConfig } from './menu.config';
```

### 3. Enregistrement dans menu-registry.ts ✅
**Fichier**: `src/shared/config/menu-registry.ts`

**Ajout ligne 15**:
```typescript
import { enrollmentMenuConfig } from '@/modules/Enrollment/menu.config';
```

**Ajout ligne 30**:
```typescript
const moduleMenuConfigs: ModuleMenuConfig[] = [
  dashboardMenuConfig,
  usersGuardMenuConfig,
  superAdminMenuConfig,
  structureAcademiqueMenuConfig,
  enrollmentMenuConfig,  // ← NOUVEAU
  // Add more module menu configs here
];
```

---

## 📋 Menu Configuration Détails

### Menu Principal
```typescript
{
  id: 'enrollment',
  label: 'Inscriptions',
  route: '/admin/enrollment',
  icon: { type: 'emoji', value: '📝' },
  order: 20,
  module: 'Enrollment',
  roles: ['admin', 'superadmin', 'agent_inscription'],
  isVisible: true,
  isActive: true
}
```

### Sous-menus

#### 1. Étudiants
```typescript
{
  id: 'enrollment-students',
  label: 'Étudiants',
  route: '/admin/enrollment/students',
  icon: { type: 'emoji', value: '👨‍🎓' },
  order: 1,
  parentId: 'enrollment'
}
```

#### 2. Inscription Administrative
```typescript
{
  id: 'enrollment-administrative',
  label: 'Inscription Administrative',
  route: '/admin/enrollment/administrative',
  icon: { type: 'emoji', value: '📋' },
  order: 2,
  parentId: 'enrollment'
}
```

#### 3. Inscription Pédagogique
```typescript
{
  id: 'enrollment-pedagogical',
  label: 'Inscription Pédagogique',
  route: '/admin/enrollment/pedagogical',
  icon: { type: 'emoji', value: '📚' },
  order: 3,
  parentId: 'enrollment'
}
```

#### 4. Affectation Groupes
```typescript
{
  id: 'enrollment-groups',
  label: 'Affectation Groupes',
  route: '/admin/enrollment/groups',
  icon: { type: 'emoji', value: '👥' },
  order: 4,
  parentId: 'enrollment'
}
```

#### 5. Statistiques
```typescript
{
  id: 'enrollment-statistics',
  label: 'Statistiques',
  route: '/admin/enrollment/statistics',
  icon: { type: 'emoji', value: '📊' },
  order: 5,
  parentId: 'enrollment'
}
```

---

## 🔐 Contrôle d'accès

### Rôles autorisés
Le menu est visible pour les rôles suivants:
- `admin` - Administrateur général
- `superadmin` - Super administrateur
- `agent_inscription` - Agent d'inscription

### Modification des rôles
Pour modifier les rôles autorisés, éditer le fichier `menu.config.ts` et modifier la propriété `roles`:

```typescript
{
  id: 'enrollment',
  // ...
  roles: ['admin', 'superadmin', 'agent_inscription'], // ← Modifier ici
  // ...
}
```

---

## 🎨 Position dans le menu

Le menu "Inscriptions" apparaît à l'**ordre 20**, ce qui le place:
- **Après** "Structure Académique" (ordre 10)
- **Avant** les autres modules à venir

Pour changer la position, modifier la propriété `order` dans `menu.config.ts`:

```typescript
{
  id: 'enrollment',
  // ...
  order: 20, // ← Modifier ici (plus petit = plus haut dans le menu)
  // ...
}
```

---

## 🔄 Comment fonctionne le système de menus

### 1. Chargement des menus
```
menu-registry.ts
    ↓ importe
enrollmentMenuConfig
    ↓ ajoute à
moduleMenuConfigs[]
    ↓ utilisé par
getAllMenus()
    ↓ filtre par
getMenusByRole(userRole)
    ↓ affiche dans
Navigation Component
```

### 2. Fonctions utiles du registry

```typescript
// Récupérer tous les menus
const allMenus = getAllMenus();

// Récupérer les menus visibles
const visibleMenus = getVisibleMenus();

// Récupérer les menus pour un rôle spécifique
const adminMenus = getMenusByRole('admin');

// Récupérer les menus d'un module
const enrollmentMenus = getModuleMenus('Enrollment');

// Récupérer un menu par ID
const studentsMenu = getMenuById('enrollment-students');
```

---

## ✅ Vérification

Pour vérifier que les menus sont bien chargés:

### Dans le navigateur
1. Se connecter avec un compte `admin`, `superadmin` ou `agent_inscription`
2. Vérifier que le menu "Inscriptions" 📝 apparaît dans la navigation
3. Cliquer dessus pour voir les 5 sous-menus

### En console développeur
```javascript
// Ouvrir la console (F12)
import { getAllMenus } from '@/shared/config/menu-registry';

const menus = getAllMenus();
console.log('Tous les menus:', menus);

// Chercher le menu Enrollment
const enrollmentMenu = menus.find(m => m.id === 'enrollment');
console.log('Menu Enrollment:', enrollmentMenu);
```

---

## 🐛 Dépannage

### Les menus n'apparaissent pas?

1. **Vérifier le rôle de l'utilisateur connecté**
   - Le menu est visible uniquement pour: `admin`, `superadmin`, `agent_inscription`

2. **Vider le cache du navigateur**
   - `Ctrl + Shift + R` (Windows/Linux)
   - `Cmd + Shift + R` (Mac)

3. **Redémarrer le serveur de développement**
   ```bash
   # Arrêter le serveur (Ctrl+C)
   pnpm dev
   ```

4. **Vérifier les erreurs dans la console**
   - Ouvrir DevTools (F12)
   - Onglet Console
   - Chercher des erreurs d'import

5. **Vérifier que les fichiers ont été modifiés correctement**
   - `src/shared/config/menu-registry.ts` contient l'import
   - Le module est ajouté au tableau `moduleMenuConfigs`
   - `src/modules/Enrollment/index.ts` exporte le config

---

## 📝 Résumé

✅ Menu configuration créé
✅ Exporté dans index.ts du module
✅ Importé dans menu-registry.ts
✅ Ajouté au tableau moduleMenuConfigs
✅ 5 sous-menus configurés
✅ Contrôle d'accès par rôles configuré
✅ Documentation complète

Le menu "Inscriptions" devrait maintenant apparaître dans la navigation de l'application! 🎉
