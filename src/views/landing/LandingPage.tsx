'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import Image from 'next/image'

// MUI Imports
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

// Type Imports
import type { Locale } from '@configs/i18n'

type Props = {
  lang: Locale
}

const JANDOO_BLUE = '#2596BE'
const JANDOO_RED = '#E52528'

// ── Modules data ──
const modules = [
  {
    icon: 'ri-building-2-line',
    title: 'Structure Académique',
    description: 'Gestion des programmes, niveaux (L1-M2), semestres, UE avec crédits ECTS et modules.',
    tiers: ['basic', 'medium', 'premium']
  },
  {
    icon: 'ri-user-add-line',
    title: 'Inscriptions',
    description: 'Inscription administrative et pédagogique, affectation aux groupes, import CSV/Excel.',
    tiers: ['basic', 'medium', 'premium']
  },
  {
    icon: 'ri-calendar-schedule-line',
    title: 'Emplois du Temps',
    description: 'Planification des séances, détection de conflits, vues multiples et export PDF/iCal.',
    tiers: ['basic', 'medium', 'premium']
  },
  {
    icon: 'ri-user-unfollow-line',
    title: 'Présences & Absences',
    description: 'Feuilles de présence, justification des absences, alertes de seuils et rapports.',
    tiers: ['basic', 'medium', 'premium']
  },
  {
    icon: 'ri-file-list-3-line',
    title: 'Notes & Évaluations',
    description: 'Saisie des notes, calcul automatique des moyennes, délibérations et règles LMD.',
    tiers: ['basic', 'medium', 'premium']
  },
  {
    icon: 'ri-file-paper-2-line',
    title: 'Documents Officiels',
    description: 'Relevés de notes, certificats, attestations et diplômes avec QR code de vérification.',
    tiers: ['basic', 'medium', 'premium']
  },
  {
    icon: 'ri-money-euro-circle-line',
    title: 'Comptabilité Étudiants',
    description: 'Facturation, paiements, reçus PDF, suivi des impayés et échéanciers.',
    tiers: ['basic', 'medium', 'premium']
  },
  {
    icon: 'ri-wallet-3-line',
    title: 'Paie Personnel',
    description: 'Dossiers employés, calcul automatique brut/net, bulletins de paie et déclarations sociales.',
    tiers: ['medium', 'premium']
  },
  {
    icon: 'ri-global-line',
    title: 'Fonctionnalités Transversales',
    description: 'Multi-campus, API REST, SSO/LDAP, application mobile native et intelligence artificielle.',
    tiers: ['premium']
  }
]

// ── Pricing plans ──
const plans = [
  {
    name: 'Essentiel',
    subtitle: 'Pour les petits établissements',
    priceYear: '350 000',
    priceMonth: '35 000',
    students: '500',
    admins: '10',
    modules: 7,
    features: 28,
    color: JANDOO_BLUE,
    popular: false,
    highlights: [
      'Structure académique complète',
      'Inscriptions (admin + pédagogique)',
      'Notes & évaluations (CC, Examen)',
      'Calcul automatique des moyennes',
      'Documents officiels (1 template/type)',
      'Relevés de notes & attestations PDF',
      'Rôles : Admin, Enseignant, Étudiant',
      'Import CSV/Excel',
      'Stockage : 10 Go',
      'Support email (72h)'
    ],
    notIncluded: [
      'Emplois du temps',
      'Présences & Absences',
      'Comptabilité Étudiants',
      'Paie Personnel',
      'API Access'
    ]
  },
  {
    name: 'Professionnel',
    subtitle: 'Pour les établissements établis',
    priceYear: '1 200 000',
    priceMonth: '120 000',
    students: '2 000',
    admins: '50',
    modules: 8,
    features: 44,
    color: JANDOO_RED,
    popular: true,
    highlights: [
      'Tout de Essentiel +',
      'Présences & Absences (QR Code)',
      'Emplois du temps (détection conflits)',
      'Examens & Planning complet',
      'Comptabilité étudiants (facturation)',
      'Paie Personnel (brut → net)',
      'Documents avancés (3 templates/type)',
      'Génération en masse de documents',
      'Templates personnalisables (logo)',
      'Formation initiale (2 sessions)',
      'Stockage : 50 Go',
      'Support email (24h) + téléphone'
    ],
    notIncluded: [
      'Analytics avancés',
      'Multi-campus',
      'Application mobile native',
      'API complète (lecture seule)',
    ]
  },
  {
    name: 'Entreprise',
    subtitle: 'Pour les grandes institutions',
    priceYear: '3 000 000',
    priceMonth: '300 000',
    students: 'Illimité',
    admins: 'Illimité',
    modules: 9,
    features: 58,
    color: '#FFB400',
    popular: false,
    highlights: [
      'Tout de Professionnel +',
      'Analytics & Reporting avancés',
      'Multi-campus / Multi-sites',
      'API complète + Webhooks',
      'SSO (SAML, CAS, LDAP)',
      'Application mobile native (iOS/Android)',
      'Notifications Email + SMS + In-App',
      'Documents premium (templates illimités)',
      'QR codes + Signatures électroniques',
      'Intelligence artificielle intégrée',
      'Stockage illimité',
      'Support 24/7 + CSM dédié',
      'Formation illimitée',
      'SLA 99.9% de disponibilité'
    ],
    notIncluded: []
  }
]

// ── Comparison table data ──
const comparisonRows = [
  { feature: 'Étudiants max', basic: '500', medium: '2 000', premium: 'Illimité' },
  { feature: 'Utilisateurs admin', basic: '10', medium: '50', premium: 'Illimité' },
  { feature: 'Structure Académique', basic: true, medium: true, premium: true },
  { feature: 'Inscriptions', basic: true, medium: true, premium: true },
  { feature: 'Notes & Évaluations', basic: 'Simplifié', medium: 'Complet', premium: 'Complet + IA' },
  { feature: 'Documents Officiels', basic: '1 template', medium: '3 templates', premium: 'Illimité' },
  { feature: 'Emplois du Temps', basic: false, medium: true, premium: true },
  { feature: 'Présences & Absences', basic: false, medium: true, premium: true },
  { feature: 'Examens & Planning', basic: false, medium: true, premium: true },
  { feature: 'Comptabilité Étudiants', basic: false, medium: true, premium: true },
  { feature: 'Paie Personnel', basic: false, medium: true, premium: true },
  { feature: 'Multi-campus', basic: false, medium: false, premium: true },
  { feature: 'API Access', basic: false, medium: 'Lecture seule', premium: 'Complet + Webhooks' },
  { feature: 'Application mobile', basic: false, medium: false, premium: true },
  { feature: 'SSO / LDAP', basic: false, medium: false, premium: true },
  { feature: 'Notifications', basic: false, medium: 'Email', premium: 'Email + SMS + In-App' },
  { feature: 'Personnalisation', basic: 'Standard', medium: 'Logo + En-têtes', premium: 'White-label' },
  { feature: 'Stockage', basic: '10 Go', medium: '50 Go', premium: 'Illimité' },
  { feature: 'Support', basic: 'Email (72h)', medium: 'Email (24h) + Tél', premium: '24/7 + CSM dédié' },
  { feature: 'Formation', basic: false, medium: '2 sessions', premium: 'Illimitée' },
  { feature: 'SLA Disponibilité', basic: '99%', medium: '99.5%', premium: '99.9%' }
]

const LandingPage = ({ lang }: Props) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)

  const loginPath = `/${lang}/login`

  const navLinks = [
    { label: 'Modules', href: '#modules' },
    { label: 'Tarifs', href: '#pricing' },
    { label: 'Comparatif', href: '#comparison' },
    { label: 'Contact', href: '#contact' }
  ]

  const renderCellValue = (value: boolean | string) => {
    if (value === true) return <i className='ri-check-line' style={{ fontSize: 20, color: '#4CAF50' }} />
    if (value === false) return <i className='ri-close-line' style={{ fontSize: 20, color: '#ccc' }} />

    return (
      <Typography variant='body2' sx={{ fontSize: '0.8rem' }}>
        {value}
      </Typography>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* ═══ HEADER / NAVBAR ═══ */}
      <AppBar
        position='fixed'
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Container maxWidth='lg'>
          <Toolbar disableGutters sx={{ height: 70 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
              <Image src='/logo.png' alt='Jandoo' width={40} height={40} />
              <Typography variant='h5' sx={{ fontWeight: 700, color: JANDOO_BLUE }}>
                Jandoo
              </Typography>
            </Box>

            {isMobile ? (
              <>
                <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: 'text.primary' }}>
                  <i className='ri-menu-line' style={{ fontSize: 24 }} />
                </IconButton>
                <Drawer anchor='right' open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                  <Box sx={{ width: 260, pt: 2 }}>
                    <List>
                      {navLinks.map(link => (
                        <ListItem key={link.label} disablePadding>
                          <ListItemButton
                            component='a'
                            href={link.href}
                            onClick={() => setDrawerOpen(false)}
                          >
                            <ListItemText primary={link.label} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                      <ListItem disablePadding>
                        <ListItemButton component={Link} href={loginPath}>
                          <ListItemText primary='Se connecter' sx={{ color: JANDOO_BLUE }} />
                        </ListItemButton>
                      </ListItem>
                    </List>
                  </Box>
                </Drawer>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {navLinks.map(link => (
                  <Typography
                    key={link.label}
                    component='a'
                    href={link.href}
                    sx={{
                      color: 'text.secondary',
                      textDecoration: 'none',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      '&:hover': { color: JANDOO_BLUE }
                    }}
                  >
                    {link.label}
                  </Typography>
                ))}
                <Button
                  component={Link}
                  href={loginPath}
                  variant='contained'
                  sx={{
                    bgcolor: JANDOO_BLUE,
                    '&:hover': { bgcolor: '#1E7EA0' },
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3
                  }}
                >
                  Se connecter
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* ═══ HERO SECTION ═══ */}
      <Box
        sx={{
          pt: { xs: 24, md: 18 },
          pb: { xs: 8, md: 12 },
          background: `linear-gradient(135deg, ${JANDOO_BLUE}08 0%, ${JANDOO_BLUE}15 50%, ${JANDOO_RED}08 100%)`
        }}
      >
        <Container maxWidth='lg'>
          <Grid container spacing={4} alignItems='center'>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant='h2'
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2rem', md: '2.75rem' },
                  lineHeight: 1.2,
                  mb: 2,
                  color: 'text.primary'
                }}
              >
                La plateforme de gestion scolaire{' '}
                <Box component='span' sx={{ color: JANDOO_BLUE }}>
                  intelligente
                </Box>
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  fontSize: { xs: '1rem', md: '1.15rem' },
                  color: 'text.secondary',
                  mb: 2,
                  lineHeight: 1.7,
                  maxWidth: 520
                }}
              >
                Simplifiez la gestion de votre établissement scolaire avec Jandoo. Notes, emplois du temps,
                absences, comptabilité, paie — tout en un seul endroit.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
                <Chip label='9 modules' size='small' sx={{ bgcolor: `${JANDOO_BLUE}15`, color: JANDOO_BLUE, fontWeight: 600 }} />
                <Chip label='Jusqu&apos;à 58 fonctionnalités' size='small' sx={{ bgcolor: `${JANDOO_RED}15`, color: JANDOO_RED, fontWeight: 600 }} />
                <Chip label='Support dédié' size='small' sx={{ bgcolor: '#4CAF5015', color: '#4CAF50', fontWeight: 600 }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  component='a'
                  href='#pricing'
                  variant='contained'
                  size='large'
                  sx={{
                    bgcolor: JANDOO_BLUE,
                    '&:hover': { bgcolor: '#1E7EA0' },
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem'
                  }}
                >
                  Voir les tarifs
                </Button>
                <Button
                  component='a'
                  href='#modules'
                  variant='outlined'
                  size='large'
                  sx={{
                    borderColor: JANDOO_BLUE,
                    color: JANDOO_BLUE,
                    '&:hover': { borderColor: '#1E7EA0', bgcolor: `${JANDOO_BLUE}08` },
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem'
                  }}
                >
                  Découvrir
                </Button>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(37, 150, 190, 0.15)',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Image
                  src='/img/img.png'
                  alt='Jandoo Dashboard - Statistiques des Inscriptions'
                  width={700}
                  height={450}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  priority
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ═══ MODULES SECTION ═══ */}
      <Box id='modules' sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth='lg'>
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 8 } }}>
            <Typography
              variant='overline'
              sx={{ color: JANDOO_BLUE, fontWeight: 700, letterSpacing: 2, mb: 1, display: 'block' }}
            >
              9 Modules
            </Typography>
            <Typography
              variant='h3'
              sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '2.25rem' }, mb: 2 }}
            >
              Une solution complète et modulaire
            </Typography>
            <Typography variant='body1' sx={{ color: 'text.secondary', maxWidth: 650, mx: 'auto' }}>
              De la structure académique à la paie du personnel, Jandoo couvre l&apos;ensemble des besoins
              de gestion de votre établissement d&apos;enseignement supérieur.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {modules.map((mod, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 40px ${JANDOO_BLUE}15`,
                      borderColor: JANDOO_BLUE
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: 2,
                          bgcolor: `${JANDOO_BLUE}12`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <i className={mod.icon} style={{ fontSize: 26, color: JANDOO_BLUE }} />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {mod.tiers.includes('basic') && (
                          <Chip label='B' size='small' sx={{ height: 20, fontSize: '0.65rem', bgcolor: `${JANDOO_BLUE}15`, color: JANDOO_BLUE }} />
                        )}
                        {mod.tiers.includes('medium') && (
                          <Chip label='P' size='small' sx={{ height: 20, fontSize: '0.65rem', bgcolor: `${JANDOO_RED}15`, color: JANDOO_RED }} />
                        )}
                        {mod.tiers.includes('premium') && (
                          <Chip label='E' size='small' sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#FFB40020', color: '#B07D00' }} />
                        )}
                      </Box>
                    </Box>
                    <Typography variant='h6' sx={{ fontWeight: 600, mb: 1, fontSize: '1rem' }}>
                      {mod.title}
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                      {mod.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Chip label='B' size='small' sx={{ height: 20, fontSize: '0.65rem', bgcolor: `${JANDOO_BLUE}15`, color: JANDOO_BLUE }} />
                <Typography variant='caption' sx={{ color: 'text.secondary' }}>Essentiel</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Chip label='P' size='small' sx={{ height: 20, fontSize: '0.65rem', bgcolor: `${JANDOO_RED}15`, color: JANDOO_RED }} />
                <Typography variant='caption' sx={{ color: 'text.secondary' }}>Professionnel</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Chip label='E' size='small' sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#FFB40020', color: '#B07D00' }} />
                <Typography variant='caption' sx={{ color: 'text.secondary' }}>Entreprise</Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ═══ PRICING SECTION ═══ */}
      <Box
        id='pricing'
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: 'background.paper'
        }}
      >
        <Container maxWidth='lg'>
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 8 } }}>
            <Typography
              variant='overline'
              sx={{ color: JANDOO_RED, fontWeight: 700, letterSpacing: 2, mb: 1, display: 'block' }}
            >
              Tarifs
            </Typography>
            <Typography
              variant='h3'
              sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '2.25rem' }, mb: 2 }}
            >
              Des tarifs adaptés à chaque établissement
            </Typography>
            <Typography variant='body1' sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
              2 mois offerts avec l&apos;abonnement annuel. Des formules adaptées à chaque taille d&apos;établissement.
            </Typography>
          </Box>

          <Grid container spacing={3} alignItems='stretch'>
            {plans.map((plan, index) => (
              <Grid key={index} size={{ xs: 12, md: 4 }}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    border: '2px solid',
                    borderColor: plan.popular ? plan.color : 'divider',
                    boxShadow: plan.popular ? `0 8px 40px ${plan.color}25` : 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 40px ${plan.color}20`
                    }
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label='Le plus populaire'
                      size='small'
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bgcolor: plan.color,
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.75rem'
                      }}
                    />
                  )}
                  <CardContent sx={{ p: { xs: 3, md: 4 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant='h5' sx={{ fontWeight: 700, color: plan.color, mb: 0.5 }}>
                      {plan.name}
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary', mb: 3 }}>
                      {plan.subtitle}
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                        <Typography variant='h3' sx={{ fontWeight: 800, color: 'text.primary' }}>
                          {plan.priceMonth}
                        </Typography>
                        <Typography variant='body1' sx={{ color: 'text.secondary' }}>
                          FCFA/mois
                        </Typography>
                      </Box>
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        ou {plan.priceYear} FCFA/an (2 mois offerts)
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                      <Chip
                        label={`${plan.students} étudiants`}
                        size='small'
                        variant='outlined'
                        sx={{ fontSize: '0.75rem' }}
                      />
                      <Chip
                        label={`${plan.admins} admins`}
                        size='small'
                        variant='outlined'
                        sx={{ fontSize: '0.75rem' }}
                      />
                      <Chip
                        label={`${plan.modules} modules`}
                        size='small'
                        variant='outlined'
                        sx={{ fontSize: '0.75rem' }}
                      />
                      <Chip
                        label={`${plan.features} fonctionnalités`}
                        size='small'
                        variant='outlined'
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </Box>

                    <Divider sx={{ mb: 2.5 }} />

                    <Box sx={{ flexGrow: 1 }}>
                      {plan.highlights.map((item, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.2 }}>
                          <i
                            className='ri-check-line'
                            style={{ fontSize: 16, color: '#4CAF50', marginTop: 3, flexShrink: 0 }}
                          />
                          <Typography variant='body2' sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                            {item}
                          </Typography>
                        </Box>
                      ))}
                      {plan.notIncluded.map((item, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.2 }}>
                          <i
                            className='ri-close-line'
                            style={{ fontSize: 16, color: '#ccc', marginTop: 3, flexShrink: 0 }}
                          />
                          <Typography variant='body2' sx={{ color: 'text.disabled', lineHeight: 1.5 }}>
                            {item}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    <Button
                      component={Link}
                      href={loginPath}
                      variant={plan.popular ? 'contained' : 'outlined'}
                      fullWidth
                      sx={{
                        mt: 3,
                        py: 1.2,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        ...(plan.popular
                          ? { bgcolor: plan.color, '&:hover': { bgcolor: '#C41E21' } }
                          : { borderColor: plan.color, color: plan.color, '&:hover': { borderColor: plan.color, bgcolor: `${plan.color}08` } }
                        )
                      }}
                    >
                      Choisir cette offre
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══ COMPARISON TABLE ═══ */}
      <Box id='comparison' sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth='lg'>
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 8 } }}>
            <Typography
              variant='overline'
              sx={{ color: JANDOO_BLUE, fontWeight: 700, letterSpacing: 2, mb: 1, display: 'block' }}
            >
              Comparatif
            </Typography>
            <Typography
              variant='h3'
              sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '2.25rem' }, mb: 2 }}
            >
              Comparez les offres en détail
            </Typography>
          </Box>

          <TableContainer component={Paper} variant='outlined' sx={{ borderRadius: 2, overflow: 'auto' }}>
            <Table size='small'>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 700, minWidth: 180, py: 2 }}>Fonctionnalité</TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700, color: JANDOO_BLUE, py: 2, minWidth: 120 }}>
                    Essentiel
                    <Typography variant='caption' display='block' sx={{ color: 'text.secondary', fontWeight: 400 }}>
                      35 000 FCFA/mois
                    </Typography>
                  </TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700, color: JANDOO_RED, py: 2, minWidth: 120 }}>
                    Professionnel
                    <Typography variant='caption' display='block' sx={{ color: 'text.secondary', fontWeight: 400 }}>
                      120 000 FCFA/mois
                    </Typography>
                  </TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700, color: '#B07D00', py: 2, minWidth: 120 }}>
                    Entreprise
                    <Typography variant='caption' display='block' sx={{ color: 'text.secondary', fontWeight: 400 }}>
                      300 000 FCFA/mois
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comparisonRows.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}
                  >
                    <TableCell sx={{ fontWeight: 500, py: 1.5 }}>{row.feature}</TableCell>
                    <TableCell align='center' sx={{ py: 1.5 }}>{renderCellValue(row.basic)}</TableCell>
                    <TableCell align='center' sx={{ py: 1.5 }}>{renderCellValue(row.medium)}</TableCell>
                    <TableCell align='center' sx={{ py: 1.5 }}>{renderCellValue(row.premium)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>

      {/* ═══ FEATURES HIGHLIGHT ═══ */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
        <Container maxWidth='lg'>
          <Grid container spacing={6} alignItems='center'>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.08)',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Image
                  src='/images/front-pages/landing-page/crm-dashboard.png'
                  alt='Modules Jandoo'
                  width={600}
                  height={400}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant='overline'
                sx={{ color: JANDOO_RED, fontWeight: 700, letterSpacing: 2, mb: 1, display: 'block' }}
              >
                Pourquoi Jandoo ?
              </Typography>
              <Typography
                variant='h3'
                sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '2.25rem' }, mb: 3 }}
              >
                Conçu pour l&apos;enseignement supérieur LMD
              </Typography>
              {[
                'Conforme au système LMD (Licence-Master-Doctorat)',
                'Calcul automatique des crédits ECTS',
                'Compensation et délibérations paramétrables',
                'Multi-tenant : isolation complète des données',
                'Import/Export CSV, Excel, PDF, iCal',
                'Interface disponible en Français, Anglais et Arabe'
              ].map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: `${JANDOO_BLUE}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <i className='ri-check-line' style={{ fontSize: 14, color: JANDOO_BLUE }} />
                  </Box>
                  <Typography variant='body1' sx={{ color: 'text.secondary' }}>
                    {item}
                  </Typography>
                </Box>
              ))}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ═══ CTA SECTION ═══ */}
      <Box
        id='contact'
        sx={{
          py: { xs: 8, md: 10 },
          background: `linear-gradient(135deg, ${JANDOO_BLUE} 0%, #1E7EA0 100%)`,
          textAlign: 'center'
        }}
      >
        <Container maxWidth='sm'>
          <Typography
            variant='h3'
            sx={{
              fontWeight: 700,
              color: '#fff',
              fontSize: { xs: '1.75rem', md: '2.25rem' },
              mb: 2
            }}
          >
            Prêt à transformer votre établissement ?
          </Typography>
          <Typography variant='body1' sx={{ color: 'rgba(255,255,255,0.85)', mb: 1.5, lineHeight: 1.7 }}>
            Rejoignez les établissements qui font confiance à Jandoo pour simplifier leur gestion scolaire.
          </Typography>
          <Typography variant='body2' sx={{ color: 'rgba(255,255,255,0.7)', mb: 4 }}>
            Migration de données assistée incluse pour tout abonnement confirmé.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href={loginPath}
              variant='contained'
              size='large'
              sx={{
                bgcolor: '#fff',
                color: JANDOO_BLUE,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                textTransform: 'none',
                fontWeight: 700,
                px: 5,
                py: 1.5,
                fontSize: '1.05rem'
              }}
            >
              Commencer maintenant
            </Button>
            <Button
              component='a'
              href='#pricing'
              variant='outlined'
              size='large'
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: '#fff',
                '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                fontSize: '1rem'
              }}
            >
              Voir les tarifs
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ═══ FOOTER ═══ */}
      <Box
        component='footer'
        sx={{
          py: 5,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Container maxWidth='lg'>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Image src='/logo.png' alt='Jandoo' width={32} height={32} />
                <Typography variant='h6' sx={{ fontWeight: 700, color: JANDOO_BLUE }}>
                  Jandoo
                </Typography>
              </Box>
              <Typography variant='body2' sx={{ color: 'text.secondary', lineHeight: 1.7, maxWidth: 300 }}>
                Plateforme de gestion scolaire intelligente pour l&apos;enseignement supérieur LMD.
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1.5 }}>Produit</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography component='a' href='#modules' sx={{ color: 'text.secondary', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: JANDOO_BLUE } }}>
                  Modules
                </Typography>
                <Typography component='a' href='#pricing' sx={{ color: 'text.secondary', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: JANDOO_BLUE } }}>
                  Tarifs
                </Typography>
                <Typography component='a' href='#comparison' sx={{ color: 'text.secondary', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: JANDOO_BLUE } }}>
                  Comparatif
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1.5 }}>Offres</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography component='a' href='#pricing' sx={{ color: 'text.secondary', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: JANDOO_BLUE } }}>
                  Essentiel
                </Typography>
                <Typography component='a' href='#pricing' sx={{ color: 'text.secondary', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: JANDOO_BLUE } }}>
                  Professionnel
                </Typography>
                <Typography component='a' href='#pricing' sx={{ color: 'text.secondary', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: JANDOO_BLUE } }}>
                  Entreprise
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1.5 }}>Accès</Typography>
              <Button
                component={Link}
                href={loginPath}
                variant='contained'
                size='small'
                sx={{
                  bgcolor: JANDOO_BLUE,
                  '&:hover': { bgcolor: '#1E7EA0' },
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Se connecter
              </Button>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant='body2' sx={{ color: 'text.secondary', textAlign: 'center' }}>
            &copy; {new Date().getFullYear()} Jandoo. Tous droits réservés.
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}

export default LandingPage
