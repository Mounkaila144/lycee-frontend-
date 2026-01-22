# 🚀 Guide d'Intégration - Configuration Crédits ECTS

## ⚡ Quick Start (5 minutes)

### Étape 1: Créer les Routes Next.js

**Fichier:** `src/app/[lang]/admin/structure/credits/page.tsx`
```tsx
'use client';

import { Container, Box } from '@mui/material';
import { GlobalLevelCreditConfig } from '@/modules/StructureAcademique';

export default function GlobalCreditsPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <GlobalLevelCreditConfig />
      </Box>
    </Container>
  );
}
```

**Fichier:** `src/app/[lang]/admin/programmes/[id]/credits/page.tsx`
```tsx
'use client';

import { useParams } from 'next/navigation';
import { Container, Box, CircularProgress } from '@mui/material';
import { ProgramLevelCreditConfig } from '@/modules/StructureAcademique';
import { programmeService } from '@/modules/StructureAcademique';
import { useTenant } from '@/shared/lib/tenant-context';
import { useState, useEffect } from 'react';

export default function ProgramCreditsPage() {
  const params = useParams();
  const { tenantId } = useTenant();
  const programId = Number(params.id);
  
  const [programme, setProgramme] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgramme = async () => {
      try {
        const data = await programmeService.getProgramme(programId, tenantId);
        setProgramme(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProgramme();
  }, [programId, tenantId]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (!programme) return <Box>Programme non trouvé</Box>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <ProgramLevelCreditConfig
          programId={programId}
          programName={programme.libelle}
        />
      </Box>
    </Container>
  );
}
```

### Étape 2: Ajouter au Menu de Navigation

**Fichier:** `src/configs/navigation.ts` (ou équivalent)
```tsx
{
  title: 'Structure Académique',
  icon: 'ri-building-line',
  children: [
    {
      title: 'Programmes',
      path: '/admin/programmes',
      icon: 'ri-book-line'
    },
    {
      title: 'Configuration Crédits ECTS',
      path: '/admin/structure/credits',
      icon: 'ri-medal-line',
      permission: 'levels.configure_credits'
    }
  ]
}
```

### Étape 3: Tester

1. **Démarrer le serveur:**
   ```bash
   npm run dev
   ```

2. **Accéder aux pages:**
   - Configuration globale: `http://localhost:3000/fr/admin/structure/credits`
   - Configuration programme: `http://localhost:3000/fr/admin/programmes/1/credits`

3. **Vérifier:**
   - [ ] Tableau des 5 niveaux s'affiche
   - [ ] Clic sur "Modifier" ouvre le dialogue
   - [ ] Modification des crédits fonctionne
   - [ ] Validation de la maquette affiche le rapport

---

## 📋 Checklist d'Intégration Complète

### Backend (Déjà fait ✅)
- [x] Migration exécutée
- [x] Routes API configurées
- [x] Tests backend passent
- [x] Endpoints accessibles

### Frontend (À faire)
- [ ] Routes Next.js créées
- [ ] Menu de navigation mis à jour
- [ ] Permissions configurées
- [ ] Tests manuels effectués

### Tests
- [ ] Configuration globale fonctionne
- [ ] Configuration programme fonctionne
- [ ] Validation maquette fonctionne
- [ ] Multi-tenancy testé
- [ ] Responsive design vérifié

---

## 🔧 Configuration Requise

### Permissions
Ajouter la permission dans le système de permissions:
```php
// Backend: Seeder ou migration
'levels.configure_credits' => 'Configurer les crédits ECTS'
```

Assigner aux rôles appropriés (Superadmin, Responsable Académique).

### Variables d'Environnement
Aucune variable supplémentaire requise. Le système utilise les variables existantes:
- `NEXT_PUBLIC_API_URL`
- `API_URL`

---

## 🎯 Intégration dans un Composant Existant

### Option 1: Ajouter un Onglet dans ProgrammeDetail

**Fichier:** `src/app/[lang]/admin/programmes/[id]/page.tsx`
```tsx
'use client';

import { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { ProgramLevelCreditConfig } from '@/modules/StructureAcademique';

export default function ProgrammeDetailPage({ params }) {
  const [activeTab, setActiveTab] = useState(0);
  const programId = Number(params.id);

  return (
    <Box>
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
        <Tab label="Informations" />
        <Tab label="Niveaux" />
        <Tab label="Crédits ECTS" />
        <Tab label="Historique" />
      </Tabs>

      {activeTab === 0 && <ProgrammeInfo programId={programId} />}
      {activeTab === 1 && <ProgrammeLevels programId={programId} />}
      {activeTab === 2 && (
        <ProgramLevelCreditConfig
          programId={programId}
          programName="Programme Name"
        />
      )}
      {activeTab === 3 && <ProgrammeHistory programId={programId} />}
    </Box>
  );
}
```

### Option 2: Bouton dans ProgrammeList

**Fichier:** `src/modules/StructureAcademique/admin/components/ProgrammeListTable.tsx`
```tsx
// Ajouter dans les actions de la table
<Tooltip title="Configurer les crédits ECTS">
  <IconButton
    size="small"
    onClick={() => router.push(`/admin/programmes/${programme.id}/credits`)}
  >
    <i className="ri-medal-line" />
  </IconButton>
</Tooltip>
```

---

## 🧪 Tests Manuels

### Test 1: Configuration Globale
1. Accéder à `/admin/structure/credits`
2. Cliquer sur "Modifier" pour L1
3. Changer S1 à 32, S2 à 28
4. Vérifier alerte "Déséquilibré"
5. Enregistrer
6. Vérifier que le tableau est mis à jour

**Résultat attendu:** ✅ Configuration enregistrée, tableau mis à jour

### Test 2: Configuration Programme
1. Accéder à `/admin/programmes/1/credits`
2. Onglet "Configuration"
3. Modifier M1: S1=35, S2=25
4. Enregistrer
5. Vérifier que la config programme override la globale

**Résultat attendu:** ✅ Override fonctionne

### Test 3: Validation Maquette
1. Accéder à `/admin/programmes/1/credits`
2. Onglet "Validation de la Maquette"
3. Cliquer "Actualiser"
4. Vérifier le rapport avec écarts

**Résultat attendu:** ✅ Rapport affiche les écarts correctement

### Test 4: Multi-Tenancy
1. Se connecter avec Tenant A
2. Configurer L1: 30+30
3. Se connecter avec Tenant B
4. Vérifier que la config de Tenant A n'est pas visible

**Résultat attendu:** ✅ Isolation des données

---

## 🐛 Dépannage

### Problème: "Cannot read property 'data' of undefined"
**Cause:** Backend non accessible ou endpoint incorrect
**Solution:**
```bash
# Vérifier que le backend est démarré
curl http://localhost:8000/api/admin/levels/credits

# Vérifier les variables d'environnement
echo $NEXT_PUBLIC_API_URL
```

### Problème: "403 Forbidden"
**Cause:** Permission manquante
**Solution:**
```php
// Backend: Assigner la permission à l'utilisateur
$user->givePermissionTo('levels.configure_credits');
```

### Problème: "Tableau vide"
**Cause:** Aucune configuration créée
**Solution:** C'est normal ! Cliquer sur "Configurer" pour créer la première config.

### Problème: "Validation ne fonctionne pas"
**Cause:** Programme n'a pas de modules associés
**Solution:** Associer des modules au programme d'abord.

---

## 📊 Vérification Post-Intégration

### Checklist Fonctionnelle
- [ ] Configuration globale accessible
- [ ] Configuration programme accessible
- [ ] Dialogue de configuration fonctionne
- [ ] Validation en temps réel fonctionne
- [ ] Alertes s'affichent correctement
- [ ] Enregistrement fonctionne
- [ ] Tableau se met à jour
- [ ] Validation maquette fonctionne
- [ ] Rapport d'écarts correct
- [ ] Multi-tenancy isolé

### Checklist UI/UX
- [ ] Responsive sur mobile
- [ ] Responsive sur tablette
- [ ] Responsive sur desktop
- [ ] Loading states visibles
- [ ] Error messages clairs
- [ ] Tooltips informatifs
- [ ] Badges de statut corrects
- [ ] Navigation fluide

### Checklist Performance
- [ ] Chargement < 2s
- [ ] Pas de re-renders inutiles
- [ ] Pas de memory leaks
- [ ] API calls optimisés

---

## 🎓 Formation Utilisateurs

### Guide Rapide pour Administrateurs

**Configuration Globale:**
1. Menu → Structure Académique → Configuration Crédits ECTS
2. Cliquer sur "Modifier" pour le niveau souhaité
3. Ajuster les crédits S1 et S2
4. Enregistrer

**Configuration Programme:**
1. Menu → Programmes → Sélectionner un programme
2. Onglet "Crédits ECTS"
3. Modifier les crédits spécifiques au programme
4. Onglet "Validation" pour vérifier la cohérence

**Validation Maquette:**
1. Accéder à la configuration du programme
2. Onglet "Validation de la Maquette"
3. Vérifier les écarts
4. Corriger si nécessaire (ajouter modules ou ajuster config)

---

## 📞 Support

### Documentation
- **Technique:** `ECTS_CREDITS_IMPLEMENTATION.md`
- **Exemples:** `ECTS_CREDITS_USAGE_EXAMPLE.md`
- **Résumé:** `ECTS_CREDITS_SUMMARY.md`
- **Intégration:** Ce fichier

### Code Source
- **Types:** `types/levelCredit.types.ts`
- **Service:** `admin/services/levelCreditService.ts`
- **Hooks:** `admin/hooks/useLevelCredits.ts`
- **Composants:** `admin/components/LevelCredit*.tsx`

### Contacts
- **Backend:** Voir story backend (déjà complète)
- **Frontend:** James (dev agent)

---

## ✅ Validation Finale

Avant de marquer l'intégration comme complète:

1. **Tests Fonctionnels**
   - [ ] Tous les tests manuels passent
   - [ ] Multi-tenancy vérifié
   - [ ] Permissions testées

2. **Tests UI**
   - [ ] Responsive design OK
   - [ ] Tous les navigateurs testés
   - [ ] Accessibilité vérifiée

3. **Documentation**
   - [ ] Routes documentées
   - [ ] Menu mis à jour
   - [ ] Guide utilisateur créé

4. **Déploiement**
   - [ ] Code mergé
   - [ ] Tests E2E passent
   - [ ] Production déployée

---

**L'intégration devrait prendre environ 30 minutes!** ⚡

**Questions? Consultez les fichiers de documentation ou testez avec les exemples fournis.** 📚
