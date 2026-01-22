# 🎨 Guide Visuel - Bouton "Manage Modules"

## ✅ Intégration Terminée !

Le bouton **"Manage Modules"** est maintenant visible dans votre liste de spécialisations.

---

## 📍 Où le Trouver ?

### Navigation
```
Menu → Structure Académique → Specializations
```

### Dans la Liste
Chaque ligne de spécialisation affiche maintenant **3 boutons d'action** :

```
┌─────────────────────────────────────────────────────────────────────┐
│ Code │ Name │ Programme │ Level │ Type │ ... │ Actions              │
├─────────────────────────────────────────────────────────────────────┤
│ SP01 │ IA   │ INFO-L3   │ L3    │ Opt  │ ... │ [📚] [✏️] [🗑️]      │
│ SP02 │ Web  │ INFO-L3   │ L3    │ Opt  │ ... │ [📚] [✏️] [🗑️]      │
└─────────────────────────────────────────────────────────────────────┘
                                                    ↑
                                            NOUVEAU BOUTON !
```

---

## 🔵 Le Nouveau Bouton

### Apparence
- **Icône** : 📚 (livre) - `ri-book-line`
- **Couleur** : **Bleu** (primary)
- **Position** : Premier bouton (avant Edit et Delete)
- **Tooltip** : "Manage Modules" (au survol)

### Code Technique
```typescript
<Tooltip title="Manage Modules">
  <IconButton size="small" color="primary" onClick={() => onManageModules(spec)}>
    <i className="ri-book-line" />
  </IconButton>
</Tooltip>
```

---

## 🎬 Que Se Passe-t-il au Clic ?

### 1. Ouverture du Dialog
```
┌──────────────────────────────────────────────────────────┐
│ Modules de Spécialité - [Nom de la Spécialité]    [X]   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ℹ️ Information                                           │
│ ┌────────────────────────────────────────────────────┐  │
│ │ • Modules Obligatoires: tous les étudiants        │  │
│ │ • Modules Optionnels: choix selon contraintes     │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ Ajouter un module à la spécialité                       │
│ ┌────────────────────────────────────────────────────┐  │
│ │ [Sélectionner un module ▼]                         │  │
│ │                                                     │  │
│ │ Type: [Obligatoire ▼]  Capacité: [___]  [Ajouter] │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ [Obligatoires (2)] [Optionnels (3)]                │  │
│ ├────────────────────────────────────────────────────┤  │
│ │                                                     │  │
│ │ 📘 MOD001 - Algorithmique Avancée                  │  │
│ │    [Obligatoire] 6 ECTS                      [🗑️] │  │
│ │                                                     │  │
│ │ 📘 MOD002 - Intelligence Artificielle              │  │
│ │    [Obligatoire] 6 ECTS                      [🗑️] │  │
│ │                                                     │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│                                            [Fermer]      │
└──────────────────────────────────────────────────────────┘
```

---

## 🧪 Test Rapide

### Étape 1: Vérifier le Bouton
1. Ouvrez votre navigateur
2. Allez sur la page Specializations
3. **Cherchez l'icône 📚 bleue** dans chaque ligne

### Étape 2: Cliquer
1. Cliquez sur l'icône 📚 d'une spécialisation
2. Le dialog devrait s'ouvrir

### Étape 3: Tester l'Ajout
1. Sélectionnez un module dans la liste déroulante
2. Choisissez le type (Obligatoire/Optionnel)
3. Cliquez sur "Ajouter"
4. Le module apparaît dans l'onglet correspondant

---

## 🔍 Dépannage Visuel

### Problème: "Je ne vois pas le bouton 📚"

#### Vérification 1: Rechargez la page
```
Ctrl + R  (Windows/Linux)
Cmd + R   (Mac)
```

#### Vérification 2: Vérifiez la console
```
F12 → Console
```
Cherchez des erreurs en rouge.

#### Vérification 3: Vérifiez le code source
```
F12 → Elements → Cherchez "ri-book-line"
```

### Problème: "Le bouton est là mais rien ne se passe"

#### Vérification 1: Console
```
F12 → Console
```
Cliquez sur le bouton et regardez les erreurs.

#### Vérification 2: Network
```
F12 → Network
```
Vérifiez si l'API est appelée.

---

## 📊 Comparaison Avant/Après

### ❌ Avant (2 boutons)
```
Actions: [✏️ Edit] [🗑️ Delete]
```

### ✅ Après (3 boutons)
```
Actions: [📚 Manage Modules] [✏️ Edit] [🗑️ Delete]
```

---

## 🎯 Fichiers Modifiés

### 1. SpecializationList.tsx
- Ajout du state `modulesOpen`
- Ajout du handler `handleManageModules`
- Ajout du prop `onManageModules` au TableComponent
- Ajout du composant `<SpecializationModulesDialog>`

### 2. SpecializationListTable.tsx
- Ajout du prop `onManageModules`
- Ajout du bouton avec icône `ri-book-line`
- Ajout du tooltip "Manage Modules"

---

## ✅ Checklist Visuelle

Cochez ce que vous voyez :

- [ ] J'ouvre la page Specializations
- [ ] Je vois la liste des spécialisations
- [ ] Je vois **3 boutons** par ligne (pas 2)
- [ ] Le premier bouton est **bleu** avec une icône de livre 📚
- [ ] Au survol, je vois "Manage Modules"
- [ ] Je clique sur le bouton
- [ ] Un dialog s'ouvre avec le titre "Modules de Spécialité"
- [ ] Je vois un Autocomplete pour sélectionner un module
- [ ] Je vois deux onglets : "Obligatoires" et "Optionnels"

---

## 🚀 Prochaines Étapes

Une fois que vous confirmez que le bouton fonctionne :

### Option 1: Tester les Autres Composants
- CoreCurriculumDialog (Tronc Commun)
- ElectiveChoiceDialog (Choix Étudiants)
- CurriculumTreeView (Visualisation)

### Option 2: Intégrer dans d'Autres Pages
- Ajouter "Tronc Commun" dans ProgrammeList
- Ajouter visualisation dans Programme Details
- Ajouter choix d'options dans Student Interface

Voir `CURRICULUM_INTEGRATION_TODO.md` pour les détails.

---

## 📞 Besoin d'Aide ?

Si vous ne voyez pas le bouton ou si quelque chose ne fonctionne pas :

1. **Partagez une capture d'écran** de la page Specializations
2. **Partagez la console** (F12 → Console)
3. **Dites-moi ce qui se passe** quand vous cliquez

Je vous aiderai à résoudre le problème ! 🛠️

---

**Bon test ! 🎉**

