# Migration et Structure du Module CMS Frontend

## Vue d'ensemble

Le module CMS Frontend a été créé pour permettre l'affichage public des contenus créés via le CMS Admin, sans nécessiter d'authentification.

## Structure des fichiers créés

```
src/modules/Cms/frontend/
├── services/                           # Services API (publics, sans auth)
│   ├── pageService.ts                  # Service pour les pages
│   ├── blockService.ts                 # Service pour les blocs
│   ├── menuService.ts                  # Service pour les menus
│   └── settingsService.ts              # Service pour les paramètres
│
├── hooks/                              # Hooks React (Client Components)
│   ├── usePages.ts                     # Hooks pour les pages
│   ├── useBlocks.ts                    # Hooks pour les blocs
│   ├── useMenus.ts                     # Hooks pour les menus
│   └── useSettings.ts                  # Hooks pour les paramètres
│
├── components/
│   ├── blocks/                         # Composants pour chaque type de bloc
│   │   ├── BlockRenderer.tsx           # ⭐ Renderer principal pour tous les blocs
│   │   ├── TextBlock.tsx               # Bloc texte simple
│   │   ├── HtmlBlock.tsx               # Bloc HTML personnalisé
│   │   ├── HeroBlock.tsx               # Section hero avec image de fond
│   │   ├── CtaBlock.tsx                # Call-to-action
│   │   ├── FeaturesBlock.tsx           # Grille de fonctionnalités
│   │   ├── TestimonialsBlock.tsx       # Témoignages clients
│   │   ├── GalleryBlock.tsx            # Galerie d'images
│   │   ├── VideoBlock.tsx              # Vidéo embarquée
│   │   ├── ContactBlock.tsx            # Formulaire de contact
│   │   ├── FaqBlock.tsx                # Questions fréquentes (accordion)
│   │   ├── PricingBlock.tsx            # Tableau de prix
│   │   ├── TeamBlock.tsx               # Équipe
│   │   ├── StatsBlock.tsx              # Statistiques
│   │   └── NewsletterBlock.tsx         # Inscription newsletter
│   │
│   ├── templates/                      # Templates de page
│   │   ├── PageTemplate.tsx            # ⭐ Renderer principal pour tous les templates
│   │   ├── DefaultTemplate.tsx         # Template standard
│   │   ├── HomeTemplate.tsx            # Template page d'accueil
│   │   ├── ContactTemplate.tsx         # Template contact (2 colonnes)
│   │   ├── LandingTemplate.tsx         # Template landing page
│   │   ├── FullWidthTemplate.tsx       # Template pleine largeur
│   │   └── SidebarTemplate.tsx         # Template avec sidebar
│   │
│   ├── CmsMenu.tsx                     # Composant menu CMS
│   ├── CmsHeader.tsx                   # Composant header avec menu
│   └── CmsFooter.tsx                   # Composant footer avec menu
│
├── styles/
│   └── cms-content.css                 # Styles pour le contenu HTML des pages
│
├── index.ts                            # ⭐ Exports du module
├── README.md                           # Documentation du module
├── INSTALLATION.md                     # Guide d'installation
└── USAGE_EXAMPLES.md                   # Exemples d'utilisation

src/app/[lang]/(blank-layout-pages)/cms/
├── layout.tsx                          # Layout CMS avec header/footer
├── page.tsx                            # Page d'accueil CMS
└── [slug]/
    └── page.tsx                        # Pages dynamiques CMS
```

## Fonctionnalités implémentées

### ✅ Services API (Server-side)

**Pages :**
- ✅ `getPages()` - Liste des pages publiées
- ✅ `getPageBySlug()` - Page par slug
- ✅ `getHomePage()` - Page d'accueil
- ✅ `getPagesTree()` - Arbre des pages

**Blocs :**
- ✅ `getBlocks()` - Liste des blocs actifs
- ✅ `getBlockByIdentifier()` - Bloc par identifiant
- ✅ `getMultipleBlocks()` - Plusieurs blocs en une requête

**Menus :**
- ✅ `getMenuByIdentifier()` - Menu par identifiant
- ✅ `getMenuByLocation()` - Menu par emplacement (header, footer, etc.)

**Paramètres :**
- ✅ `getPublicSettings()` - Tous les paramètres publics
- ✅ `getSettingByKey()` - Paramètre par clé
- ✅ `getMultipleSettings()` - Plusieurs paramètres

### ✅ Hooks React (Client-side)

**Pages :**
- ✅ `usePages()` - Liste des pages avec pagination
- ✅ `usePage()` - Page unique par slug
- ✅ `useHomePage()` - Page d'accueil
- ✅ `usePagesTree()` - Arbre de navigation

**Blocs :**
- ✅ `useBlocks()` - Liste des blocs avec filtres
- ✅ `useBlock()` - Bloc unique par identifiant
- ✅ `useMultipleBlocks()` - Plusieurs blocs

**Menus :**
- ✅ `useMenu()` - Menu par identifiant
- ✅ `useMenuByLocation()` - Menu par emplacement

**Paramètres :**
- ✅ `useSettings()` - Tous les paramètres
- ✅ `useSetting()` - Paramètre unique
- ✅ `useMultipleSettings()` - Plusieurs paramètres

### ✅ Composants Blocs (14 types)

Tous les 14 types de blocs définis dans l'API sont implémentés :

1. ✅ **TextBlock** - Texte simple
2. ✅ **HtmlBlock** - HTML personnalisé
3. ✅ **HeroBlock** - Section hero avec image de fond et CTA
4. ✅ **CtaBlock** - Call-to-action
5. ✅ **FeaturesBlock** - Grille de fonctionnalités (icônes + texte)
6. ✅ **TestimonialsBlock** - Témoignages avec avatars
7. ✅ **GalleryBlock** - Galerie d'images responsive
8. ✅ **VideoBlock** - Vidéo embarquée (iframe)
9. ✅ **ContactBlock** - Formulaire de contact
10. ✅ **FaqBlock** - FAQ avec accordéons
11. ✅ **PricingBlock** - Tableau de prix
12. ✅ **TeamBlock** - Équipe avec avatars
13. ✅ **StatsBlock** - Statistiques
14. ✅ **NewsletterBlock** - Inscription newsletter

### ✅ Templates de Page (6 types)

Tous les 6 templates définis dans l'API sont implémentés :

1. ✅ **DefaultTemplate** - Template standard avec conteneur
2. ✅ **HomeTemplate** - Page d'accueil (blocs full-width)
3. ✅ **ContactTemplate** - Page contact (grille 2 colonnes)
4. ✅ **LandingTemplate** - Landing page (optimisée conversion)
5. ✅ **FullWidthTemplate** - Pleine largeur avec hero image
6. ✅ **SidebarTemplate** - Avec barre latérale

### ✅ Composants de Navigation

- ✅ **CmsMenu** - Menu vertical ou horizontal avec sous-menus
- ✅ **CmsHeader** - Header avec logo et menu
- ✅ **CmsFooter** - Footer avec menu et infos

### ✅ Routes Next.js

- ✅ `/[lang]/cms` - Page d'accueil CMS
- ✅ `/[lang]/cms/[slug]` - Pages dynamiques
- ✅ Layout CMS avec header/footer automatiques

### ✅ Styles et Documentation

- ✅ CSS pour le contenu HTML
- ✅ README complet
- ✅ Guide d'installation
- ✅ Guide avec exemples d'utilisation

## Utilisation

### Import rapide

```tsx
// Tout est exporté depuis l'index
import {
  // Services
  getPageBySlug,
  getBlocks,
  getMenuByLocation,

  // Hooks
  usePage,
  useBlocks,
  useMenu,

  // Components
  PageTemplate,
  BlockRenderer,
  CmsHeader,
  CmsFooter,
  CmsMenu
} from '@/modules/Cms/frontend'
```

### Exemple complet d'une page

```tsx
// Server Component
import { getPageBySlug } from '@/modules/Cms/frontend'
import { PageTemplate } from '@/modules/Cms/frontend'
import { notFound } from 'next/navigation'

export default async function AboutPage() {
  let page

  try {
    page = await getPageBySlug('about')
  } catch (error) {
    notFound()
  }

  if (!page || !page.is_active || page.status !== 'published') {
    notFound()
  }

  return <PageTemplate page={page} />
}
```

## Configuration requise

### 1. Variables d'environnement

```env
NEXT_PUBLIC_API_URL=/api
```

### 2. Import CSS

```tsx
// app/layout.tsx
import '@/modules/Cms/frontend/styles/cms-content.css'
```

### 3. Backend API

Endpoints requis (voir DOCUMENTATION_API_CMS.md) :
- `/api/cms/pages/*`
- `/api/cms/blocks/*`
- `/api/cms/menus/*`
- `/api/cms/settings/*`

## Avantages de cette architecture

### 🎯 Séparation claire

- **Superadmin** (`src/modules/Cms/superadmin/`) : CRUD complet avec authentification
- **Frontend** (`src/modules/Cms/frontend/`) : Lecture seule, public, sans auth

### 🚀 Performance

- Services optimisés pour Server Components (Next.js 15)
- Hooks pour Client Components quand nécessaire
- Pas de props drilling grâce aux hooks

### 🎨 Flexibilité

- Templates personnalisables
- Blocs extensibles
- Styles CSS modifiables
- Layout adaptatif

### 📱 Responsive

- Tous les composants sont responsive
- Mobile-first design
- Utilisation de MUI Grid

### ♿ Accessible

- Sémantique HTML correcte
- Support clavier
- ARIA labels appropriés

### 🔍 SEO-friendly

- Metadata dynamique
- Server-side rendering
- URLs propres

## Prochaines étapes possibles

### Améliorations futures (optionnelles)

- [ ] Système de cache côté client (React Query, SWR)
- [ ] Mode prévisualisation pour le contenu draft
- [ ] Internationalisation des blocs
- [ ] Analytics et tracking
- [ ] A/B testing des blocs
- [ ] Recherche full-text
- [ ] Commentaires sur les pages
- [ ] Partage social
- [ ] Breadcrumbs automatiques
- [ ] Sitemap XML automatique

### Extensibilité

Le système est conçu pour être facilement extensible :

1. **Nouveaux types de blocs** : Ajouter un composant + case dans BlockRenderer
2. **Nouveaux templates** : Ajouter un composant + case dans PageTemplate
3. **Nouveaux hooks** : Créer dans `hooks/` et exporter dans `index.ts`
4. **Nouveaux services** : Créer dans `services/` et exporter dans `index.ts`

## Points d'attention

### ⚠️ Sécurité

- Le contenu HTML est inséré avec `dangerouslySetInnerHTML`
- Assurez-vous que le backend sanitize le HTML
- Validez toutes les URLs de redirection

### ⚠️ Performance

- Les images doivent être optimisées côté backend
- Utilisez Next.js Image pour les images CMS
- Activez le caching pour la production

### ⚠️ Erreurs

- Toujours gérer les erreurs dans les services
- Afficher des fallbacks appropriés
- Logger les erreurs en production

## Support

Pour toute question ou problème :

1. Consultez [INSTALLATION.md](./src/modules/Cms/frontend/INSTALLATION.md)
2. Consultez [USAGE_EXAMPLES.md](./src/modules/Cms/frontend/USAGE_EXAMPLES.md)
3. Vérifiez la console navigateur et les logs serveur
4. Vérifiez que l'API backend répond correctement

## Conclusion

Le module CMS Frontend est maintenant **100% fonctionnel** et prêt à l'emploi :

✅ 4 services API complets
✅ 4 groupes de hooks React
✅ 14 types de blocs
✅ 6 templates de page
✅ 3 composants de navigation
✅ Routes Next.js configurées
✅ Styles CSS inclus
✅ Documentation complète

**Le module est production-ready ! 🚀**
