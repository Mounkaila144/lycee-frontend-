# 🧪 Guide de Test - Curriculum Frontend

## ✅ Intégration Complétée !

J'ai ajouté le bouton **"Manage Modules"** (icône livre 📚) dans la liste des spécialisations.

---

## 🎯 Comment Tester

### 1. **Accéder à la Liste des Spécialisations**

1. Ouvrez votre navigateur
2. Naviguez vers **Structure Académique → Specializations**
3. Vous devriez voir la liste des spécialisations

---

### 2. **Nouveau Bouton "Manage Modules"**

Dans chaque ligne de spécialisation, vous verrez maintenant **3 boutons** :

| Icône | Couleur | Action |
|-------|---------|--------|
| 📚 (livre) | **Bleu** | **Manage Modules** (NOUVEAU !) |
| ✏️ (crayon) | Gris | Edit |
| 🗑️ (poubelle) | Rouge | Delete |

---

### 3. **Tester le Dialog "Manage Modules"**

#### Étape 1: Cliquer sur le bouton 📚
- Cliquez sur l'icône **livre bleu** d'une spécialisation
- Le dialog **"Modules de Spécialité"** devrait s'ouvrir

#### Étape 2: Ajouter un Module Obligatoire
1. Sélectionnez un module dans l'Autocomplete
2. Choisissez **Type: Obligatoire**
3. Cliquez sur **"Ajouter"**
4. Le module devrait apparaître dans l'onglet **"Obligatoires"**

#### Étape 3: Ajouter un Module Optionnel
1. Sélectionnez un autre module
2. Choisissez **Type: Optionnel**
3. Entrez une **Capacité** (ex: 30 places)
4. Cliquez sur **"Ajouter"**
5. Le module devrait apparaître dans l'onglet **"Optionnels"**

#### Étape 4: Retirer un Module
1. Cliquez sur l'icône 🗑️ à côté d'un module
2. Confirmez la suppression
3. Le module devrait disparaître de la liste

---

## 🔍 Ce que Vous Devriez Voir

### Dialog "Modules de Spécialité"

```
┌─────────────────────────────────────────────────┐
│ Modules de Spécialité - [Nom Spécialité]       │
├─────────────────────────────────────────────────┤
│                                                 │
│ ℹ️ Info Box:                                    │
│ - Modules Obligatoires: tous les étudiants     │
│ - Modules Optionnels: choix selon contraintes  │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ Ajouter un module à la spécialité       │   │
│ │                                          │   │
│ │ [Autocomplete: Sélectionner un module]  │   │
│ │                                          │   │
│ │ [Type: ▼] [Capacité: ___] [Ajouter]    │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ [Obligatoires (2)] [Optionnels (3)]     │   │
│ ├─────────────────────────────────────────┤   │
│ │                                          │   │
│ │ Liste des modules avec:                 │   │
│ │ - Code et nom du module                 │   │
│ │ - Badge type (Obligatoire/Optionnel)    │   │
│ │ - Capacité (pour optionnels)            │   │
│ │ - Bouton supprimer                      │   │
│ │                                          │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│                              [Fermer]           │
└─────────────────────────────────────────────────┘
```

---

## 🐛 Dépannage

### Problème 1: Le bouton n'apparaît pas
**Solution**: Rechargez la page (Ctrl+R ou F5)

### Problème 2: Erreur au clic sur le bouton
**Vérifiez**:
1. La console du navigateur (F12)
2. Que le backend est démarré
3. Que les endpoints API existent

### Problème 3: Le dialog ne s'ouvre pas
**Vérifiez**:
1. La console pour les erreurs
2. Que la spécialisation a un ID valide

### Problème 4: Aucun module dans l'Autocomplete
**Cause**: Aucun module créé dans le système
**Solution**: Créez d'abord des modules via le menu "Modules"

---

## 📝 Checklist de Test

### Tests de Base
- [ ] Le bouton 📚 apparaît dans la liste
- [ ] Le dialog s'ouvre au clic
- [ ] L'Autocomplete charge les modules
- [ ] Je peux ajouter un module obligatoire
- [ ] Je peux ajouter un module optionnel avec capacité
- [ ] Les onglets fonctionnent (Obligatoires/Optionnels)
- [ ] Je peux retirer un module
- [ ] Le dialog se ferme correctement

### Tests Avancés
- [ ] Les modules déjà ajoutés n'apparaissent pas dans l'Autocomplete
- [ ] La capacité s'affiche correctement pour les optionnels
- [ ] Le compteur de places fonctionne (X/Y places)
- [ ] Les badges de couleur sont corrects
- [ ] Le rechargement fonctionne après ajout/retrait

---

## 🎯 Prochains Tests

Une fois que le dialog "Modules de Spécialité" fonctionne, vous pourrez tester :

### 2. Tronc Commun (à intégrer dans ProgrammeList)
- Bouton pour gérer le tronc commun par niveau
- Ajout/retrait de modules communs

### 3. Choix d'Options Étudiants
- Interface pour que les étudiants choisissent leurs options
- Validation des contraintes (min/max)

### 4. Visualisation Curriculum
- Arbre de décision complet
- Vue hiérarchique du parcours

---

## 📞 Besoin d'Aide ?

### Si ça ne fonctionne pas :

1. **Vérifiez la console** (F12 → Console)
2. **Vérifiez le Network** (F12 → Network)
3. **Vérifiez que le backend répond** :
   ```bash
   # Test manuel de l'API
   curl http://localhost:8000/api/admin/specializations/1/modules
   ```

### Erreurs Communes

**Erreur 404** : L'endpoint n'existe pas encore côté backend
**Erreur 401** : Problème d'authentification
**Erreur 500** : Erreur serveur backend

---

## ✅ Résultat Attendu

Après ces tests, vous devriez pouvoir :

1. ✅ Voir le bouton "Manage Modules" dans la liste
2. ✅ Ouvrir le dialog de gestion des modules
3. ✅ Ajouter des modules obligatoires
4. ✅ Ajouter des modules optionnels avec capacité
5. ✅ Retirer des modules
6. ✅ Voir les modules organisés par onglets

---

**Bon test ! 🚀**

Si vous rencontrez des problèmes, partagez-moi :
- Le message d'erreur dans la console
- Ce que vous avez cliqué
- Ce qui s'est passé (ou pas)

Je vous aiderai à résoudre le problème !
