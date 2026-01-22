# ⚡ Configuration Crédits ECTS - Quick Reference

## 🎯 En 30 Secondes

**Quoi?** Configuration et validation des crédits ECTS par niveau (L1-M2) selon normes LMD.

**Statut:** ✅ **COMPLETE** - Backend + Frontend prêts

**Fichiers:** 15 créés (8 code + 7 doc) | 3 modifiés

---

## 🚀 Utilisation Rapide

### Configuration Globale
```tsx
import { GlobalLevelCreditConfig } from '@/modules/StructureAcademique';
<GlobalLevelCreditConfig />
```

### Configuration Programme
```tsx
import { ProgramLevelCreditConfig } from '@/modules/StructureAcademique';
<ProgramLevelCreditConfig programId={1} programName="Licence Info" />
```

### Hooks
```tsx
import { useGlobalLevelCredits, useProgramCreditValidation } from '@/modules/StructureAcademique';

const { configurations, updateConfiguration } = useGlobalLevelCredits();
const { validationReport, validate } = useProgramCreditValidation(programId);
```

---

## 📦 Composants

| Composant | Usage |
|-----------|-------|
| `GlobalLevelCreditConfig` | Page config globale |
| `ProgramLevelCreditConfig` | Page config programme |
| `LevelCreditConfigDialog` | Dialogue édition |
| `LevelCreditConfigTable` | Tableau récap |
| `CreditValidationReport` | Rapport validation |

---

## 🔌 API Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/admin/levels/credits` | GET | Config globale |
| `/admin/levels/credits` | POST | Update globale |
| `/admin/programmes/{id}/credits` | GET | Config programme |
| `/admin/programmes/{id}/credits` | POST | Update programme |
| `/admin/programmes/{id}/credits/validate` | GET | Validation |

---

## 📊 Normes LMD

- **Total annuel:** 60 crédits
- **Par semestre:** 30 crédits (équilibré)
- **Plage:** 15-45 crédits/semestre

**Alertes:**
- ⚠️ Total ≠ 60 → Warning
- ℹ️ |S1-S2| > 10 → Info
- ❌ Modules < Config → Error

---

## 📁 Fichiers Clés

### Code
```
types/levelCredit.types.ts              # Types
admin/services/levelCreditService.ts    # API
admin/hooks/useLevelCredits.ts          # Hooks
admin/components/LevelCredit*.tsx       # UI
```

### Documentation
```
ECTS_CREDITS_README.md                  # Vue d'ensemble
ECTS_CREDITS_SUMMARY.md                 # Résumé exécutif
ECTS_CREDITS_IMPLEMENTATION.md          # Technique
ECTS_CREDITS_USAGE_EXAMPLE.md           # Exemples
ECTS_CREDITS_INTEGRATION_GUIDE.md       # Intégration
ECTS_CREDITS_TESTING.md                 # Tests
CHANGELOG_ECTS_CREDITS.md               # Changelog
```

---

## ✅ Checklist Intégration

- [ ] Créer routes Next.js
- [ ] Ajouter au menu
- [ ] Configurer permissions
- [ ] Tester multi-tenant
- [ ] Valider responsive

**Temps estimé:** 30 minutes

---

## 🧪 Tests Rapides

```bash
# Backend (déjà fait ✅)
php artisan test --filter=LevelCredit

# Frontend (exemples fournis)
npm test LevelCreditConfigDialog.test.tsx
```

---

## 🐛 Dépannage Express

| Problème | Solution |
|----------|----------|
| 403 Forbidden | Assigner permission `levels.configure_credits` |
| Tableau vide | Normal, cliquer "Configurer" |
| Validation KO | Associer modules au programme |

---

## 📞 Support

**Docs complètes:** Voir fichiers `ECTS_CREDITS_*.md`

**Code:** `types/`, `admin/services/`, `admin/hooks/`, `admin/components/`

---

## 📊 Métriques

- **Composants:** 5
- **Hooks:** 3
- **Services:** 1
- **Types:** 8
- **Traductions:** 30+
- **Docs:** 7 fichiers
- **LOC:** ~1,200

---

## 🎯 Prochaines Étapes

1. Créer routes: `app/[lang]/admin/structure/credits/page.tsx`
2. Ajouter menu: `configs/navigation.ts`
3. Tester: Accéder `/admin/structure/credits`
4. Valider: Modifier config L1, vérifier sauvegarde
5. Déployer: Merger et déployer

---

**Version:** 1.0.0 | **Date:** 2026-01-12 | **Statut:** ✅ Ready
