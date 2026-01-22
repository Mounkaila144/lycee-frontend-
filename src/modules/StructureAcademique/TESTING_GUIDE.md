# Guide de Test - Module Structure Académique

## 🚀 Démarrage

### 1. Démarrer le serveur de développement

```bash
npm run dev
# ou
pnpm dev
```

### 2. Accéder à la page

Naviguer vers : `http://localhost:3000/fr/admin/structure/programmes`

(Remplacer `fr` par `en` ou `ar` selon la langue)

## ✅ Checklist de Tests - Story 01 : CRUD Programmes

### Test 1 : Affichage de la Liste
- [ ] La page se charge sans erreur
- [ ] Le titre "Programmes LMD" est affiché
- [ ] Le bouton "Nouveau Programme" est visible
- [ ] Les filtres sont affichés (Recherche, Type, Statut)
- [ ] La table est affichée avec les colonnes correctes
- [ ] La pagination est visible en bas de la table

### Test 2 : Création d'un Programme

**Étapes** :
1. Cliquer sur "Nouveau Programme"
2. Remplir le formulaire :
   - Code : `INF-L`
   - Libellé : `Licence en Informatique`
   - Type : `Licence`
   - Durée : `3`
   - Description : `Programme de licence en informatique`
3. Cliquer sur "Créer"

**Résultat attendu** :
- [ ] Le dialog se ferme automatiquement
- [ ] Le nouveau programme apparaît dans la liste
- [ ] Un message de succès est affiché (si implémenté)
- [ ] La liste est actualisée

### Test 3 : Validation du Formulaire

**Étapes** :
1. Cliquer sur "Nouveau Programme"
2. Laisser les champs vides
3. Cliquer sur "Créer"

**Résultat attendu** :
- [ ] Les champs requis affichent une erreur
- [ ] Le formulaire n'est pas soumis
- [ ] Le dialog reste ouvert

### Test 4 : Modification d'un Programme

**Étapes** :
1. Cliquer sur l'icône "Modifier" (crayon) d'un programme
2. Modifier le libellé
3. Cliquer sur "Modifier"

**Résultat attendu** :
- [ ] Le dialog se ferme
- [ ] Le programme est mis à jour dans la liste
- [ ] Les modifications sont visibles

### Test 5 : Suppression d'un Programme

**Étapes** :
1. Cliquer sur l'icône "Supprimer" (poubelle) d'un programme
2. Confirmer la suppression

**Résultat attendu** :
- [ ] Un dialog de confirmation s'affiche
- [ ] Le message indique le nom du programme
- [ ] Après confirmation, le programme disparaît de la liste

### Test 6 : Filtrage par Type

**Étapes** :
1. Sélectionner "Licence" dans le filtre Type
2. Observer la liste

**Résultat attendu** :
- [ ] Seuls les programmes de type "Licence" sont affichés
- [ ] La pagination est mise à jour
- [ ] Le compteur total est correct

### Test 7 : Filtrage par Statut

**Étapes** :
1. Sélectionner "Actif" dans le filtre Statut
2. Observer la liste

**Résultat attendu** :
- [ ] Seuls les programmes avec statut "Actif" sont affichés
- [ ] Les chips de statut affichent "Actif" en vert

### Test 8 : Recherche

**Étapes** :
1. Taper "INF" dans le champ de recherche
2. Observer la liste

**Résultat attendu** :
- [ ] Les programmes contenant "INF" dans le code ou libellé sont affichés
- [ ] La recherche fonctionne en temps réel (ou après validation)

### Test 9 : Pagination

**Étapes** :
1. Si plus de 15 programmes existent, naviguer vers la page 2
2. Observer la liste

**Résultat attendu** :
- [ ] La liste affiche les programmes de la page 2
- [ ] Le numéro de page est mis à jour
- [ ] Le compteur "X-Y sur Z" est correct

### Test 10 : Actualisation

**Étapes** :
1. Cliquer sur l'icône "Actualiser" (flèche circulaire)
2. Observer la liste

**Résultat attendu** :
- [ ] Un loading indicator s'affiche brièvement
- [ ] La liste est rechargée depuis l'API
- [ ] Les données sont à jour

## 🔍 Tests d'Intégration API

### Vérifier les Appels API

**Ouvrir DevTools (F12) → Network → Fetch/XHR**

### Test 1 : GET /admin/programmes
- [ ] L'appel est effectué au chargement de la page
- [ ] Headers présents :
  - `Authorization: Bearer {token}`
  - `X-Tenant-ID: {tenantId}` (si admin context)
  - `Accept-Language: fr` (ou autre langue)
- [ ] Réponse 200 OK
- [ ] Structure de réponse correcte (data, meta, links)

### Test 2 : POST /admin/programmes
- [ ] L'appel est effectué lors de la création
- [ ] Body contient les données du formulaire
- [ ] Réponse 201 Created
- [ ] Retourne le programme créé

### Test 3 : PUT /admin/programmes/{id}
- [ ] L'appel est effectué lors de la modification
- [ ] Body contient les données modifiées
- [ ] Réponse 200 OK
- [ ] Retourne le programme mis à jour

### Test 4 : DELETE /admin/programmes/{id}
- [ ] L'appel est effectué lors de la suppression
- [ ] Réponse 204 No Content ou 200 OK
- [ ] Le programme est supprimé (soft delete)

## 🐛 Tests d'Erreurs

### Test 1 : Token Expiré (401)
**Étapes** :
1. Supprimer le token de localStorage
2. Recharger la page

**Résultat attendu** :
- [ ] Redirection vers la page de login
- [ ] Message d'erreur approprié

### Test 2 : Permissions Insuffisantes (403)
**Étapes** :
1. Se connecter avec un utilisateur sans permission `programmes.view`
2. Accéder à la page

**Résultat attendu** :
- [ ] Message d'erreur "Accès refusé"
- [ ] Ou redirection vers page d'erreur

### Test 3 : Programme Non Trouvé (404)
**Étapes** :
1. Essayer de modifier un programme avec un ID inexistant

**Résultat attendu** :
- [ ] Message d'erreur "Programme non trouvé"
- [ ] Le dialog se ferme ou affiche l'erreur

### Test 4 : Erreur de Validation (422)
**Étapes** :
1. Créer un programme avec un code déjà existant
2. Soumettre le formulaire

**Résultat attendu** :
- [ ] Message d'erreur "Le code est déjà utilisé"
- [ ] Le formulaire reste ouvert
- [ ] L'erreur est affichée clairement

### Test 5 : Erreur Serveur (500)
**Étapes** :
1. Simuler une erreur serveur (si possible)

**Résultat attendu** :
- [ ] Message d'erreur générique
- [ ] L'application ne crash pas
- [ ] Possibilité de réessayer

## 📱 Tests Responsive

### Desktop (>1200px)
- [ ] Tous les éléments sont visibles
- [ ] La table n'a pas de scroll horizontal
- [ ] Les dialogs sont centrés

### Tablet (768px - 1200px)
- [ ] La table est scrollable horizontalement si nécessaire
- [ ] Les filtres s'adaptent (wrap)
- [ ] Les dialogs sont responsive

### Mobile (<768px)
- [ ] La table est scrollable
- [ ] Les filtres sont empilés verticalement
- [ ] Les dialogs occupent toute la largeur
- [ ] Les boutons sont accessibles

## 🌐 Tests Multi-Tenant

### Test 1 : Isolation des Données
**Étapes** :
1. Se connecter au tenant A
2. Créer un programme
3. Se déconnecter
4. Se connecter au tenant B
5. Vérifier la liste des programmes

**Résultat attendu** :
- [ ] Le programme créé dans tenant A n'est pas visible dans tenant B
- [ ] Chaque tenant a ses propres données

### Test 2 : Header X-Tenant-ID
**Étapes** :
1. Vérifier les appels API dans DevTools

**Résultat attendu** :
- [ ] Le header `X-Tenant-ID` est présent
- [ ] La valeur correspond au tenant actuel

## 🎨 Tests UI/UX

### Chips de Statut
- [ ] Brouillon : Gris (default)
- [ ] Actif : Vert (success)
- [ ] Inactif : Orange (warning)
- [ ] Archivé : Rouge (error)

### Chips de Type
- [ ] Licence : Bleu (primary)
- [ ] Master : Violet (secondary)
- [ ] Doctorat : Cyan (info)

### Loading States
- [ ] CircularProgress affiché pendant le chargement
- [ ] Boutons désactivés pendant les mutations
- [ ] Skeleton loader (si implémenté)

### Tooltips
- [ ] Tooltip "Voir" sur l'icône œil
- [ ] Tooltip "Modifier" sur l'icône crayon
- [ ] Tooltip "Supprimer" sur l'icône poubelle
- [ ] Tooltip "Actualiser" sur l'icône refresh

## 📊 Tests de Performance

### Temps de Chargement
- [ ] Page initiale < 2s
- [ ] Filtrage < 500ms
- [ ] Création/Modification < 1s
- [ ] Suppression < 500ms

### Nombre de Requêtes
- [ ] 1 seule requête GET au chargement
- [ ] Pas de requêtes en double
- [ ] Pas de N+1 queries

## ✅ Checklist Finale

Avant de considérer la Story 01 comme terminée :

- [ ] Tous les tests fonctionnels passent
- [ ] Tous les tests d'intégration API passent
- [ ] Tous les tests d'erreurs passent
- [ ] Tests responsive OK
- [ ] Tests multi-tenant OK
- [ ] Tests UI/UX OK
- [ ] Performance acceptable
- [ ] Code formaté (Prettier)
- [ ] Pas d'erreurs TypeScript
- [ ] Pas d'erreurs ESLint
- [ ] Documentation à jour

## 🎉 Résultat Attendu

Si tous les tests passent, la Story 01 est **COMPLÈTE** et prête pour la production ! 🚀

**Prochaine étape** : Story 02 - Activation/Désactivation des Programmes
