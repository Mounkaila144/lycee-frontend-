# 🌐 Guide de Test dans le Navigateur - Configuration Crédits ECTS

## ✅ Pages Créées

J'ai créé **2 pages** que tu peux maintenant tester dans ton navigateur :

### 1. Configuration Globale
**URL:** `/fr/admin/structure/credits`

**Fichier:** `src/app/[lang]/admin/structure/credits/page.tsx`

### 2. Configuration par Programme
**URL:** `/fr/admin/structure/programmes/[id]/credits`

**Fichier:** `src/app/[lang]/admin/structure/programmes/[id]/credits/page.tsx`

---

## 🚀 Comment Tester

### Test 1: Configuration Globale des Crédits ECTS

#### Étape 1: Accéder à la Page
Dans ton navigateur, va à l'URL :
```
http://localhost:3000/fr/admin/structure/credits
```

#### Étape 2: Ce Que Tu Devrais Voir
- ✅ Un titre "Configuration Globale des Crédits ECTS"
- ✅ Une alerte bleue avec les normes LMD
- ✅ Un tableau avec 5 lignes (L1, L2, L3, M1, M2)
- ✅ Pour chaque niveau :
  - Colonne "Semestre 1" : 30 crédits (par défaut)
  - Colonne "Semestre 2" : 30 crédits (par défaut)
  - Colonne "Total Annuel" : 60 crédits avec badge "LMD" vert
  - Colonne "Équilibre" : Badge "Équilibré" vert
  - Colonne "Actions" : Bouton avec icône crayon

#### Étape 3: Tester la Modification
1. **Cliquer** sur le bouton "Modifier" (icône crayon) pour **Licence 1 (L1)**
2. **Un dialogue s'ouvre** avec :
   - Titre : "Configuration des crédits ECTS - L1"
   - Champ "Crédits Semestre 1" : 30
   - Champ "Crédits Semestre 2" : 30
   - Section "Récapitulatif" : Total annuel: 60 crédits
3. **Modifier** les valeurs :
   - Semestre 1 : Changer à **32**
   - Semestre 2 : Changer à **28**
4. **Observer** :
   - Total annuel : 60 crédits (toujours OK)
   - Différence S1-S2 : 4 crédits
   - Pas d'alerte (différence < 10)
5. **Cliquer** sur "Enregistrer"
6. **Vérifier** que le tableau est mis à jour avec les nouvelles valeurs

#### Étape 4: Tester les Alertes
1. **Cliquer** à nouveau sur "Modifier" pour L1
2. **Modifier** les valeurs :
   - Semestre 1 : **40**
   - Semestre 2 : **25**
3. **Observer** :
   - ⚠️ Alerte orange : "Le total devrait être de 60 crédits selon les normes LMD. Total actuel: 65 crédits."
   - ℹ️ Alerte bleue : "La répartition est déséquilibrée (différence > 10 crédits)."
4. **Annuler** sans enregistrer

---

### Test 2: Configuration par Programme

#### Étape 1: Aller à la Liste des Programmes
Dans ton navigateur, va à :
```
http://localhost:3000/fr/admin/structure/programmes
```

#### Étape 2: Sélectionner un Programme
1. **Choisir** un programme dans la liste (par exemple, ID = 1)
2. **Noter** l'ID du programme dans l'URL

#### Étape 3: Accéder à la Configuration des Crédits
Dans ton navigateur, va à :
```
http://localhost:3000/fr/admin/structure/programmes/1/credits
```
(Remplace `1` par l'ID de ton programme)

#### Étape 4: Ce Que Tu Devrais Voir
- ✅ Titre : "Configuration des Crédits ECTS - [Nom du Programme]"
- ✅ **2 onglets** :
  - "Configuration"
  - "Validation de la Maquette"

#### Étape 5: Tester l'Onglet "Configuration"
1. **Onglet actif** : Configuration
2. **Alerte bleue** : "Les configurations définies ici remplacent les valeurs globales..."
3. **Tableau** identique à la config globale
4. **Modifier** un niveau (par exemple M1) :
   - Semestre 1 : 35
   - Semestre 2 : 25
5. **Enregistrer**
6. **Vérifier** que cette config est spécifique au programme

#### Étape 6: Tester l'Onglet "Validation de la Maquette"
1. **Cliquer** sur l'onglet "Validation de la Maquette"
2. **Bouton** "Actualiser" en haut à droite
3. **Cliquer** sur "Actualiser"
4. **Observer** le rapport de validation :
   - Tableau avec colonnes :
     - Niveau (L1, L2, L3, M1, M2)
     - Crédits Configurés
     - Crédits Modules
     - Écart
     - Statut (Valide/Invalide)
5. **Interpréter** :
   - ✅ Badge vert "Valide" : Les crédits des modules correspondent
   - ❌ Badge rouge "Invalide" : Il manque ou il y a trop de crédits
   - Écart : "Manque X" ou "Surplus X"

---

## 🎨 Captures d'Écran Attendues

### Configuration Globale
```
┌─────────────────────────────────────────────────────────┐
│ Configuration Globale des Crédits ECTS                  │
├─────────────────────────────────────────────────────────┤
│ ℹ️ Normes LMD: 60 crédits par année (30 par semestre)  │
├─────────────────────────────────────────────────────────┤
│ Niveau    │ S1  │ S2  │ Total │ Équilibre │ Actions   │
├───────────┼─────┼─────┼───────┼───────────┼───────────┤
│ Licence 1 │ 30  │ 30  │ 60 🟢 │ Équilibré │ ✏️        │
│ Licence 2 │ 30  │ 30  │ 60 🟢 │ Équilibré │ ✏️        │
│ Licence 3 │ 30  │ 30  │ 60 🟢 │ Équilibré │ ✏️        │
│ Master 1  │ 30  │ 30  │ 60 🟢 │ Équilibré │ ✏️        │
│ Master 2  │ 30  │ 30  │ 60 🟢 │ Équilibré │ ✏️        │
└───────────┴─────┴─────┴───────┴───────────┴───────────┘
```

### Dialogue de Configuration
```
┌─────────────────────────────────────────────┐
│ Configuration des crédits ECTS - L1    [X] │
├─────────────────────────────────────────────┤
│                                             │
│ Crédits Semestre 1: [32]                   │
│ Entre 15 et 45 crédits                     │
│                                             │
│ Crédits Semestre 2: [28]                   │
│ Entre 15 et 45 crédits                     │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ Récapitulatif                        │   │
│ │ Total annuel: 60 crédits            │   │
│ │ Différence S1-S2: 4 crédits         │   │
│ └─────────────────────────────────────┘   │
│                                             │
│           [Annuler]  [Enregistrer]         │
└─────────────────────────────────────────────┘
```

### Rapport de Validation
```
┌─────────────────────────────────────────────────────────┐
│ ✅ Maquette pédagogique valide                          │
│ Tous les niveaux ont des crédits cohérents             │
├─────────────────────────────────────────────────────────┤
│ Niveau │ Configurés │ Modules │ Écart  │ Statut       │
├────────┼────────────┼─────────┼────────┼──────────────┤
│ L1     │ 60         │ 60      │ Aucun  │ Valide 🟢   │
│ L2     │ 60         │ 58      │ -2     │ Invalide 🔴 │
│ L3     │ 60         │ 60      │ Aucun  │ Valide 🟢   │
└────────┴────────────┴─────────┴────────┴──────────────┘
```

---

## 🔍 Vérifications à Faire

### Vérification 1: Affichage
- [ ] Le tableau s'affiche correctement
- [ ] Les 5 niveaux sont visibles (L1-M2)
- [ ] Les badges de statut sont colorés
- [ ] Les icônes sont visibles

### Vérification 2: Interaction
- [ ] Le bouton "Modifier" ouvre le dialogue
- [ ] Les champs sont modifiables
- [ ] Le calcul du total est automatique
- [ ] Les alertes s'affichent correctement
- [ ] Le bouton "Enregistrer" fonctionne
- [ ] Le tableau se met à jour après enregistrement

### Vérification 3: Validation
- [ ] L'onglet "Validation" est accessible
- [ ] Le bouton "Actualiser" fonctionne
- [ ] Le rapport s'affiche
- [ ] Les écarts sont calculés correctement
- [ ] Les statuts sont corrects (Valide/Invalide)

### Vérification 4: Responsive
- [ ] La page s'affiche bien sur desktop
- [ ] Le dialogue est responsive
- [ ] Le tableau est scrollable sur mobile

---

## 🐛 Problèmes Possibles

### Problème 1: Page Blanche
**Cause:** Erreur de compilation
**Solution:**
1. Ouvrir la console du navigateur (F12)
2. Vérifier les erreurs
3. Redémarrer le serveur : `npm run dev`

### Problème 2: "Cannot read property..."
**Cause:** Backend non accessible
**Solution:**
1. Vérifier que le backend Laravel est démarré
2. Vérifier l'URL de l'API dans `.env`
3. Tester l'endpoint : `curl http://localhost:8000/api/admin/levels/credits`

### Problème 3: "403 Forbidden"
**Cause:** Permission manquante
**Solution:**
1. Vérifier que tu es connecté
2. Vérifier que tu as la permission `levels.configure_credits`
3. Contacter l'admin pour assigner la permission

### Problème 4: Tableau Vide
**Cause:** Aucune configuration créée (NORMAL)
**Solution:**
1. C'est normal au premier accès
2. Cliquer sur "Configurer" pour créer la première config
3. Les valeurs par défaut (30+30) seront affichées

### Problème 5: Validation Ne Fonctionne Pas
**Cause:** Programme sans modules associés
**Solution:**
1. Associer des modules au programme d'abord
2. Définir les crédits ECTS des modules
3. Réessayer la validation

---

## 📝 Notes de Test

### Scénario de Test Complet

#### Préparation
1. Backend Laravel démarré
2. Frontend Next.js démarré (`npm run dev`)
3. Connecté en tant qu'admin

#### Test 1: Configuration Globale (5 min)
1. ✅ Accéder `/fr/admin/structure/credits`
2. ✅ Vérifier affichage tableau
3. ✅ Modifier L1 : 32+28
4. ✅ Enregistrer
5. ✅ Vérifier mise à jour

#### Test 2: Alertes (3 min)
1. ✅ Modifier L2 : 40+25 (total ≠ 60)
2. ✅ Vérifier alerte orange
3. ✅ Modifier L3 : 40+20 (déséquilibre)
4. ✅ Vérifier alerte bleue

#### Test 3: Configuration Programme (5 min)
1. ✅ Accéder `/fr/admin/structure/programmes/1/credits`
2. ✅ Onglet "Configuration"
3. ✅ Modifier M1 : 35+25
4. ✅ Enregistrer
5. ✅ Vérifier override

#### Test 4: Validation (5 min)
1. ✅ Onglet "Validation de la Maquette"
2. ✅ Cliquer "Actualiser"
3. ✅ Vérifier rapport
4. ✅ Interpréter écarts

**Temps total:** ~20 minutes

---

## ✅ Checklist de Test

### Fonctionnel
- [ ] Configuration globale accessible
- [ ] Configuration programme accessible
- [ ] Dialogue de modification fonctionne
- [ ] Enregistrement fonctionne
- [ ] Validation fonctionne
- [ ] Rapport s'affiche correctement

### UI/UX
- [ ] Design cohérent avec le reste de l'app
- [ ] Badges colorés visibles
- [ ] Icônes affichées
- [ ] Responsive sur mobile
- [ ] Tooltips informatifs

### Données
- [ ] Valeurs par défaut (30+30)
- [ ] Calcul total automatique
- [ ] Alertes correctes
- [ ] Écarts calculés correctement
- [ ] Multi-tenancy isolé

---

## 🎯 Résultat Attendu

Après ces tests, tu devrais pouvoir :
- ✅ Configurer les crédits ECTS globalement
- ✅ Configurer les crédits par programme
- ✅ Voir les alertes pour déséquilibre/non-LMD
- ✅ Valider la cohérence de la maquette
- ✅ Voir les écarts entre configurés et modules

---

**Bon test ! 🚀**

Si tu rencontres un problème, vérifie la console du navigateur (F12) et les logs du serveur.
