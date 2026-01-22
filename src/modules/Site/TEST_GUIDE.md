# Guide de test - Module Site (Tenants)

## Tests à effectuer après la migration

### ✅ Test 1 : Affichage de la liste des tenants

**Action :**
1. Naviguer vers la page des sites (tenants)
2. Observer la liste

**Résultat attendu :**
- Le tableau affiche tous les tenants
- Pour les tenants sans `company_name`, l'ID ou le domaine principal est affiché
- Un message d'avertissement "Nom de société manquant" apparaît en orange
- Les domaines sont listés (max 2 visibles + compteur)
- Le domaine principal a un badge "Principal"
- Le statut "Actif/Inactif" est correctement affiché

**Cas de test :**
```json
// Tenant avec company_name
{
  "id": "company-xyz",
  "company_name": "XYZ Corporation",
  "domains": [{"domain": "xyz.localhost", "is_primary": true}]
}
→ Affiche "XYZ Corporation"

// Tenant sans company_name
{
  "id": "test-tenant",
  "company_name": null,
  "domains": [{"domain": "test.localhost", "is_primary": true}]
}
→ Affiche "test-tenant" avec avertissement
```

---

### ✅ Test 2 : Recherche de tenants

**Action :**
1. Utiliser la barre de recherche
2. Taper "company" ou "xyz" ou "test"

**Résultat attendu :**
- Les résultats sont filtrés en temps réel
- La recherche fonctionne sur : ID, company_name, company_email

**Note :** La recherche est gérée côté backend (paramètre `search`)

---

### ✅ Test 3 : Pagination

**Action :**
1. Si plus de 15 tenants, observer la pagination
2. Changer le nombre d'éléments par page (10, 25, 50)
3. Naviguer entre les pages

**Résultat attendu :**
- La pagination fonctionne correctement
- Le nombre total est affiché
- Les boutons précédent/suivant sont actifs selon le contexte

---

### ✅ Test 4 : Voir les détails d'un tenant

**Action :**
1. Cliquer sur l'icône "œil" d'un tenant
2. Observer la modal de détails

**Résultat attendu :**
- Modal s'ouvre avec toutes les informations
- Section "Informations générales" complète
- Section "Domaines" liste tous les domaines avec badge principal
- Si `company_name` est null, affiche "Non renseigné" en orange
- Les dates sont formatées en français relatif (ex: "il y a 2 jours")
- Sections optionnelles (Abonnement, Paramètres) n'apparaissent que si les données existent

---

### ✅ Test 5 : Créer un nouveau tenant

**Action :**
1. Cliquer sur "Nouveau Site"
2. Remplir le formulaire :
   - ID : `test-company-2`
   - Nom société : `Test Company 2`
   - Email : `test@company2.com`
   - Téléphone : `+33123456789`
   - Adresse : `123 Test Street`
   - Statut : Actif
   - Domaines :
     - `company2.localhost`
     - `www.company2.localhost`
3. Soumettre

**Résultat attendu :**
- Le formulaire se valide
- Le tenant est créé
- Redirection/fermeture de la modal
- Le nouveau tenant apparaît dans la liste
- Le premier domaine est marqué comme principal

**Erreurs à tester :**

**Cas 1 : ID déjà existant**
```
Action : Utiliser un ID existant (ex: "company-xyz")
Résultat attendu : Message d'erreur "The id has already been taken."
```

**Cas 2 : Aucun domaine**
```
Action : Supprimer tous les domaines du formulaire
Résultat attendu : Message "Au moins un domaine est requis"
```

**Cas 3 : ID invalide**
```
Action : Utiliser "company xyz" (avec espace)
Résultat attendu : Validation HTML empêche la soumission
```

---

### ✅ Test 6 : Modifier un tenant existant

**Action :**
1. Cliquer sur l'icône "crayon" d'un tenant
2. Modifier les champs :
   - Changer le nom de société
   - Ajouter un email si manquant
   - Ajouter un nouveau domaine
3. Soumettre

**Résultat attendu :**
- Les modifications sont sauvegardées
- Le tenant est mis à jour dans la liste
- Les nouveaux domaines apparaissent
- Si on modifie les domaines, TOUS les anciens sont remplacés

**Test spécifique : Mise à jour d'un tenant sans company_name**
```
Action : Modifier un tenant avec company_name = null
Résultat attendu :
- Le formulaire s'ouvre correctement
- Les champs sont pré-remplis avec les valeurs existantes
- On peut ajouter un company_name
- Après sauvegarde, l'avertissement disparaît
```

---

### ✅ Test 7 : Supprimer un tenant

**Action :**
1. Cliquer sur l'icône "poubelle" d'un tenant
2. Confirmer la suppression

**Résultat attendu :**
- Une confirmation apparaît avec le nom (ou l'ID) du tenant
- Après confirmation, le tenant est supprimé
- Il disparaît de la liste

**Message de confirmation attendu :**
- Avec company_name : `"Êtes-vous sûr de vouloir supprimer le tenant "XYZ Corporation" ?"`
- Sans company_name : `"Êtes-vous sûr de vouloir supprimer le tenant "company-xyz" ?"`

---

### ✅ Test 8 : Toggle du statut actif/inactif

**Action (via l'API ou un bouton si implémenté) :**
```typescript
await toggleActive("company-xyz");
```

**Résultat attendu :**
- Le statut bascule (Actif ↔ Inactif)
- La mise à jour est visible immédiatement
- Le badge de statut change de couleur

---

### ✅ Test 9 : Statistiques

**Action :**
1. Observer les cartes de statistiques en haut de page

**Résultat attendu :**
- 4 cartes affichées :
  1. Total Tenants
  2. Tenants Actifs
  3. Tenants Inactifs
  4. Taux d'activation (en %)
- Les chiffres correspondent à la réalité
- Si aucun tenant : tous à 0

**Calcul du taux d'activation :**
```
Exemple :
- Total : 10 tenants
- Actifs : 7 tenants
- Inactifs : 3 tenants
- Taux : 70%
```

---

### ✅ Test 10 : Gestion multi-domaines

**Action :**
1. Créer un tenant avec 3+ domaines
2. Observer l'affichage dans le tableau
3. Voir les détails

**Résultat attendu :**

**Dans le tableau :**
```
┌─────────────────────────────────┐
│ Domaines                        │
│ xyz.localhost [Principal]       │
│ www.xyz.localhost               │
│ +1 autre(s)                     │
└─────────────────────────────────┘
```

**Dans les détails :**
- Tous les domaines listés
- Badge "Principal" sur le premier
- ID de chaque domaine visible

---

### ✅ Test 11 : Responsive / Mobile

**Action :**
1. Réduire la fenêtre du navigateur (< 768px)
2. Observer l'affichage

**Résultat attendu :**
- Le tableau se transforme en cartes
- Chaque carte affiche :
  - Titre : Nom société (ou ID)
  - Sous-titre : Domaine principal
  - Badge de statut
  - Champs : ID, Domaines, Email, Téléphone, Créé le
  - Actions : Voir, Modifier, Supprimer

---

### ✅ Test 12 : Gestion d'erreurs réseau

**Action :**
1. Couper le serveur backend
2. Rafraîchir la page ou effectuer une action

**Résultat attendu :**
- Message d'erreur clair affiché
- Pas de crash de l'application
- L'interface reste utilisable

**Message typique :**
```
"Failed to load tenants"
```

---

### ✅ Test 13 : Validation du formulaire

**Champs requis à tester :**

**Création :**
- ✅ ID (requis, pattern alpha_dash)
- ✅ Nom société (requis)
- ✅ Au moins un domaine (requis)

**Modification :**
- ✅ Nom société (requis)
- ✅ Au moins un domaine (requis)

**Champs optionnels :**
- Email (validation format email si rempli)
- Téléphone (pas de validation spécifique)
- Adresse (texte libre)

---

## Checklist de test rapide

Avant de valider la migration, cocher tous ces points :

- [ ] La liste des tenants s'affiche correctement
- [ ] Les tenants sans company_name affichent un fallback (ID ou domaine)
- [ ] La recherche fonctionne
- [ ] La pagination fonctionne
- [ ] Le modal de détails s'ouvre et affiche toutes les informations
- [ ] Création d'un nouveau tenant réussit
- [ ] Validation du formulaire fonctionne (ID unique, domaines requis)
- [ ] Modification d'un tenant réussit
- [ ] Suppression d'un tenant réussit
- [ ] Les statistiques s'affichent avec les bons chiffres
- [ ] Les domaines multiples sont gérés correctement
- [ ] Le domaine principal a un badge visible
- [ ] L'affichage mobile est correct
- [ ] Les erreurs sont gérées proprement

---

## Tests d'API directe (optionnel)

Si vous voulez tester l'API indépendamment :

### Lister les tenants
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://api.local/api/superadmin/tenants?per_page=5
```

### Créer un tenant
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-api",
    "company_name": "Test API",
    "company_email": "test@api.com",
    "is_active": true,
    "domains": [
      {"domain": "testapi.localhost"}
    ]
  }' \
  http://api.local/api/superadmin/tenants
```

### Modifier un tenant
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Test API Updated"
  }' \
  http://api.local/api/superadmin/tenants/test-api
```

### Supprimer un tenant
```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://api.local/api/superadmin/tenants/test-api
```

---

## Logs utiles pour le debug

Dans le navigateur (Console F12) :
```javascript
// Voir les requêtes réseau
Network > Filter: tenants

// Voir les erreurs
Console > Filter: error

// Vérifier l'état Redux (si applicable)
Redux DevTools
```

---

## Résultats attendus globaux

✅ **Tout fonctionne** si :
- Aucune erreur dans la console
- Toutes les opérations CRUD fonctionnent
- L'affichage est correct même avec des données incomplètes
- Les messages d'erreur sont clairs
- L'expérience utilisateur est fluide
