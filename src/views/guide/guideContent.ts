/**
 * Contenu du « Guide d'utilisation » public (/[lang]/guide).
 *
 * Source de vérité : les fichiers `src/modules/* /menu.config.ts` (entrées visibles,
 * `requiredRoles`), `src/shared/lib/auth/filterMenuItems.ts` (un item sans
 * `requiredRoles` n'est visible que pour Administrator/Manager ; un parent masqué
 * masque ses enfants), `config/role-routes.php` côté Laravel (page d'accueil après
 * connexion) et les composants des pages. Mettre ce fichier à jour quand un menu
 * ou une page change.
 */

export type RoleId = 'superadmin' | 'admin' | 'manager' | 'professeur' | 'eleve' | 'parent' | 'caissier' | 'comptable'

export interface RoleOverview {
  id: RoleId
  label: string
  account: string
  summary: string
  home: string
  can: string[]
  cannot: string[]
}

export interface MenuFeature {
  /** Chemin dans le menu latéral, ex. « Notes > Saisie des notes ». */
  path: string
  /** Route sans préfixe de langue. */
  route?: string
  description?: string
  actions: string[]
}

export interface RoleGuide {
  roleId: RoleId
  intro?: string
  features: MenuFeature[]
}

export interface DemoAccount {
  role: string
  username: string
  password: string
  note: string
  copyable?: boolean
}

export interface ClassAccounts {
  classe: string
  eleves: string
  parents: string
  headTeacher: string
}

export interface JourneyStep {
  actor: string
  path: string
  action: string
}

export interface Journey {
  id: string
  title: string
  summary: string
  steps: JourneyStep[]
}

export interface DemoScenario {
  id: string
  title: string
  account: string
  steps: string[]
  expected: string
}

export interface FaqItem {
  q: string
  a: string
}

export const DEFAULT_SITE_URL = 'https://jandoosecondaire.ptrniger.com'

export const TOC = [
  { id: 'presentation', label: 'Présentation et rôles', icon: 'ri-information-line' },
  { id: 'comptes', label: 'Comptes de démonstration', icon: 'ri-key-2-line' },
  { id: 'roles', label: 'Guide par rôle', icon: 'ri-team-line' },
  { id: 'parcours', label: 'Parcours de bout en bout', icon: 'ri-route-line' },
  { id: 'demos', label: 'Scénarios de démonstration', icon: 'ri-slideshow-line' },
  { id: 'faq', label: 'FAQ et dépannage', icon: 'ri-question-line' }
]

export const GUIDE_INTRO = {
  subtitle: 'Jandoo Secondaire : gestion d’un collège-lycée (scolarité, notes, présences, examens, finances, paie).',
  paragraphs: [
    'Jandoo Secondaire est une application multi-établissements : chaque école (« site » ou « tenant ») dispose de sa propre base de données et de ses propres utilisateurs. La plateforme est administrée par un super-administrateur qui crée et active les écoles ; chaque école est ensuite gérée par sa direction.',
    'L’organisation pédagogique suit le modèle du secondaire : année scolaire découpée en semestres (S1, S2), cycles et niveaux (6ème à Terminale), séries (A, C, D) en 1ère et Terminale, classes (ex. « 6ème A », « Tle D1 »), matières et coefficients par niveau/série. Les notes sont saisies par évaluation (devoir, interrogation, composition) et ne deviennent visibles des élèves et des parents qu’après publication par la direction.',
    'Après connexion, chaque utilisateur est redirigé vers la page d’accueil de son rôle et ne voit dans le menu latéral que les entrées autorisées. Une page ouverte par son adresse sans en avoir le droit affiche « Accès refusé » ; le serveur refuse de toute façon les actions non autorisées.'
  ]
}

export const LOGIN_PATHS = [
  {
    label: 'Connexion école (tous les rôles de l’établissement)',
    path: '/fr/login',
    note: 'Administrator, Manager, Professeur, Élève, Parent, Caissier, Comptable.'
  },
  {
    label: 'Connexion super-admin (plateforme)',
    path: '/fr/loginsuperadmin',
    note: 'Adresse équivalente : /fr/superadmin/login. Après connexion : tableau de bord super-admin puis menu « Sites ».'
  }
]

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'Super-admin (plateforme)',
    username: 'demo.superadmin',
    password: 'Jandoo-Demo-2026!',
    note: 'Gestion de toutes les écoles. Se connecte uniquement via la page de connexion super-admin.'
  },
  { role: 'Administrator (direction)', username: 'demo.admin', password: 'password', note: 'Accès complet à l’école.' },
  {
    role: 'Manager (censeur / surveillant général)',
    username: 'manager',
    password: 'password',
    note: 'Comme l’administrateur, sauf Réglages, clôture de caisse et rapprochement bancaire.'
  },
  { role: 'Caissier', username: 'demo.caissier', password: 'password', note: 'Encaissements, reçus, clôture de caisse.' },
  { role: 'Comptable', username: 'demo.comptable', password: 'password', note: 'Facturation, rapports financiers, paie.' },
  {
    role: 'Professeur (Mathématiques)',
    username: 'prof.maths',
    password: 'password',
    note: 'Professeur principal (répartition initiale) de 6ème A, 4ème A, 2nde A et 1ère D1.'
  },
  {
    role: 'Professeur (Français)',
    username: 'prof.francais',
    password: 'password',
    note: 'Professeur principal (répartition initiale) de 6ème B, 4ème B, 2nde B et Tle A1.'
  },
  {
    role: 'Professeur (SVT)',
    username: 'prof.svt',
    password: 'password',
    note: 'Professeur principal (répartition initiale) de 5ème A, 3ème A, 1ère A1 et Tle C1.'
  },
  {
    role: 'Professeur (Histoire-Géographie)',
    username: 'prof.hg',
    password: 'password',
    note: 'Professeur principal (répartition initiale) de 5ème B, 3ème B, 1ère C1 et Tle D1.'
  },
  {
    role: 'Professeurs (Anglais, Physique-Chimie, Philosophie, EPS)',
    username: 'prof.anglais / prof.pc / prof.philo / prof.eps',
    password: 'password',
    note: 'Ajoutés par le jeu de données d’activité (s’ils sont absents, utilisez les quatre professeurs ci-dessus).',
    copyable: false
  },
  {
    role: 'Élève',
    username: 'eleve.001 … eleve.096',
    password: 'password',
    note: 'Un compte par élève (numéro sur 3 chiffres). Voir le tableau des classes ci-dessous.',
    copyable: false
  },
  {
    role: 'Parent',
    username: 'parent.001 … parent.096',
    password: 'password',
    note: 'parent.XXX est le parent de eleve.XXX (même numéro).',
    copyable: false
  }
]

export const CLASS_ACCOUNTS_NOTE = [
  'Les comptes élèves sont numérotés dans l’ordre des classes : 6 élèves par classe, de la 6ème A à la Tle D1. Le parent porte le même numéro que son enfant : eleve.014 (5ème A) a pour parent parent.014.',
  'Exemples : eleve.001 → 6ème A → parent.001 (professeur principal prof.maths) ; eleve.050 → 1ère D1 → parent.050 ; eleve.096 → Tle D1 → parent.096.',
  'La colonne « Professeur principal » donne la répartition initiale : le jeu de données d’activité peut la réattribuer à un professeur qui enseigne dans la classe. La valeur à jour est visible dans Structure Académique > Classes (ou sur l’accueil « Mes classes » du professeur).'
]

const CLASS_ORDER: Array<[string, string]> = [
  ['6ème A', 'prof.maths'],
  ['6ème B', 'prof.francais'],
  ['5ème A', 'prof.svt'],
  ['5ème B', 'prof.hg'],
  ['4ème A', 'prof.maths'],
  ['4ème B', 'prof.francais'],
  ['3ème A', 'prof.svt'],
  ['3ème B', 'prof.hg'],
  ['2nde A', 'prof.maths'],
  ['2nde B', 'prof.francais'],
  ['1ère A1', 'prof.svt'],
  ['1ère C1', 'prof.hg'],
  ['1ère D1', 'prof.maths'],
  ['Tle A1', 'prof.francais'],
  ['Tle C1', 'prof.svt'],
  ['Tle D1', 'prof.hg']
]

const STUDENTS_PER_CLASS = 6

const pad = (value: number): string => String(value).padStart(3, '0')

export const CLASS_ACCOUNTS: ClassAccounts[] = CLASS_ORDER.map(([classe, headTeacher], index) => {
  const first = index * STUDENTS_PER_CLASS + 1
  const last = first + STUDENTS_PER_CLASS - 1

  return {
    classe,
    eleves: `eleve.${pad(first)} … eleve.${pad(last)}`,
    parents: `parent.${pad(first)} … parent.${pad(last)}`,
    headTeacher
  }
})

export const ROLE_OVERVIEWS: RoleOverview[] = [
  {
    id: 'superadmin',
    label: 'Super-admin',
    account: 'demo.superadmin',
    summary: 'Administre la plateforme : création, modification et activation des écoles (sites).',
    home: 'Tableau de bord super-admin (/superadmin/dashboard)',
    can: [
      'Créer une école (identifiant, société, contacts, domaines)',
      'Activer un site (exécution des migrations de sa base)',
      'Modifier, consulter ou supprimer un site'
    ],
    cannot: [
      'Gérer la vie scolaire d’une école (élèves, notes…) : il faut un compte de l’école',
      'Le tableau de bord super-admin affiche des chiffres d’exemple (non branché)',
      'L’entrée « Module Management » ne mène à aucune page (404)'
    ]
  },
  {
    id: 'admin',
    label: 'Administrator',
    account: 'demo.admin',
    summary: 'Direction de l’établissement : accès à tous les menus de l’école.',
    home: 'Tableau de bord avec indicateurs clés (/admin/dashboard)',
    can: [
      'Utilisateurs, rôles et permissions',
      'Structure académique, classes, matières, coefficients',
      'Élèves, cartes scolaires, réinscriptions, passages de classe',
      'Affectations des professeurs, publication des notes, bulletins PDF',
      'Emplois du temps, présences, examens, documents officiels',
      'Comptabilité complète (y compris clôture de caisse et rapprochement), paie',
      'Réglages de l’établissement'
    ],
    cannot: ['Saisir des notes dans une matière à la place du professeur via « Saisie des notes » (menu réservé au Professeur) — il peut en revanche ouvrir et corriger une évaluation depuis Notes > Évaluations']
  },
  {
    id: 'manager',
    label: 'Manager',
    account: 'manager',
    summary: 'Censeur / surveillant général : mêmes menus pédagogiques que l’administrateur.',
    home: 'Tableau de bord avec indicateurs clés (/admin/dashboard)',
    can: [
      'Tous les menus pédagogiques (structure, élèves, notes, EDT, présences, examens, documents)',
      'Publier / dépublier les évaluations, bulletins PDF, passages de classe',
      'Consulter Facturation, Paiements, Recouvrement (consultation seule), Rapports financiers, Paie & RH'
    ],
    cannot: [
      'Réglages de l’établissement',
      'Clôture de caisse et rapprochement bancaire',
      'Créer des factures, rembourser, générer des relances (réservé Administrator / Comptable)',
      'Gérer les rôles et permissions, supprimer un utilisateur (réservé Administrator)',
      'Utiliser la messagerie'
    ]
  },
  {
    id: 'professeur',
    label: 'Professeur',
    account: 'prof.maths',
    summary: 'Enseignant : ses classes, ses évaluations et notes, l’appel, son emploi du temps, la messagerie.',
    home: 'Accueil professeur « Mes classes » (/admin/dashboard)',
    can: [
      'Créer ses évaluations, saisir les notes, les soumettre à la direction',
      'Voir les résultats de ses classes ; bulletins PDF et appréciation générale s’il est professeur principal',
      'Faire l’appel de ses classes',
      'Consulter son emploi du temps, les examens, signaler des incidents de surveillance',
      'Échanger des messages avec les parents et l’administration'
    ],
    cannot: [
      'Publier des notes (réservé Administrator / Manager)',
      'Saisir dans une matière / classe où il n’est pas affecté',
      'Traiter les justificatifs d’absence (lecture seule)',
      'Accéder à la structure, aux élèves, aux finances, à la paie'
    ]
  },
  {
    id: 'eleve',
    label: 'Élève',
    account: 'eleve.001',
    summary: 'Portail élève en lecture : notes publiées, emploi du temps, présences, factures, documents.',
    home: 'Accueil élève (/admin/student/home)',
    can: [
      'Voir ses notes publiées, moyennes, rang et télécharger son bulletin PDF',
      'Consulter son emploi du temps, ses absences et ses factures',
      'Déposer un justificatif d’absence avec pièce jointe',
      'Télécharger ses documents officiels, voir sa carte scolaire',
      'Répondre à une campagne de réinscription'
    ],
    cannot: [
      'Voir les notes non publiées',
      'Payer en ligne (aucun bouton de paiement)',
      'Demander une attestation en ligne',
      'Utiliser la messagerie'
    ]
  },
  {
    id: 'parent',
    label: 'Parent',
    account: 'parent.001',
    summary: 'Suivi de ses enfants : fiche, présences, notes, emploi du temps, factures, documents, messagerie.',
    home: 'Accueil parent (/admin/parent/home)',
    can: [
      'Ouvrir la fiche de chaque enfant (notes publiées, bulletin PDF, absences, EDT, factures, documents)',
      'Déposer un justificatif d’absence pour un enfant',
      'Écrire aux professeurs et à l’administration'
    ],
    cannot: [
      'Payer en ligne (aucun bouton de paiement)',
      'Lire des annonces : la page « Annonces » est vide (fonction non disponible)',
      'Voir les notes non publiées'
    ]
  },
  {
    id: 'caissier',
    label: 'Caissier',
    account: 'demo.caissier',
    summary: 'Encaisse les paiements, imprime les reçus et clôture sa caisse.',
    home: 'Paiements & reçus (/admin/finance/payments)',
    can: [
      'Consulter les factures et enregistrer un paiement (reçu imprimable)',
      'Lister les paiements, résumé journalier',
      'Clôturer sa caisse (espèces comptées vs système)',
      'Consulter le recouvrement'
    ],
    cannot: [
      'Créer une facture, rembourser un paiement',
      'Générer / envoyer des relances, bloquer des services, créer un échéancier',
      'Rapports financiers, rapprochement, paie, pédagogie'
    ]
  },
  {
    id: 'comptable',
    label: 'Comptable',
    account: 'demo.comptable',
    summary: 'Facturation, encaissements, recouvrement, rapports financiers, rapprochement et paie.',
    home: 'Rapports financiers (/admin/finance/reports)',
    can: [
      'Créer des factures, encaisser, rembourser',
      'Relances, blocages de services, échéanciers, passage en perte',
      'Rapports financiers et export comptable CSV',
      'Comptes bancaires (rapprochement)',
      'Paie & RH complète : employés, contrats, périodes de paie, déclarations'
    ],
    cannot: ['Accéder à la pédagogie (structure, élèves, notes, présences, examens)']
  }
]

/* ------------------------------------------------------------------------- */
/* Fonctionnalités par menu (réutilisées entre rôles)                         */
/* ------------------------------------------------------------------------- */

const F = {
  users: {
    path: 'Utilisateurs (entrée « users » du menu)',
    route: '/admin/users',
    actions: [
      'Rechercher un utilisateur dans le tableau (colonnes Nom d’utilisateur, Email, Application, Statut, Rôles…).',
      '« Ajouter » → renseigner Nom d’utilisateur, Mot de passe (8 caractères min.), prénom, nom, email, Application (Admin pour le personnel, Frontend pour élèves/parents), Actif, puis choisir les rôles → « Create User ».',
      'Icône Modifier → changer les informations ou les rôles ; cocher « Change Password » pour définir un nouveau mot de passe → « Update User ».',
      'Administrator uniquement : « Manage Roles » / « Manage Permissions » (créer ou modifier un rôle et ses permissions) et suppression d’un utilisateur (icône poubelle).'
    ]
  },
  academicYears: {
    path: 'Structure Académique > Années Scolaires',
    route: '/admin/structure/academic-years',
    actions: [
      '« Nouvelle année » → Nom (ex. 2026-2027), dates de début et de fin (6 mois minimum) → « Enregistrer ».',
      'Icône « Activer cette année » : l’année active sert de référence partout (classes, notes, factures).',
      'Icône « Gérer les semestres » → « Nouveau semestre » (S1, S2 : dates, période des cours et des examens optionnelles).',
      'Dans un semestre : « Gérer les périodes » (vacances, jours fériés, sessions d’examens…) et « Périodes d’évaluation ».',
      '« Clôturer » un semestre (irréversible) : bloque ensuite la création d’évaluations et la saisie des notes de ce semestre.'
    ]
  },
  cycles: {
    path: 'Structure Académique > Cycles et Niveaux',
    route: '/admin/structure/cycles-levels',
    actions: [
      'Cycles et niveaux (6ème à Terminale) pré-configurés : activer/désactiver un cycle avec l’interrupteur.',
      'Flèche → afficher les niveaux du cycle (lecture seule).'
    ]
  },
  series: {
    path: 'Structure Académique > Séries',
    route: '/admin/structure/series',
    actions: ['Séries A, C, D pré-configurées (1ère et Terminale) : activer/désactiver avec l’icône œil.']
  },
  classes: {
    path: 'Structure Académique > Classes',
    route: '/admin/structure/classes',
    actions: [
      'Filtrer par Cycle, Niveau, Série → « Filtrer ».',
      '« Nouvelle classe » (nécessite une année active) → Niveau, Série (ou « Aucune (tronc commun) »), Section (A, B, 1…), Capacité maximale, Professeur principal → enregistrer. Le nom (ex. « Tle D1 ») est généré automatiquement.',
      'Par ligne : « Voir les élèves » (liste de la classe), « Modifier », « Supprimer ».'
    ]
  },
  subjects: {
    path: 'Structure Académique > Matières',
    route: '/admin/structure/subjects',
    actions: [
      '« Nouvelle matière » → Code (MATH, FRAN…), Nom complet, Nom abrégé, Catégorie, Description.',
      'Activer/désactiver une matière avec l’interrupteur ; « Modifier » / « Supprimer ».'
    ]
  },
  coefficients: {
    path: 'Structure Académique > Coefficients',
    route: '/admin/structure/coefficients',
    actions: [
      'Choisir le Niveau (et la Série en 1ère / Terminale).',
      '« Modifier » sur une matière → Coefficient et Heures par semaine. La ligne Total récapitule.',
      'Ces coefficients déterminent les matières d’une classe (Notes > Affectations) et le calcul des moyennes.'
    ]
  },
  students: {
    path: 'Inscriptions > Élèves',
    route: '/admin/enrollment/students',
    actions: [
      '« Ajouter » → identité, coordonnées, contact d’urgence → « Créer » (matricule généré automatiquement ; alerte en cas de doublon probable, second clic pour forcer).',
      '« Importer » → télécharger le modèle, déposer un fichier .csv/.xlsx, faire correspondre les colonnes, « Prévisualiser » puis « Importer N étudiants ».',
      '« Export Excel » de la liste.',
      'Par ligne : « Voir détails » (onglets Informations, Documents, Statuts — « Changer le statut », Audit), « Modifier », « Situation financière » (factures PDF ; « Nouvelle facture » pour Administrator / Comptable), « Supprimer ».',
      'Limite actuelle : cet écran ne crée ni compte de connexion élève, ni parent, ni affectation en classe (voir FAQ).'
    ]
  },
  enrollmentStats: {
    path: 'Inscriptions > Statistiques',
    route: '/admin/enrollment/statistics',
    actions: [
      'Indicateurs (total, actifs, nouveaux, réinscriptions) et onglets Vue d’ensemble, Démographie, Tendances.',
      '« Exporter » → Rapport exécutif (PDF), Tableau de bord complet (PDF) ou Export Excel → « Générer ».'
    ]
  },
  cards: {
    path: 'Inscriptions > Cartes Scolaires',
    route: '/admin/enrollment/student-cards',
    actions: [
      '« Générer des cartes » → année, « Étudiant unique » ou « Lot d’étudiants » → « Générer ».',
      'Par carte : « Voir la carte », « Télécharger PDF », « Modifier statut », « Statut impression », « Générer duplicata », « Supprimer la carte ».',
      '« Vérifier une carte » : saisie manuelle des données du QR code.',
      'Attention : « Imprimer (N) » ne télécharge actuellement que la première carte sélectionnée.'
    ]
  },
  campaigns: {
    path: 'Inscriptions > Campagnes Réinscription',
    route: '/admin/enrollment/reenrollment-campaigns',
    actions: [
      '« Nouvelle Campagne » → nom, année source, année cible, dates, options (apurement financier, documents requis).',
      'Menu « Actions » : « Activer » (brouillon), « Clôturer » (active), « Statistiques », « Modifier », « Supprimer ».',
      'Une campagne active permet aux élèves de répondre « Oui, je me réinscris » / « Non » depuis leur portail.'
    ]
  },
  promotions: {
    path: 'Inscriptions > Passages de classe',
    route: '/admin/enrollment/reenrollments',
    actions: [
      'Choisir Année source, Classe, Année cible (l’année cible doit exister).',
      'Le tableau propose pour chaque élève une décision à partir de la moyenne annuelle et du rang (et affiche son souhait de réinscription).',
      'Ajuster la Décision : Passage (choisir la classe cible), Redoublement, Départ (motif : Abandon, Transfert, Exclusion, Diplôme).',
      'Cocher les élèves → « Valider la sélection (N) » : les élèves sont affectés dans leur classe de l’année cible. « Réinitialiser les propositions » recalcule.'
    ]
  },
  assignments: {
    path: 'Notes > Affectations',
    route: '/admin/grades/assignments',
    actions: [
      'Choisir une classe dans la colonne « Classes » (année active).',
      'Pour chaque matière de la classe (issue des coefficients) choisir le Professeur → « Enregistrer ».',
      'Seul le professeur affecté peut créer des évaluations et saisir les notes de la matière dans cette classe.'
    ]
  },
  evaluations: {
    path: 'Notes > Évaluations',
    route: '/admin/grades/evaluations',
    actions: [
      'Filtres Classe, Matière, Semestre, Statut (par défaut : « Soumise » = en attente de publication).',
      '« Notes » → ouvrir la grille de saisie (correction possible ; « Publier » / « Dépublier » aussi depuis cette page).',
      '« Publier » par ligne, ou cocher des évaluations soumises → « Publier la sélection (n) », ou « Publier toutes les soumises » du semestre.',
      '« Dépublier » repasse l’évaluation en « Soumise » (masquée des élèves et parents).',
      'Seules les évaluations publiées sont visibles des élèves/parents et comptent dans les bulletins.'
    ]
  },
  results: {
    path: 'Notes > Résultats & bulletins',
    route: '/admin/grades/class-results',
    actions: [
      'Choisir Classe et Semestre : moyennes par matière, moyenne générale, rang, mention, distinction.',
      'Cocher « Inclure les notes non publiées » pour une vue provisoire.',
      '« Bulletins PDF » : bulletins de toute la classe ; « PDF » sur une ligne : bulletin d’un élève (notes publiées uniquement).',
      '« Appréciations » par élève : appréciation générale (conseil de classe) et appréciations par matière → « Enregistrer ».'
    ]
  },
  timetableSchedule: {
    path: 'Emplois du Temps > Planification',
    route: '/admin/timetable/schedule',
    actions: [
      'Choisir le Semestre, puis l’onglet « Par classe », « Par enseignant » ou « Par salle » et l’élément à afficher.',
      '« + Ajouter une séance » → Classe, Matière, Enseignant, Salle (optionnelle), Jour, Début, Fin, Notes → « Enregistrer ».',
      'Les conflits (enseignant, classe ou salle déjà occupés) sont signalés dans le dialogue.',
      'Cliquer sur une séance pour la modifier ou la « Supprimer ».'
    ]
  },
  rooms: {
    path: 'Emplois du Temps > Gestion des Salles',
    route: '/admin/timetable/rooms',
    actions: [
      '« + Ajouter une salle » → Code, Nom, Type, Capacité, Bâtiment, Étage, équipements.',
      'Par salle : « Modifier », « Occupation », « Bloquer » (raison, période) / « Débloquer », « Suppr. ».'
    ]
  },
  teacherView: {
    path: 'Emplois du Temps > EDT Enseignant',
    route: '/admin/timetable/teacher-view',
    actions: ['Choisir le Semestre (et l’Enseignant pour la direction) : grille hebdomadaire en lecture seule.']
  },
  studentView: {
    path: 'Emplois du Temps > EDT Élève',
    route: '/admin/timetable/student-view',
    actions: ['Choisir Semestre, Classe puis Élève : grille hebdomadaire de l’élève (lecture seule).']
  },
  attendanceSessions: {
    path: 'Présences & Absences > Feuille d’Appel',
    route: '/admin/attendance/sessions',
    actions: [
      '« + Nouvelle séance » → Classe, Date, Début, Fin, Méthode → « Créer » : la feuille d’appel s’ouvre.',
      'Cliquer sur la pastille de statut d’un élève pour passer Présent → Absent → En retard → Excusé (enregistré immédiatement) ; « Tout présent » / « Tout absent ».',
      '« Terminer la séance » clôture l’appel (lecture seule ensuite).',
      'Dans la liste : « Faire l’appel » (séance en cours) ou « Voir » (terminée).'
    ]
  },
  justifications: {
    path: 'Présences & Absences > Justificatifs',
    route: '/admin/attendance/justifications',
    actions: [
      'Onglets Tous / En attente / Approuvés / Rejetés ; « Voir » ouvre la pièce jointe.',
      'Administrator / Manager : « Traiter » → Décision (Approuver / Rejeter) + Notes. Une approbation passe les absences de la période en « Excusé ».'
    ]
  },
  monitoring: {
    path: 'Présences & Absences > Suivi & Alertes',
    route: '/admin/attendance/monitoring',
    actions: [
      'Filtres Semestre et Classe ; onglets Actives / Traitées / Toutes.',
      '« Recalculer les alertes » (Administrator / Manager) : détecte les élèves au-delà des seuils d’absence.',
      'Par alerte : « Historique » (détail des appels de l’élève) et « Traiter ».'
    ]
  },
  attendanceReports: {
    path: 'Présences & Absences > Rapports & Statistiques',
    route: '/admin/attendance/reports',
    actions: [
      'Filtres Semestre, Classe, Du, Au.',
      'Onglets « Taux d’assiduité » (par classe / matière), « Absentéistes » (seuil réglable), « Par jour ».',
      '« Exporter (CSV) » → Présences par élève ou par matière.'
    ]
  },
  examPlanning: {
    path: 'Examens > Planification',
    route: '/admin/exams/planning',
    actions: [
      '« + Nouvelle session » (direction) → une classe ou tout un niveau, Matière, Type (Composition, Rattrapage, Examen blanc), Semestre, Date, horaires, salles disponibles → « Vérifier les conflits » → « Créer la session ».',
      'Cycle de vie : « Publier » (brouillon → planifiée), « Démarrer » (en cours), « Terminer » ; aussi « Annuler » (motif), « Dupliquer », « Supprimer » (brouillon).',
      'Session terminée : « Créer les notes » → une évaluation de type Composition (brouillon) est créée par classe, absents pré-saisis ; la saisie se fait ensuite dans Notes.',
      '« Détails » : horaires, matériel autorisé, consignes, organisation.'
    ]
  },
  examManagement: {
    path: 'Examens > Gestion des épreuves',
    route: '/admin/exams/management',
    actions: [
      'Choisir la session d’examen.',
      'Onglet « Salles » : « Affecter la salle » / « Retirer ».',
      'Onglet « Élèves » : « Placer la sélection » ou « Tout placer » dans les salles.',
      'Onglet « Préparation » : matériel autorisé, consignes → « Enregistrer » ; récapitulatif.'
    ]
  },
  examSupervision: {
    path: 'Examens > Surveillance',
    route: '/admin/exams/supervision',
    actions: [
      'Onglet « Surveillants » : la direction affecte un professeur (Chef de salle, Surveillant, Réserve) ; « Présent » ; « Remplacer ».',
      'Onglet « Émargement » : présence de chaque élève, « Copie remise », « Vérifier » ; « Pointer tous les non pointés présents ».',
      'Onglet « Incidents » : « Signaler un incident » (type, gravité, élève) et suivi du statut.'
    ]
  },
  examReports: {
    path: 'Examens > Rapports & Statistiques',
    route: '/admin/exams/reports',
    actions: [
      'Onglet « Vue d’ensemble » : sessions, présence, incidents, charge des surveillants, occupation des salles.',
      'Onglet « Rapport d’une session » : émargement détaillé → « Exporter (CSV) ».'
    ]
  },
  invoices: {
    path: 'Comptabilité > Facturation',
    route: '/admin/finance/invoices',
    actions: [
      'Rechercher (n° facture, matricule, nom) et filtrer par Statut (En attente, Partiellement payée, Payée, En retard…).',
      '« + Nouvelle Facture » (Administrator / Comptable) → Matricule → « Vérifier », Type de frais (montant pré-rempli), Montant, Échéance, Notes → « Créer ».',
      'Par facture : « Détails », « Paiements » (historique + « Enregistrer un paiement » : montant, méthode, date, référence → le reçu s’ouvre), « PDF » (facture PDF).',
      'Dans le reçu : « Imprimer ».'
    ]
  },
  payments: {
    path: 'Comptabilité > Paiements & reçus',
    route: '/admin/finance/payments',
    actions: [
      'Onglet « Liste des paiements » : filtres (recherche, mode, dates, « Mes encaissements ») ; « Reçu » pour réimprimer.',
      '« Rembourser » (Administrator / Comptable) → montant et raison.',
      'Onglet « Résumé journalier » : total du jour et répartition par mode.',
      '« Encaisser une facture » renvoie vers Facturation (l’encaissement se fait depuis la facture).'
    ]
  },
  cashierClose: {
    path: 'Comptabilité > Clôture de caisse',
    route: '/admin/finance/cashier-close',
    actions: [
      '« Nouvelle clôture » → Date, totaux système de vos encaissements du jour, « Espèces comptées dans la caisse » → « Clôturer ».',
      'Le tableau indique l’écart (Clôturé / Écart à investiguer). Une date ne peut être clôturée qu’une fois.'
    ]
  },
  collection: {
    path: 'Comptabilité > Recouvrement & relances',
    route: '/admin/finance/collection',
    actions: [
      'Onglets « Factures en retard », « Relances », « Blocages de services ».',
      'Administrator / Comptable : « Générer les relances », « Envoyer les relances en attente », et par facture « Échéancier », « Bloquer », « Perte » ; « Débloquer » un service.',
      'Manager et Caissier : consultation seule.'
    ]
  },
  financeReports: {
    path: 'Comptabilité > Rapports financiers',
    route: '/admin/finance/reports',
    actions: [
      'Période Du / Au ; indicateurs (facturé, encaissé, créances, taux de recouvrement) et encaissements mensuels.',
      'Onglets Journal des encaissements, Balance âgée, États des impayés, Prévision de trésorerie.',
      '« Export comptable (CSV) ».'
    ]
  },
  bank: {
    path: 'Comptabilité > Rapprochement bancaire',
    route: '/admin/finance/bank-reconciliation',
    actions: [
      '« Nouveau compte » → nom, banque, IBAN, devise, solde d’ouverture → « Créer ».',
      'Transactions récentes en lecture seule (l’import et le rapprochement ne sont pas encore proposés à l’écran).'
    ]
  },
  employees: {
    path: 'Paie & RH > Employés',
    route: '/admin/payroll/employees',
    actions: [
      '« + Nouvel employé » → identité, email, embauche, service, poste, CNSS, banque.',
      '« Détails » → « + Nouveau contrat » (type, dates, salaire de base) créé en brouillon → « Activer » ; « Résilier » un contrat actif.'
    ]
  },
  payrollComponents: {
    path: 'Paie & RH > Éléments de Paie',
    route: '/admin/payroll/components',
    actions: [
      'Onglet « Primes, indemnités & retenues » : « + Nouvel élément » (employé, type, mode de calcul, valeur).',
      'Onglet « Avances sur salaire » : « + Demande d’avance » → « Approuver » → « Décaisser ».',
      'Onglet « Grilles salariales » : « + Nouvelle grille » avec échelons.'
    ]
  },
  payrollProcessing: {
    path: 'Paie & RH > Traitement Paie',
    route: '/admin/payroll/processing',
    actions: [
      '« + Nouvelle période » → Mois, Année, Date de paiement.',
      '« Calculer la paie » (employés actifs avec contrat actif) → « Valider la paie » → « Générer les bulletins » → « Ordres de virement » → « Marquer comme payée ».',
      'Indicateurs : masse brute, retenues, net à payer, charges patronales ; tableau des fiches par employé.',
      'Les bulletins de paie ne sont pas encore téléchargeables en PDF depuis l’écran.'
    ]
  },
  declarations: {
    path: 'Paie & RH > Déclarations Sociales',
    route: '/admin/payroll/declarations',
    actions: [
      '« + Générer une déclaration » → période de paie validée, type (CNSS, Impôt sur le revenu, AMO).',
      'Par déclaration : « Valider » → « Soumettre » (référence de dépôt) → « Payer ». « Récapitulatif annuel ».'
    ]
  },
  payrollReports: {
    path: 'Paie & RH > Rapports RH',
    route: '/admin/payroll/reports',
    actions: ['Filtre Année : statistiques salariales ; choisir une période calculée pour le journal de paie et les charges sociales.']
  },
  certificates: {
    path: 'Documents Officiels > Attestations',
    route: '/admin/documents/certificates',
    actions: [
      '« Générer une attestation » → Type (Certificat de scolarité, d’inscription, Attestation de statut, d’assiduité, de réussite, Certificat de transfert), Élève, Année → « Générer ».',
      'Onglet « Documents émis » : rechercher, « PDF », « Annuler » (motif).',
      'Onglet « Demandes » : « Approuver » / « Rejeter ».'
    ]
  },
  transcripts: {
    path: 'Documents Officiels > Relevés de Notes',
    route: '/admin/documents/transcripts',
    actions: [
      'Registre des relevés émis (PDF, Annuler). La génération n’est pas branchée : utilisez les bulletins PDF de Notes > Résultats & bulletins.'
    ]
  },
  verification: {
    path: 'Documents Officiels > Vérification',
    route: '/admin/documents/verification',
    actions: [
      'Vérifier un document « Par » numéro (ex. CSC-2026-2027-00001) ou code de vérification (QR, saisi à la main) → « Vérifier » : « Document authentique » ou « non trouvé ».',
      'Registre de tous les documents émis en dessous.'
    ]
  },
  settings: {
    path: 'Réglages',
    route: '/admin/settings/tenant',
    actions: ['« Nouveau réglage » → Clé (ex. school.name), Type, Valeur, Catégorie, Description ; « Modifier » / « Supprimer ».']
  },
  messages: (route: string): MenuFeature => ({
    path: 'Messages',
    route,
    actions: [
      '« Nouveau message » → rechercher le Destinataire (professeur, parent ou administration selon votre rôle), Sujet (3 caractères min.), Message → « Envoyer ».',
      'Cliquer un message pour le lire (il passe en « Lu ») ; « Répondre » pré-remplit destinataire et sujet.'
    ]
  })
} satisfies Record<string, MenuFeature | ((route: string) => MenuFeature)>

const dashboardFeature: MenuFeature = {
  path: 'Tableau de bord',
  route: '/admin/dashboard',
  actions: [
    'Page d’accueil après connexion : année scolaire active, nombre d’élèves et de classes, encaissé, reste à recouvrer, taux de recouvrement.'
  ]
}

const pedagogyFeatures: MenuFeature[] = [
  F.academicYears,
  F.cycles,
  F.series,
  F.classes,
  F.subjects,
  F.coefficients,
  F.students,
  F.enrollmentStats,
  F.cards,
  F.campaigns,
  F.promotions,
  F.assignments,
  F.evaluations,
  F.results,
  F.timetableSchedule,
  F.rooms,
  F.teacherView,
  F.studentView,
  F.attendanceSessions,
  F.justifications,
  F.monitoring,
  F.attendanceReports,
  F.examPlanning,
  F.examManagement,
  F.examSupervision,
  F.examReports
]

const payrollFeatures: MenuFeature[] = [
  F.employees,
  F.payrollComponents,
  F.payrollProcessing,
  F.declarations,
  F.payrollReports
]

const documentFeatures: MenuFeature[] = [F.transcripts, F.certificates, F.verification]

export const ROLE_GUIDES: RoleGuide[] = [
  {
    roleId: 'superadmin',
    intro: 'Connexion sur la page super-admin (pas la page école). Menu : Dashboard, Sites.',
    features: [
      {
        path: 'Dashboard',
        route: '/superadmin/dashboard',
        actions: ['Page d’accueil super-admin. Les chiffres affichés sont des valeurs d’exemple (non reliées aux données).']
      },
      {
        path: 'Sites',
        route: '/superadmin/sites',
        actions: [
          'Indicateurs : total, actifs, inactifs, taux d’activation ; recherche par ID, société, email.',
          '« Nouveau Site » → Identifiant du tenant (lettres, chiffres, tirets), Nom de la société, email, téléphone, adresse, Statut, Domaines (le premier est le domaine principal ; « Ajouter un domaine ») → « Créer ».',
          'Icône « Activer le site (exécuter les migrations) » sur un site pas encore à jour → confirmer : la base de l’école est créée/mise à jour.',
          'Par site : « Voir les détails », « Modifier », « Supprimer ».',
          'Ensuite, les comptes de l’école se créent depuis l’école elle-même (Utilisateurs) avec un compte Administrator.'
        ]
      }
    ]
  },
  {
    roleId: 'admin',
    intro: 'L’administrateur voit tous les menus de l’école.',
    features: [
      dashboardFeature,
      F.users,
      ...pedagogyFeatures,
      F.invoices,
      F.payments,
      F.cashierClose,
      F.collection,
      F.financeReports,
      F.bank,
      ...payrollFeatures,
      ...documentFeatures,
      F.settings
    ]
  },
  {
    roleId: 'manager',
    intro: 'Mêmes menus que l’administrateur, sans Réglages, Clôture de caisse ni Rapprochement bancaire.',
    features: [
      dashboardFeature,
      F.users,
      ...pedagogyFeatures,
      F.invoices,
      F.payments,
      F.collection,
      F.financeReports,
      ...payrollFeatures,
      ...documentFeatures
    ]
  },
  {
    roleId: 'professeur',
    intro: 'Menu : Accueil, Notes, Emplois du Temps, Présences & Absences, Examens, Messages.',
    features: [
      {
        path: 'Accueil',
        route: '/admin/teacher/home',
        actions: [
          'Raccourcis : Saisie des notes, Résultats & bulletins, Feuille d’appel, Mon emploi du temps, Messages.',
          '« Mes classes » : classes dont vous êtes professeur principal ; cliquer une classe affiche la liste de ses élèves.'
        ]
      },
      {
        path: 'Notes > Saisie des notes',
        route: '/admin/teacher/grades',
        actions: [
          'Cliquer une carte d’affectation (classe + matière). Sans carte : la direction doit vous affecter (Notes > Affectations).',
          'Choisir le Semestre → « Nouvelle évaluation » → Titre, Type (Devoir, Interrogation, Composition), Date, « Noté sur », Coefficient → « Enregistrer » : la grille de saisie s’ouvre.',
          'Saisir les notes (Entrée / ↓ pour passer à l’élève suivant), cocher « Absent », ajouter un commentaire → « Enregistrer » (brouillon).',
          '« Soumettre » : l’évaluation part à la direction pour publication ; « Rouvrir » la repasse en brouillon tant qu’elle n’est pas publiée.',
          'Une évaluation publiée est verrouillée pour le professeur. « Appréciations » : appréciation par élève pour votre matière.'
        ]
      },
      {
        ...F.results,
        actions: [
          'Choisir Classe (classes où vous êtes affecté ou professeur principal) et Semestre.',
          'Professeur principal : toutes les matières, « Bulletins PDF », « PDF » par élève et appréciation générale.',
          'Sinon : seulement vos matières (« Vous ne voyez que vos matières. »), appréciations de vos matières, pas de PDF.'
        ]
      },
      {
        ...F.teacherView,
        path: 'Emplois du Temps > EDT Enseignant',
        actions: ['Titre « Mon emploi du temps » : choisir le Semestre pour afficher vos séances de la semaine.']
      },
      {
        ...F.attendanceSessions,
        description: 'Seules vos classes (professeur principal ou séance à l’emploi du temps) sont proposées.'
      },
      { ...F.justifications, actions: ['Consultation des justificatifs (le traitement est réservé à la direction).'] },
      F.monitoring,
      F.attendanceReports,
      {
        ...F.examPlanning,
        actions: ['Consultation des sessions d’examen et de leurs « Détails » (création et changements de statut réservés à la direction).']
      },
      {
        ...F.examSupervision,
        actions: [
          'Marquer « Présent » sur votre propre affectation de surveillance.',
          'Émargement des élèves (présence, copie remise, vérification) et « Signaler un incident ».'
        ]
      },
      F.examReports,
      F.messages('/admin/teacher/messages')
    ]
  },
  {
    roleId: 'eleve',
    intro: 'Menu : Accueil, Mes notes, Mon emploi du temps, Mes présences, Absences & justificatifs, Mes factures, Mes documents, Ma carte scolaire, Réinscription.',
    features: [
      {
        path: 'Accueil',
        route: '/admin/student/home',
        actions: ['Matricule, classe, moyenne actuelle (notes publiées), prochain cours, absences des 30 derniers jours, factures et reste à payer.']
      },
      {
        path: 'Mes notes',
        route: '/admin/student/my-grades',
        actions: [
          'Choisir le Semestre : moyenne générale, rang, mention, distinction, moyenne annuelle.',
          'Déplier une matière pour voir le détail des évaluations.',
          '« Télécharger le bulletin (PDF) ».',
          'Seules les notes publiées par la direction apparaissent.'
        ]
      },
      { path: 'Mon emploi du temps', route: '/admin/student/my-timetable', actions: ['Grille hebdomadaire (matière, enseignant, salle).'] },
      { path: 'Mes présences', route: '/admin/student/my-attendance', actions: ['Compteurs absences / retards / excusées et liste détaillée.'] },
      {
        path: 'Absences & justificatifs',
        route: '/admin/attendance/my-justifications',
        actions: [
          '« Soumettre un justificatif » → Du, Au, Type, Motif, « Joindre un document » (PDF/JPG/PNG, 5 Mo) → « Envoyer ».',
          'Suivre le statut dans « Justificatifs envoyés ».'
        ]
      },
      { path: 'Mes factures', route: '/admin/student/my-invoices', actions: ['Factures, lignes, montants payés, reste à payer et reçus (lecture seule).'] },
      { path: 'Mes documents', route: '/admin/student/my-documents', actions: ['« Télécharger » les attestations et certificats émis par l’établissement.'] },
      { path: 'Ma carte scolaire', route: '/admin/student/my-card', actions: ['Statut, numéro et validité de la carte.'] },
      {
        path: 'Réinscription',
        route: '/admin/student/reenrollment',
        actions: ['Si une campagne est ouverte : commentaire facultatif puis « Oui, je me réinscris » ou « Non, je quitte l’établissement ».']
      }
    ]
  },
  {
    roleId: 'parent',
    intro: 'Menu : Accueil, Mes enfants, Messages, Annonces, Absences & justificatifs.',
    features: [
      {
        path: 'Accueil',
        route: '/admin/parent/home',
        actions: ['Profil parent et liste rapide des enfants (cliquer un enfant ouvre sa fiche).']
      },
      {
        path: 'Mes enfants',
        route: '/admin/parent/children',
        actions: [
          'Cliquer la carte d’un enfant → fiche complète : informations, Présences / Absences, Notes (semestre, « Télécharger le bulletin (PDF) »), Emploi du temps, Factures, Documents.',
          'Seules les notes publiées apparaissent.'
        ]
      },
      F.messages('/admin/parent/messages'),
      { path: 'Annonces', route: '/admin/parent/announcements', actions: ['Fonction non disponible : la page affiche « Aucune annonce publiée. »'] },
      {
        path: 'Absences & justificatifs',
        route: '/admin/attendance/my-justifications',
        actions: [
          'Choisir l’enfant (si plusieurs) → « Soumettre un justificatif » (période, type, motif, pièce jointe) → « Envoyer ».',
          'Consulter les absences enregistrées et le statut des justificatifs envoyés.'
        ]
      }
    ]
  },
  {
    roleId: 'caissier',
    intro: 'Menu : Comptabilité (Facturation, Paiements & reçus, Clôture de caisse, Recouvrement & relances).',
    features: [
      {
        ...F.invoices,
        actions: [
          'Rechercher la facture (matricule, nom, n°).',
          '« Paiements » → « Enregistrer un paiement » : montant (plafonné au restant dû), méthode (Espèces, Mobile Money, Virement, Chèque, Carte, En ligne), date, référence → le reçu s’ouvre → « Imprimer ».',
          '« Détails » et « PDF » de la facture. La création de facture est réservée à l’Administrator et au Comptable.'
        ]
      },
      {
        ...F.payments,
        actions: [
          'Liste des paiements (case « Mes encaissements ») et « Reçu » pour réimprimer.',
          'Onglet « Résumé journalier ».',
          'Bouton « Clôture de caisse ».'
        ]
      },
      F.cashierClose,
      { ...F.collection, actions: ['Consultation seule des factures en retard, relances et blocages.'] }
    ]
  },
  {
    roleId: 'comptable',
    intro: 'Menu : Comptabilité (tous les sous-menus) et Paie & RH.',
    features: [F.invoices, F.payments, F.cashierClose, F.collection, F.financeReports, F.bank, ...payrollFeatures]
  }
]

export const JOURNEYS: Journey[] = [
  {
    id: 'rentree',
    title: 'a) Rentrée scolaire',
    summary: 'Préparer l’année : calendrier, structure, classes, élèves, affectations, emplois du temps, facturation.',
    steps: [
      { actor: 'Administrator', path: 'Structure Académique > Années Scolaires', action: '« Nouvelle année » puis « Activer cette année ».' },
      { actor: 'Administrator', path: 'Années Scolaires > Gérer les semestres', action: 'Créer S1 et S2 (dates, périodes de cours et d’examens).' },
      { actor: 'Administrator', path: 'Structure Académique > Cycles et Niveaux / Séries', action: 'Vérifier les cycles, niveaux et séries actifs (pré-configurés).' },
      { actor: 'Administrator', path: 'Structure Académique > Matières', action: 'Créer ou activer les matières enseignées.' },
      { actor: 'Administrator', path: 'Structure Académique > Coefficients', action: 'Pour chaque niveau / série : coefficient et heures par semaine de chaque matière.' },
      { actor: 'Administrator', path: 'Structure Académique > Classes', action: '« Nouvelle classe » : niveau, série, section, capacité, professeur principal.' },
      { actor: 'Administrator', path: 'Utilisateurs', action: 'Créer les comptes du personnel (Professeur, Caissier, Comptable, Manager) et, si besoin, les comptes Élève / Parent (Application « Frontend »).' },
      { actor: 'Administrator / Manager', path: 'Inscriptions > Élèves', action: '« Ajouter » ou « Importer » les élèves (matricule automatique).' },
      { actor: 'Administrator / Manager', path: 'Inscriptions > Passages de classe', action: 'Élèves déjà scolarisés : affectation dans la classe de la nouvelle année (voir parcours g). Pour les nouveaux élèves, l’affectation en classe et le lien élève ↔ parent ↔ compte ne sont pas proposés à l’écran : ils sont réalisés par l’équipe technique (import / jeu de données).' },
      { actor: 'Administrator / Manager', path: 'Notes > Affectations', action: 'Pour chaque classe, affecter un professeur à chaque matière → « Enregistrer ».' },
      { actor: 'Administrator / Manager', path: 'Emplois du Temps > Gestion des Salles', action: 'Créer les salles (capacité, équipements).' },
      { actor: 'Administrator / Manager', path: 'Emplois du Temps > Planification', action: 'Par classe : « + Ajouter une séance » (matière, enseignant, salle, jour, heures) ; corriger les conflits signalés.' },
      { actor: 'Administrator / Comptable', path: 'Comptabilité > Facturation', action: '« + Nouvelle Facture » par élève avec le type de frais (inscription, scolarité, carte…). Les types de frais sont paramétrés par l’équipe technique (pas d’écran dédié).' },
      { actor: 'Administrator / Manager', path: 'Inscriptions > Cartes Scolaires', action: '« Générer des cartes » (lot d’élèves) puis « Télécharger PDF ».' }
    ]
  },
  {
    id: 'trimestre',
    title: 'b) Vie du semestre : présences, notes, examens',
    summary: 'Appel, justificatifs, évaluations, publication, bulletins, compositions.',
    steps: [
      { actor: 'Professeur', path: 'Présences & Absences > Feuille d’Appel', action: '« + Nouvelle séance » → marquer présents / absents / retards → « Terminer la séance ».' },
      { actor: 'Élève ou Parent', path: 'Absences & justificatifs', action: '« Soumettre un justificatif » avec pièce jointe.' },
      { actor: 'Administrator / Manager', path: 'Présences & Absences > Justificatifs', action: 'Onglet « En attente » → « Traiter » → Approuver (absences passées en « Excusé ») ou Rejeter.' },
      { actor: 'Administrator / Manager', path: 'Présences & Absences > Suivi & Alertes', action: '« Recalculer les alertes » puis traiter les élèves signalés.' },
      { actor: 'Professeur', path: 'Notes > Saisie des notes', action: 'Choisir l’affectation → « Nouvelle évaluation » → saisir les notes → « Enregistrer » → « Soumettre ».' },
      { actor: 'Administrator / Manager', path: 'Notes > Évaluations', action: 'Filtre « Soumise » → contrôler (« Notes ») → « Publier » ou « Publier toutes les soumises ».' },
      { actor: 'Élève / Parent', path: 'Mes notes / Mes enfants', action: 'Les notes publiées apparaissent immédiatement.' },
      { actor: 'Administrator / Manager', path: 'Examens > Planification', action: '« + Nouvelle session » (composition par classe ou niveau) → « Publier ».' },
      { actor: 'Administrator / Manager', path: 'Examens > Gestion des épreuves', action: 'Affecter les salles, placer les élèves, consignes.' },
      { actor: 'Direction + Professeurs', path: 'Examens > Surveillance', action: 'Affecter les surveillants, émargement, incidents.' },
      { actor: 'Administrator / Manager', path: 'Examens > Planification', action: '« Démarrer » puis « Terminer » la session → « Créer les notes » (évaluation Composition en brouillon par classe).' },
      { actor: 'Professeur → Direction', path: 'Notes > Saisie des notes → Notes > Évaluations', action: 'Saisie des notes de composition, soumission puis publication.' },
      { actor: 'Administrator / Manager / Prof. principal', path: 'Notes > Résultats & bulletins', action: 'Classe + semestre → « Appréciations » → « Bulletins PDF ».' },
      { actor: 'Administrator', path: 'Structure Académique > Années Scolaires > Gérer les semestres', action: 'En fin de semestre : « Clôturer » (bloque toute nouvelle saisie).' }
    ]
  },
  {
    id: 'finances',
    title: 'c) Finances',
    summary: 'Facturation, encaissement, reçu, clôture de caisse, recouvrement, rapports, rapprochement.',
    steps: [
      { actor: 'Comptable / Administrator', path: 'Comptabilité > Facturation', action: '« + Nouvelle Facture » (matricule, type de frais, échéance). Également : Inscriptions > Élèves > « Situation financière » > « Nouvelle facture ».' },
      { actor: 'Caissier', path: 'Comptabilité > Facturation', action: 'Rechercher la facture → « Paiements » → « Enregistrer un paiement ».' },
      { actor: 'Caissier', path: 'Fenêtre « Reçu de paiement »', action: '« Imprimer » le reçu (montant en lettres, reste à payer). Réimpression : Paiements & reçus > « Reçu ».' },
      { actor: 'Caissier', path: 'Comptabilité > Clôture de caisse', action: 'En fin de journée : « Nouvelle clôture » → espèces comptées → « Clôturer » (écart calculé).' },
      { actor: 'Comptable / Administrator', path: 'Comptabilité > Paiements & reçus', action: 'Si nécessaire : « Rembourser » un paiement (montant, raison).' },
      { actor: 'Comptable / Administrator', path: 'Comptabilité > Recouvrement & relances', action: '« Générer les relances » → « Envoyer les relances en attente » ; par facture en retard : « Échéancier », « Bloquer » un service, « Perte ».' },
      { actor: 'Comptable / Administrator / Manager', path: 'Comptabilité > Rapports financiers', action: 'Journal des encaissements, balance âgée, impayés, prévision ; « Export comptable (CSV) ».' },
      { actor: 'Comptable / Administrator', path: 'Comptabilité > Rapprochement bancaire', action: '« Nouveau compte » bancaire ; consulter les transactions importées.' }
    ]
  },
  {
    id: 'paie',
    title: 'd) Paie mensuelle',
    summary: 'Employés et contrats, éléments variables, calcul, validation, bulletins, virements, déclarations.',
    steps: [
      { actor: 'Comptable / Administrator', path: 'Paie & RH > Employés', action: '« + Nouvel employé » → « Détails » → « + Nouveau contrat » → « Activer ».' },
      { actor: 'Comptable / Administrator', path: 'Paie & RH > Éléments de Paie', action: 'Primes, indemnités, retenues ; avances (« Approuver » → « Décaisser ») ; grilles salariales.' },
      { actor: 'Comptable / Administrator', path: 'Paie & RH > Traitement Paie', action: '« + Nouvelle période » (mois, année) → « Calculer la paie » → « Valider la paie ».' },
      { actor: 'Comptable / Administrator', path: 'Paie & RH > Traitement Paie', action: '« Générer les bulletins » → « Ordres de virement » → « Marquer comme payée ».' },
      { actor: 'Comptable / Administrator', path: 'Paie & RH > Déclarations Sociales', action: '« + Générer une déclaration » (CNSS, IR, AMO) → « Valider » → « Soumettre » → « Payer ».' },
      { actor: 'Comptable / Administrator / Manager', path: 'Paie & RH > Rapports RH', action: 'Journal de paie et charges sociales de la période.' }
    ]
  },
  {
    id: 'documents',
    title: 'e) Documents et attestations',
    summary: 'Émettre, télécharger, vérifier et annuler un document officiel.',
    steps: [
      { actor: 'Administrator / Manager', path: 'Documents Officiels > Attestations', action: '« Générer une attestation » → type, élève, année → « Générer » → « PDF ».' },
      { actor: 'Administrator / Manager', path: 'Documents Officiels > Attestations > Demandes', action: '« Approuver » ou « Rejeter » les demandes reçues.' },
      { actor: 'Élève / Parent', path: 'Mes documents / Mes enfants > Documents', action: '« Télécharger » le document émis.' },
      { actor: 'Administrator / Manager', path: 'Documents Officiels > Vérification', action: 'Saisir le numéro ou le code de vérification → « Vérifier ».' },
      { actor: 'Administrator / Manager', path: 'Documents Officiels > Attestations > Documents émis', action: '« Annuler » un document erroné (motif obligatoire).' },
      { actor: 'Administrator / Manager / Prof. principal', path: 'Notes > Résultats & bulletins', action: 'Bulletins de notes PDF (les relevés de « Documents Officiels » ne sont pas encore générés).' }
    ]
  },
  {
    id: 'messagerie',
    title: 'f) Messagerie',
    summary: 'Échanges professeurs ↔ parents ↔ administration.',
    steps: [
      { actor: 'Parent', path: 'Messages', action: '« Nouveau message » → choisir un professeur ou l’administration → Sujet, Message → « Envoyer ».' },
      { actor: 'Professeur', path: 'Messages', action: 'Le message apparaît « Non lu » → l’ouvrir → « Répondre ».' },
      { actor: 'Administrator', path: 'Adresse /fr/admin/teacher/messages', action: 'Pas d’entrée de menu pour l’administrateur ; la boîte est accessible par son adresse (à confirmer).' }
    ]
  },
  {
    id: 'fin-annee',
    title: 'g) Fin d’année : moyenne annuelle et passages',
    summary: 'Réinscriptions, moyenne annuelle, décisions de passage, nouvelle année.',
    steps: [
      { actor: 'Administrator', path: 'Structure Académique > Années Scolaires', action: 'Créer l’année suivante et ses semestres (sans l’activer tout de suite).' },
      { actor: 'Administrator / Manager', path: 'Inscriptions > Campagnes Réinscription', action: '« Nouvelle Campagne » (année source → année cible) → « Activer ».' },
      { actor: 'Élève', path: 'Réinscription', action: 'Répondre « Oui, je me réinscris » / « Non ».' },
      { actor: 'Administrator / Manager', path: 'Notes > Évaluations', action: 'Vérifier que toutes les évaluations des deux semestres sont publiées (la moyenne annuelle ne compte que les notes publiées).' },
      { actor: 'Administrator / Manager', path: 'Inscriptions > Passages de classe', action: 'Pour chaque classe : contrôler moyenne annuelle, rang et souhait → décider Passage / Redoublement / Départ → « Valider la sélection ».' },
      { actor: 'Administrator / Manager', path: 'Inscriptions > Campagnes Réinscription', action: '« Clôturer » la campagne.' },
      { actor: 'Administrator', path: 'Structure Académique > Années Scolaires', action: '« Activer cette année » sur la nouvelle année ; créer ses classes, affectations et emplois du temps (parcours a).' }
    ]
  },
  {
    id: 'superadmin',
    title: 'h) Super-admin : gestion des écoles',
    summary: 'Créer et activer un nouvel établissement.',
    steps: [
      { actor: 'Super-admin', path: 'Page /fr/loginsuperadmin', action: 'Se connecter avec demo.superadmin.' },
      { actor: 'Super-admin', path: 'Sites', action: '« Nouveau Site » → identifiant, société, contacts, domaine principal → « Créer ».' },
      { actor: 'Super-admin', path: 'Sites', action: '« Activer le site (exécuter les migrations) » → confirmer.' },
      { actor: 'Super-admin', path: 'Sites', action: '« Voir les détails » / « Modifier » (statut actif/inactif, domaines) / « Supprimer ».' },
      { actor: 'Direction de l’école', path: 'Domaine de l’école > /fr/login', action: 'Connexion avec un compte Administrator de l’école puis parcours a).' }
    ]
  }
]

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'demo-saisie',
    title: 'Créer une évaluation et saisir des notes',
    account: 'prof.maths',
    steps: [
      'Se connecter sur /fr/login → l’accueil « Mes classes » s’affiche.',
      'Notes > Saisie des notes → cliquer une carte (ex. une classe de Mathématiques).',
      'Semestre S1 → « Nouvelle évaluation » → Titre « Interrogation démo », Type Interrogation → « Enregistrer ».',
      'Saisir quelques notes (Entrée pour descendre), cocher « Absent » pour un élève → « Enregistrer ».',
      '« Soumettre » (confirmer si des élèves n’ont pas de note).'
    ],
    expected: 'L’évaluation passe au statut « Soumise » ; message « Évaluation soumise à la direction pour publication. »'
  },
  {
    id: 'demo-publication',
    title: 'Publier les notes soumises',
    account: 'demo.admin',
    steps: [
      'Notes > Évaluations : le filtre Statut est sur « Soumise ».',
      'Ouvrir une évaluation avec « Notes » pour contrôler, revenir.',
      'Cocher une ou plusieurs évaluations → « Publier la sélection », ou « Publier toutes les soumises ».'
    ],
    expected: 'Les évaluations passent en « Publiée » et deviennent visibles des élèves et parents.'
  },
  {
    id: 'demo-eleve',
    title: 'Côté élève : notes publiées et bulletin',
    account: 'eleve.001',
    steps: [
      'Accueil : moyenne actuelle, absences, reste à payer.',
      'Mes notes → Semestre S1 → déplier une matière.',
      '« Télécharger le bulletin (PDF) ».'
    ],
    expected: 'Seules les notes publiées apparaissent ; le bulletin PDF reprend moyenne, rang et appréciations. Si « Aucune note publiée », publiez d’abord une évaluation (démo 2).'
  },
  {
    id: 'demo-bulletins',
    title: 'Résultats de classe et bulletins PDF',
    account: 'demo.admin',
    steps: [
      'Notes > Résultats & bulletins → Classe « 6ème A », Semestre S1.',
      'Observer moyennes, rangs, mentions ; cocher « Inclure les notes non publiées » pour comparer.',
      '« Appréciations » sur un élève → appréciation générale → « Enregistrer ».',
      '« Bulletins PDF » (toute la classe) ou « PDF » d’un élève.'
    ],
    expected: 'Téléchargement des bulletins PDF de la classe.'
  },
  {
    id: 'demo-justificatif',
    title: 'Justificatif d’absence : du parent à la validation',
    account: 'parent.001 puis demo.admin',
    steps: [
      'parent.001 : Absences & justificatifs → « Soumettre un justificatif » (période, type Médical, motif, document) → « Envoyer ».',
      'Se déconnecter, se connecter avec demo.admin.',
      'Présences & Absences > Justificatifs → onglet « En attente » → « Traiter » → Approuver → valider.'
    ],
    expected: 'Le justificatif passe « Approuvé » ; les absences de la période deviennent « Excusé » et le parent voit le nouveau statut.'
  },
  {
    id: 'demo-appel',
    title: 'Faire l’appel',
    account: 'prof.maths',
    steps: [
      'Présences & Absences > Feuille d’Appel → « + Nouvelle séance » → classe 6ème A → « Créer ».',
      'Cliquer sur la pastille de deux élèves pour les passer « Absent » / « En retard ».',
      '« Terminer la séance ».'
    ],
    expected: 'La séance apparaît « Terminée » avec le taux de présence ; eleve.001 / parent.001 voient l’absence si eleve.001 a été marqué absent.'
  },
  {
    id: 'demo-examen',
    title: 'D’une composition terminée aux notes',
    account: 'demo.admin',
    steps: [
      'Examens > Planification → filtre Statut « Terminée » (ou créer une session puis « Publier », « Démarrer », « Terminer »).',
      'Sur une session terminée sans pastille « Notes créées » : « Créer les notes » → « Créer les évaluations ».',
      'Notes > Évaluations → filtre Statut « Brouillon » : la composition est là ; le professeur affecté peut la saisir.'
    ],
    expected: 'Une évaluation de type Composition (brouillon) est créée par classe, absents pré-saisis.'
  },
  {
    id: 'demo-encaissement',
    title: 'Encaisser une facture impayée et imprimer le reçu',
    account: 'demo.caissier',
    steps: [
      'Arrivée sur Paiements & reçus → « Encaisser une facture ».',
      'Facturation → filtre Statut « En attente » ou « En retard » → « Paiements » sur une facture.',
      '« Enregistrer un paiement » : montant partiel, Espèces → « Enregistrer le paiement ».',
      'Le reçu s’ouvre → « Imprimer ».',
      'Comptabilité > Clôture de caisse → « Nouvelle clôture » → saisir les espèces comptées → « Clôturer ».'
    ],
    expected: 'La facture passe « Partiellement payée », le reçu affiche le reste à payer ; la clôture indique l’écart éventuel.'
  },
  {
    id: 'demo-recouvrement',
    title: 'Recouvrement et rapports',
    account: 'demo.comptable',
    steps: [
      'Arrivée sur les Rapports financiers : indicateurs, onglets Balance âgée et États des impayés ; « Export comptable (CSV) ».',
      'Comptabilité > Recouvrement & relances → onglet « Factures en retard » → « Échéancier » (3 échéances) → « Valider ».',
      '« Générer les relances » puis onglet « Relances ».'
    ],
    expected: 'Les relances générées apparaissent avec leur niveau et leur statut.'
  },
  {
    id: 'demo-superadmin',
    title: 'Super-admin : parcourir les écoles',
    account: 'demo.superadmin',
    steps: [
      'Se connecter sur /fr/loginsuperadmin.',
      'Menu Sites : indicateurs et liste des écoles (dont lycee1).',
      '« Voir les détails » sur une école ; « Nouveau Site » pour montrer le formulaire (Annuler pour ne rien créer).'
    ],
    expected: 'Liste et détail des sites ; aucune modification si vous annulez.'
  }
]

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'J’ai oublié mon mot de passe.',
    a: 'Le lien « Forgot password? » de la page de connexion n’envoie pas encore d’e-mail. Demandez à un Administrator ou Manager : menu Utilisateurs → Modifier → cocher « Change Password » → saisir un nouveau mot de passe (8 caractères min.) → « Update User ».'
  },
  {
    q: 'Je me connecte mais « Identifiants invalides » s’affiche.',
    a: 'Vérifiez l’identifiant (nom d’utilisateur, pas l’e-mail, ex. eleve.001 avec trois chiffres) et la page : le super-admin se connecte sur /fr/loginsuperadmin, tous les autres sur /fr/login. Le compte doit être « Actif ».'
  },
  {
    q: 'Une page affiche « Accès refusé ».',
    a: 'Votre rôle n’a pas accès à cette page (adresse saisie à la main ou favori d’un autre compte). Utilisez les entrées du menu latéral : elles ne montrent que ce que votre rôle peut faire. Si vous avez changé de compte, déconnectez-vous puis reconnectez-vous.'
  },
  {
    q: 'L’élève ou le parent ne voit pas les notes.',
    a: 'Les notes ne sont visibles qu’après publication : le professeur « Soumet », puis la direction « Publie » dans Notes > Évaluations. Vérifiez aussi le semestre sélectionné.'
  },
  {
    q: 'Le professeur ne voit aucune classe dans « Saisie des notes ».',
    a: 'Il doit être affecté à la classe et à la matière pour l’année active : Notes > Affectations (Administrator / Manager). Les matières d’une classe proviennent des coefficients du niveau / de la série.'
  },
  {
    q: '« Nouvelle évaluation » est grisé.',
    a: 'Le semestre choisi est clôturé. Choisissez un semestre ouvert ; la clôture est irréversible.'
  },
  {
    q: 'Le bulletin PDF est vide ou le bouton est grisé.',
    a: 'Le bulletin ne prend que les évaluations publiées du semestre. Côté professeur, les PDF ne sont disponibles que pour le professeur principal de la classe.'
  },
  {
    q: 'Un PDF ne se télécharge pas.',
    a: 'Autorisez les téléchargements / fenêtres pour le site, puis réessayez. Si l’erreur persiste, vérifiez que vous êtes toujours connecté (session expirée → reconnectez-vous).'
  },
  {
    q: 'Comment rattacher un élève à une classe ou à un parent ?',
    a: 'Pour un élève déjà inscrit, le passage d’une année à l’autre se fait dans Inscriptions > Passages de classe. L’affectation d’un nouvel élève dans une classe et le lien élève ↔ parent ne sont pas encore proposés à l’écran : ils sont réalisés par l’équipe technique (import ou jeu de données).'
  },
  {
    q: 'Le caissier ne peut pas créer de facture.',
    a: 'C’est voulu : la création de facture est réservée à l’Administrator et au Comptable. Le caissier encaisse les factures existantes.'
  },
  {
    q: '« Nouvelle classe » ou « Nouvelle Facture » est désactivé.',
    a: 'Aucune année scolaire n’est active : Structure Académique > Années Scolaires → « Activer cette année ».'
  },
  {
    q: 'Les parents peuvent-ils payer en ligne ?',
    a: 'Pas encore : aucun bouton de paiement en ligne n’est proposé. Les paiements sont enregistrés au guichet par le caissier.'
  },
  {
    q: 'L’interface passe en anglais ou certains libellés sont en anglais.',
    a: 'Certaines fenêtres (gestion des utilisateurs, campagnes) ont encore des libellés anglais. Si l’adresse commence par /en/, remplacez-la par /fr/. Ce guide est disponible en /fr/guide.'
  }
]
