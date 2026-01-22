# 🧪 Test Rapide - Dashboard Statistiques

## ✅ Frontend Prêt !

Le dashboard des statistiques est **complet et prêt à tester**.

---

## 🎯 Test en 3 Étapes

### 1. Accédez au Dashboard
```
URL: /[lang]/admin/statistics
ou
Menu → Structure Académique → Statistiques
```

### 2. Vérifiez l'Affichage
- **4 cartes** en haut (Programmes, Modules, Enseignants, Couverture)
- **4 graphiques** en dessous
- **Détails** en bas

### 3. Testez les Actions
- Cliquez sur **"Actualiser"**
- Cliquez sur **"Exporter Excel"**
- Ouvrez le fichier Excel téléchargé

---

## ✅ Checklist Rapide

- [ ] Le dashboard s'affiche
- [ ] Les 4 cartes de métriques sont visibles
- [ ] Le graphique "Programmes par Type" s'affiche
- [ ] Le graphique "Volumes Horaires" s'affiche
- [ ] Le graphique "Modules par Niveau" s'affiche
- [ ] Le graphique "Crédits par Niveau" s'affiche
- [ ] Le bouton "Actualiser" fonctionne
- [ ] Le bouton "Exporter Excel" fonctionne
- [ ] Le fichier Excel se télécharge
- [ ] Le fichier Excel contient 4 feuilles

---

## 📊 Ce Que Vous Devriez Voir

### Dashboard

```
┌─────────────────────────────────────────────────────┐
│ Statistiques de la Structure Académique            │
│                          [Actualiser] [Export]      │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│ │📚 10 │ │📄150 │ │👤 45 │ │📊85% │              │
│ └──────┘ └──────┘ └──────┘ └──────┘              │
│                                                     │
│ [Graphiques...]                                     │
└─────────────────────────────────────────────────────┘
```

### Métriques Clés
- **Programmes** : Total + actifs
- **Modules** : Total + crédits ECTS
- **Enseignants** : Total + charge moyenne
- **Couverture** : Pourcentage modules avec enseignant

### Graphiques
1. **Programmes par Type** : Licence/Master/Doctorat
2. **Volumes Horaires** : CM/TD/TP
3. **Modules par Niveau** : L1/L2/L3/M1/M2
4. **Crédits par Niveau** : Total ECTS par niveau

---

## 🐛 Si Ça Ne Fonctionne Pas

### Erreur au Chargement

**Vérifiez** :
1. **Console** (F12 → Console) - Message d'erreur ?
2. **Network** (F12 → Network) - Code HTTP (404, 500, etc.) ?
3. **Backend** - Le serveur Laravel est-il démarré ?

**Test Manuel de l'API** :
```bash
curl http://localhost:8000/api/admin/stats/structure/global \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Le Dashboard Est Vide

**Cause** : Pas de données dans la base
**Solution** : Créez des programmes et modules d'abord

### Export Excel Ne Fonctionne Pas

**Vérifiez** :
1. La console pour les erreurs
2. Que l'endpoint `/export` existe
3. Les permissions du dossier storage

---

## 📞 Besoin d'Aide ?

**Partagez-moi** :
- Capture d'écran du dashboard
- Console (F12 → Console)
- Message d'erreur exact

**Je Vous Aiderai !** 🛠️

---

**Bon test ! 🚀**

