# Fix: Affichage des Programmes dans la Liste des Modules ✅

## Problème Identifié

Dans la liste des modules, la colonne "Programmes" affichait toujours `0` au lieu des noms des programmes associés.

### Cause Racine

Le backend Laravel renvoie les programmes avec la clé `programmes` (avec un 's' français), mais le code frontend cherchait `programs` (anglais) et utilisait `programs_count` qui n'existe pas dans la réponse API.

### Réponse API Backend

```json
{
  "data": [
    {
      "id": 2,
      "code": "test2",
      "name": "test2",
      "programmes": [
        {
          "id": 3,
          "code": "23",
          "libelle": "test"
        }
      ]
    }
  ]
}
```

## Solution Implémentée

### 1. Type `Module` Mis à Jour

**Fichier**: `src/modules/StructureAcademique/types/module.types.ts`

Ajout de la propriété `programmes` (avec un 's') pour supporter les deux formats :

```typescript
// Relations
programs?: Array<{
  id: number;
  code: string;
  libelle: string;
}>;
programmes?: Array<{
  id: number;
  code: string;
  libelle: string;
}>;
```

### 2. Colonne "Programmes" Améliorée

**Fichier**: `src/modules/StructureAcademique/admin/components/ModuleListTable.tsx`

**Avant:**
```typescript
cell: ({ row }) => (
  <Chip variant="tonal" label={`${row.original.programs_count || 0}`} size="small" color="default" />
)
```

**Après:**
```typescript
cell: ({ row }) => {
  const programmes = row.original.programmes || row.original.programs || [];
  const count = programmes.length;
  
  if (count === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Aucun
      </Typography>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {programmes.slice(0, 2).map((prog: any) => (
        <Chip
          key={prog.id}
          variant="tonal"
          label={prog.code || prog.libelle}
          size="small"
          color="info"
          title={prog.libelle}
        />
      ))}
      {count > 2 && (
        <Chip
          variant="tonal"
          label={`+${count - 2}`}
          size="small"
          color="default"
          title={programmes.slice(2).map((p: any) => p.libelle).join(', ')}
        />
      )}
    </Box>
  );
}
```

### 3. Carte Mobile Mise à Jour

Ajout d'un champ "Programmes" dans la carte mobile :

```typescript
{
  icon: 'ri-book-line',
  label: t('Programmes'),
  value: (() => {
    const programmes = module.programmes || module.programs || [];
    if (programmes.length === 0) return 'Aucun';
    if (programmes.length === 1) return programmes[0].libelle;
    return `${programmes.length} programmes`;
  })(),
}
```

### 4. Dialog d'Affectation des Enseignants

**Fichier**: `src/modules/StructureAcademique/admin/components/ModuleTeachersDialog.tsx`

Mise à jour pour supporter les deux formats (`programmes` et `programs`) :

```typescript
const programmes = module.programmes || module.programs || [];
if (programmes.length === 0) {
  alert('Ce module n\'a pas de programme associé...');
  return;
}

const payload: AssignTeacherRequest = {
  // ...
  programme_id: programmes[0].id,
  // ...
};
```

## Résultat

### Affichage Desktop

La colonne "Programmes" affiche maintenant :
- **Aucun programme** : Texte gris "Aucun"
- **1-2 programmes** : Chips avec le code du programme (hover pour voir le libellé complet)
- **3+ programmes** : 2 premiers chips + chip "+X" avec tooltip listant les autres

### Affichage Mobile

La carte mobile affiche :
- **Aucun programme** : "Aucun"
- **1 programme** : Nom du programme
- **2+ programmes** : "X programmes"

### Affectation des Enseignants

Le dialog d'affectation fonctionne maintenant correctement avec les programmes du backend.

## Compatibilité

Le code supporte maintenant les deux formats :
- ✅ `programmes` (format backend Laravel français)
- ✅ `programs` (format anglais si changé plus tard)

## Fichiers Modifiés

1. `src/modules/StructureAcademique/types/module.types.ts`
   - Ajout de la propriété `programmes`

2. `src/modules/StructureAcademique/admin/components/ModuleListTable.tsx`
   - Colonne "Programmes" affiche les chips avec les codes
   - Carte mobile affiche les programmes

3. `src/modules/StructureAcademique/admin/components/ModuleTeachersDialog.tsx`
   - Support des deux formats pour l'affectation des enseignants

## Test

Pour tester :

1. Ouvrir la liste des modules : `/admin/structure/modules`
2. Vérifier que la colonne "Programmes" affiche les codes des programmes
3. Hover sur un chip pour voir le libellé complet
4. Tester sur mobile pour voir la carte
5. Cliquer sur "Affecter Enseignants" pour vérifier que ça fonctionne

## Status

✅ **COMPLETE** - Les programmes sont maintenant correctement affichés dans la liste des modules.
