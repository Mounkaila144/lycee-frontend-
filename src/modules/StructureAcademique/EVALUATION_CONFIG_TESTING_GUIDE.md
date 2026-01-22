# Guide de Test - Configuration des Évaluations

## 🧪 Tests Manuels à Effectuer

### Prérequis
1. Backend Laravel en cours d'exécution
2. Migrations exécutées (evaluation_templates, module_evaluation_configs)
3. Seeder exécuté (EvaluationTemplateSeeder) pour avoir les templates
4. Au moins 1 module existant dans la base de données
5. Frontend Next.js en cours d'exécution (`pnpm dev`)

---

## Test 1: Accès au Dialog

### Étapes
1. Naviguer vers `/admin/structure/modules`
2. Dans la table des modules, localiser la colonne "Actions"
3. Cliquer sur l'icône 📋 (ri-file-list-3-line) "Configuration des évaluations"

### Résultat Attendu
- ✅ Dialog modal s'ouvre
- ✅ Titre: "Configuration des Évaluations"
- ✅ Sous-titre: Nom du module + "Semestre 1"
- ✅ Message: "Aucune évaluation configurée"
- ✅ Bouton: "Appliquer un template"

---

## Test 2: Application d'un Template

### Étapes
1. Cliquer sur "Appliquer un template"
2. Observer les cartes de templates affichées
3. Sélectionner le template "Standard"
4. Cliquer sur "Appliquer"

### Résultat Attendu
- ✅ 3 templates affichés (Standard, Pratique, Projet)
- ✅ Chaque carte montre: nom, description, composition, total coefficient
- ✅ Après application:
  - Message success: "Template appliqué avec succès"
  - 3 évaluations créées (CC1 20%, CC2 20%, Examen 60%)
  - Total: 100%
  - Validation: ✅ "Configuration valide"

---

## Test 3: Création Manuelle d'une Évaluation

### Étapes
1. Supprimer toutes les évaluations existantes (si présentes)
2. Cliquer sur "Ajouter"
3. Remplir le formulaire:
   - Nom: "CC1"
   - Type: "CC"
   - Coefficient: 30
   - Note max: 20
   - Date planifiée: (date future)
4. Cliquer sur "Créer"

### Résultat Attendu
- ✅ Formulaire s'affiche
- ✅ Validation en temps réel
- ✅ Après création:
  - Message success: "Configuration créée"
  - Évaluation apparaît dans la liste
  - Badge bleu "CC"
  - Coefficient: 30%
  - Total: 30%
  - Validation: ⚠️ Warning "Total coefficients: 30% (recommandé: 100%)"

---

## Test 4: Évaluation Éliminatoire

### Étapes
1. Cliquer sur "Ajouter"
2. Remplir:
   - Nom: "Examen Final"
   - Type: "Examen"
   - Coefficient: 70
   - Cocher "Évaluation éliminatoire"
   - Seuil éliminatoire: 8
3. Cliquer sur "Créer"

### Résultat Attendu
- ✅ Champ "Seuil éliminatoire" apparaît quand case cochée
- ✅ Après création:
  - Badge rouge "Examen"
  - Badge outlined rouge "Éliminatoire"
  - Seuil: 8/20 affiché en rouge
  - Total: 100%
  - Validation: ✅ "Configuration valide"

---

## Test 5: Modification d'une Évaluation

### Étapes
1. Cliquer sur l'icône ✏️ (edit) d'une évaluation
2. Modifier le coefficient: 25 → 35
3. Cliquer sur "Mettre à jour"

### Résultat Attendu
- ✅ Formulaire pré-rempli avec données existantes
- ✅ Après modification:
  - Message success: "Configuration mise à jour"
  - Coefficient mis à jour dans la liste
  - Total recalculé
  - Validation mise à jour

---

## Test 6: Suppression d'une Évaluation

### Étapes
1. Cliquer sur l'icône 🗑️ (delete) d'une évaluation
2. Confirmer la suppression

### Résultat Attendu
- ✅ Dialog de confirmation
- ✅ Après suppression:
  - Message success: "Configuration supprimée"
  - Évaluation disparaît de la liste
  - Total recalculé
  - Validation mise à jour

---

## Test 7: Validation - Total ≠ 100%

### Étapes
1. Créer 2 évaluations:
   - CC: 40%
   - Examen: 50%
2. Observer la validation

### Résultat Attendu
- ✅ Total: 90%
- ✅ Alert warning (orange)
- ✅ Message: "Total coefficients: 90% (recommandé: 100%)"
- ✅ Chip "Non bloquant"
- ✅ Bouton "Publier" reste actif

---

## Test 8: Validation - Module Éliminatoire sans Examen

### Prérequis
- Module doit avoir `is_eliminatory = true` dans la base

### Étapes
1. Créer uniquement des CC et TP (pas d'Examen)
2. Observer la validation

### Résultat Attendu
- ✅ Alert error (rouge)
- ✅ Message: "Module éliminatoire doit avoir au moins 1 Examen"
- ✅ Chip "Bloquant"
- ✅ Bouton "Publier" désactivé

---

## Test 9: Publication de la Configuration

### Étapes
1. Créer une configuration valide (total 100%, avec examen si éliminatoire)
2. Cliquer sur "Publier"
3. Observer les changements

### Résultat Attendu
- ✅ Message success: "Configuration publiée avec succès"
- ✅ Chip "Publié" (vert) avec icône 🔒
- ✅ Boutons edit/delete désactivés
- ✅ Bouton "Ajouter" désactivé
- ✅ Formulaire affiche alert: "La configuration est publiée et ne peut plus être modifiée"

---

## Test 10: Templates - Affichage et Détails

### Étapes
1. Ouvrir le sélecteur de templates
2. Observer chaque template

### Résultat Attendu

**Template Standard**
- ✅ Nom: "Standard"
- ✅ Description: "Configuration standard avec contrôle continu et examen"
- ✅ Composition:
  - CC1: 20%
  - CC2: 20%
  - Examen: 60%
- ✅ Total: 100%

**Template Pratique**
- ✅ Nom: "Pratique"
- ✅ Description: "Configuration pour modules pratiques"
- ✅ Composition:
  - CC: 30%
  - TP: 50%
  - Projet: 20%
- ✅ Total: 100%

**Template Projet**
- ✅ Nom: "Projet"
- ✅ Description: "Évaluation basée uniquement sur un projet"
- ✅ Composition:
  - Projet: 100%
- ✅ Total: 100%

---

## Test 11: Responsive Design

### Étapes
1. Ouvrir le dialog sur différentes tailles d'écran
2. Tester sur mobile (< 600px)
3. Tester sur tablette (600-900px)
4. Tester sur desktop (> 900px)

### Résultat Attendu
- ✅ Dialog adapté à la largeur d'écran
- ✅ Formulaire en colonnes sur desktop, empilé sur mobile
- ✅ Templates en grille responsive (1 col mobile, 2 col tablette, 3 col desktop)
- ✅ Boutons accessibles et cliquables
- ✅ Pas de débordement horizontal

---

## Test 12: Gestion des Erreurs

### Test 12.1: Erreur Réseau
1. Couper le backend
2. Essayer d'ouvrir le dialog

**Résultat Attendu**
- ✅ Alert error: "Failed to fetch configurations"
- ✅ Pas de crash de l'application

### Test 12.2: Validation Formulaire
1. Essayer de créer une évaluation sans nom
2. Essayer coefficient < 1 ou > 100
3. Essayer note max < 10 ou > 20

**Résultat Attendu**
- ✅ Messages d'erreur sous chaque champ
- ✅ Bouton "Créer" reste actif mais soumission bloquée
- ✅ Erreurs en rouge

---

## Test 13: Performance

### Étapes
1. Créer 10 évaluations
2. Observer le temps de chargement
3. Modifier une évaluation
4. Observer le temps de mise à jour

### Résultat Attendu
- ✅ Chargement < 1 seconde
- ✅ Création/Modification < 500ms
- ✅ Pas de lag dans l'interface
- ✅ Loading states visibles pendant les opérations

---

## Test 14: Intégration avec ModuleListTable

### Étapes
1. Ouvrir plusieurs modules différents
2. Configurer des évaluations pour chacun
3. Fermer et rouvrir les dialogs

### Résultat Attendu
- ✅ Chaque module garde sa propre configuration
- ✅ Pas de mélange de données entre modules
- ✅ Rechargement correct des données à chaque ouverture

---

## 🐛 Bugs Connus / Limitations

### Limitations Actuelles
1. **Semestre hardcodé**: Actuellement fixé à "Semestre 1" (ID: 1)
   - **TODO**: Ajouter un sélecteur de semestre
   
2. **Pas d'historique**: Pas de traçabilité des modifications
   - **TODO**: Implémenter un système d'audit

3. **Pas de duplication**: Impossible de copier une config vers un autre semestre
   - **TODO**: Ajouter bouton "Dupliquer vers..."

### Bugs à Surveiller
- ⚠️ Si le backend retourne une erreur 500, le message n'est pas toujours clair
- ⚠️ Validation côté client peut différer légèrement du backend

---

## 📊 Checklist de Test Complète

### Fonctionnalités de Base
- [ ] Ouverture du dialog
- [ ] Fermeture du dialog
- [ ] Affichage des évaluations existantes
- [ ] Affichage du total des coefficients
- [ ] Affichage du statut (Draft/Published)

### CRUD Évaluations
- [ ] Création d'une évaluation
- [ ] Modification d'une évaluation
- [ ] Suppression d'une évaluation
- [ ] Validation du formulaire

### Templates
- [ ] Affichage des templates
- [ ] Application d'un template
- [ ] Vérification des évaluations créées

### Validation
- [ ] Validation réussie (100%, avec examen si nécessaire)
- [ ] Warning total ≠ 100%
- [ ] Erreur module éliminatoire sans examen
- [ ] Affichage correct des messages

### Publication
- [ ] Publication d'une configuration valide
- [ ] Verrouillage après publication
- [ ] Impossibilité de modifier après publication

### Évaluations Éliminatoires
- [ ] Création avec seuil
- [ ] Affichage du badge et seuil
- [ ] Validation du seuil

### UI/UX
- [ ] Responsive design
- [ ] Loading states
- [ ] Messages de succès
- [ ] Messages d'erreur
- [ ] Icônes et badges corrects

### Performance
- [ ] Chargement rapide
- [ ] Pas de lag
- [ ] Rechargement après mutations

---

## 🚀 Commandes Utiles

### Backend
```bash
# Exécuter les migrations
php artisan migrate

# Exécuter le seeder des templates
php artisan db:seed --class=Modules\\StructureAcademique\\Database\\Seeders\\EvaluationTemplateSeeder

# Vérifier les templates créés
php artisan tinker
>>> \Modules\StructureAcademique\Entities\EvaluationTemplate::all();

# Réinitialiser les configurations (si besoin)
php artisan db:seed --class=Modules\\StructureAcademique\\Database\\Seeders\\EvaluationTemplateSeeder --force
```

### Frontend
```bash
# Démarrer le serveur de développement
pnpm dev

# Vérifier les erreurs TypeScript
pnpm type-check

# Linter
pnpm lint
```

### Tests Backend (si disponibles)
```bash
# Exécuter tous les tests
php artisan test

# Tests spécifiques
php artisan test --filter=EvaluationConfig
php artisan test --filter=EvaluationTemplate
```

---

## 📝 Rapport de Test

### Template de Rapport

```markdown
## Test Report - Configuration des Évaluations
**Date**: [Date]
**Testeur**: [Nom]
**Environnement**: [Dev/Staging/Prod]

### Tests Réussis
- [ ] Test 1: Accès au Dialog
- [ ] Test 2: Application Template
- [ ] Test 3: Création Manuelle
- [ ] Test 4: Évaluation Éliminatoire
- [ ] Test 5: Modification
- [ ] Test 6: Suppression
- [ ] Test 7: Validation Total ≠ 100%
- [ ] Test 8: Validation Module Éliminatoire
- [ ] Test 9: Publication
- [ ] Test 10: Templates
- [ ] Test 11: Responsive
- [ ] Test 12: Gestion Erreurs
- [ ] Test 13: Performance
- [ ] Test 14: Intégration

### Bugs Trouvés
1. [Description du bug]
   - Sévérité: [Critique/Majeur/Mineur]
   - Étapes de reproduction: [...]
   - Résultat attendu: [...]
   - Résultat obtenu: [...]

### Améliorations Suggérées
1. [Suggestion]
2. [Suggestion]

### Conclusion
[Prêt pour production / Nécessite corrections / etc.]
```

---

## ✅ Validation Finale

Avant de considérer l'implémentation comme complète:

1. ✅ Tous les tests manuels passent
2. ✅ Aucune erreur console
3. ✅ Aucune erreur TypeScript
4. ✅ Aucune erreur de linting
5. ✅ Performance acceptable
6. ✅ Responsive sur tous les devices
7. ✅ Gestion d'erreurs robuste
8. ✅ UX intuitive et claire
9. ✅ Documentation complète
10. ✅ Code review effectué

---

**Bonne chance pour les tests! 🎉**
