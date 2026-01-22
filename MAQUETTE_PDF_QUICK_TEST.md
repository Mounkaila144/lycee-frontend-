# 🧪 Test Rapide - Maquette PDF

## ✅ Frontend Prêt !

L'interface de génération de maquettes PDF est **complète et prête à tester**.

---

## 🎯 Test en 5 Étapes

### 1. Accédez à la Liste des Programmes
```
Menu → Structure Académique → Programmes
```

### 2. Trouvez le Bouton PDF
Dans chaque ligne de programme, cherchez :
- **Icône** : 📄 (ri-file-pdf-line)
- **Couleur** : Rouge
- **Position** : Après le bouton "Modules Éliminatoires" (⚠️)
- **Tooltip** : "Générer Maquette PDF"

```
Actions: [...] [⚠️] [📄] [▶️] [📜] [🗑️] [✏️]
                      ↑
                 NOUVEAU !
```

### 3. Cliquez sur le Bouton
Le dialog "Générer Maquette Pédagogique" s'ouvre.

### 4. Configurez et Générez
- **Portée** : Laissez "Programme complet"
- **Options** : Laissez les valeurs par défaut
- Cliquez sur **"Générer PDF"**
- Attendez quelques secondes

### 5. Téléchargez
- Message de succès s'affiche
- Cliquez sur **"Télécharger"**
- Le PDF se télécharge automatiquement

---

## ✅ Checklist Rapide

- [ ] Le bouton 📄 rouge apparaît dans la liste
- [ ] Le dialog s'ouvre au clic
- [ ] Je peux sélectionner la portée
- [ ] Je peux cocher/décocher les options
- [ ] Le bouton "Générer PDF" fonctionne
- [ ] Un message de succès s'affiche
- [ ] Le bouton "Télécharger" apparaît
- [ ] Le PDF se télécharge
- [ ] Le PDF s'ouvre correctement

---

## 🐛 Si Ça Ne Fonctionne Pas

### Erreur au Clic sur "Générer PDF"

**Vérifiez** :
1. **Console** (F12 → Console) - Quel est le message d'erreur ?
2. **Network** (F12 → Network) - Quel est le code HTTP (404, 500, etc.) ?
3. **Backend** - Le serveur Laravel est-il démarré ?

**Test Manuel de l'API** :
```bash
curl -X POST http://localhost:8000/api/admin/programmes/1/generate-maquette \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"scope":"programme"}'
```

### Le Bouton N'Apparaît Pas

**Solution** :
1. Rechargez la page (Ctrl+R)
2. Vérifiez la console pour les erreurs
3. Vérifiez que vous êtes sur la bonne page

---

## 📊 Ce Que Vous Devriez Voir

### Dialog de Génération

```
┌─────────────────────────────────────────────┐
│ 📄 Générer Maquette Pédagogique        [X] │
├─────────────────────────────────────────────┤
│                                             │
│ Programme                                   │
│ ┌─────────────────────────────────────┐   │
│ │ INFO-L3 - Licence Informatique      │   │
│ │ [Licence] [3 ans]                   │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ Portée de la maquette                      │
│ [Programme complet ▼]                      │
│                                             │
│ Options d'affichage                        │
│ ☑ Afficher les enseignants                │
│ ☑ Détail des volumes horaires             │
│ ☑ Inclure les modules optionnels          │
│ ☐ Inclure les spécialités                 │
│                                             │
│                  [Annuler] [Générer PDF]   │
└─────────────────────────────────────────────┘
```

### Après Génération

```
┌─────────────────────────────────────────────┐
│ 📄 Générer Maquette Pédagogique        [X] │
├─────────────────────────────────────────────┤
│                                             │
│ ✅ Maquette générée avec succès !          │
│    maquette_INFO-L3_2026-01-17.pdf         │
│                                             │
│                  [Fermer] [Télécharger]    │
└─────────────────────────────────────────────┘
```

---

## 📞 Besoin d'Aide ?

**Partagez-moi** :
- Capture d'écran de la page
- Console (F12 → Console)
- Message d'erreur exact

**Je Vous Aiderai !** 🛠️

---

**Bon test ! 🚀**

