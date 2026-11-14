'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode, SyntheticEvent } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid2'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Snackbar from '@mui/material/Snackbar'
import Tab from '@mui/material/Tab'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

// Content Imports
import {
  CLASS_ACCOUNTS,
  CLASS_ACCOUNTS_NOTE,
  DEFAULT_SITE_URL,
  DEMO_ACCOUNTS,
  DEMO_SCENARIOS,
  FAQ_ITEMS,
  GUIDE_INTRO,
  JOURNEYS,
  LOGIN_PATHS,
  ROLE_GUIDES,
  ROLE_OVERVIEWS,
  TOC
} from './guideContent'
import type { RoleId } from './guideContent'

/**
 * Normalise un texte pour la recherche (minuscules, sans accents).
 */
const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

const matches = (query: string, ...values: Array<string | undefined | string[]>): boolean => {
  if (!query) {
    return true
  }

  return values.some(value => {
    if (!value) {
      return false
    }

    const text = Array.isArray(value) ? value.join(' ') : value

    return normalize(text).includes(query)
  })
}

/**
 * Copie un texte dans le presse-papiers (avec repli pour les contextes non sécurisés).
 */
const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)

      return true
    }

    const textarea = document.createElement('textarea')

    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')

    document.body.removeChild(textarea)

    return ok
  } catch {
    return false
  }
}

const SectionTitle = ({ id, icon, children }: { id: string; icon: string; children: ReactNode }) => (
  <Typography
    id={id}
    variant='h4'
    component='h2'
    sx={{ scrollMarginTop: 24, display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}
  >
    <i className={icon} />
    {children}
  </Typography>
)

const GuidePage = () => {
  const params = useParams()
  const lang = typeof params?.lang === 'string' ? params.lang : 'fr'

  const [search, setSearch] = useState('')
  const [roleTab, setRoleTab] = useState<RoleId>('admin')
  const [siteUrl, setSiteUrl] = useState(DEFAULT_SITE_URL)
  const [snack, setSnack] = useState<string | null>(null)

  useEffect(() => {
    setSiteUrl(window.location.origin)
  }, [])

  const query = normalize(search.trim())

  const handleCopy = async (text: string, label: string) => {
    const ok = await copyToClipboard(text)

    setSnack(ok ? `${label} copié` : 'Copie impossible : sélectionnez le texte manuellement')
  }

  const CopyButton = ({ text, label }: { text: string; label: string }) => (
    <Tooltip title={`Copier ${label.toLowerCase()}`}>
      <IconButton size='small' onClick={() => handleCopy(text, label)} aria-label={`Copier ${label}`}>
        <i className='ri-file-copy-line' />
      </IconButton>
    </Tooltip>
  )

  const loginUrls = LOGIN_PATHS.map(entry => ({ ...entry, url: `${siteUrl}${entry.path}` }))

  const filteredOverviews = ROLE_OVERVIEWS.filter(role =>
    matches(query, role.label, role.summary, role.can, role.cannot, role.home, role.account)
  )

  const filteredAccounts = DEMO_ACCOUNTS.filter(account =>
    matches(query, account.role, account.username, account.note)
  )

  const filteredClasses = CLASS_ACCOUNTS.filter(entry =>
    matches(query, entry.classe, entry.eleves, entry.parents, entry.headTeacher)
  )

  const featuresByRole = useMemo(() => {
    const result = {} as Record<RoleId, (typeof ROLE_GUIDES)[number]['features']>

    ROLE_GUIDES.forEach(guide => {
      result[guide.roleId] = guide.features.filter(feature =>
        matches(query, feature.path, feature.route, feature.description, feature.actions)
      )
    })

    return result
  }, [query])

  const filteredJourneys = JOURNEYS.filter(journey =>
    matches(
      query,
      journey.title,
      journey.summary,
      journey.steps.map(step => `${step.actor} ${step.path} ${step.action}`)
    )
  )

  const filteredDemos = DEMO_SCENARIOS.filter(demo =>
    matches(query, demo.title, demo.account, demo.steps, demo.expected)
  )

  const filteredFaq = FAQ_ITEMS.filter(item => matches(query, item.q, item.a))

  const activeGuide = ROLE_GUIDES.find(guide => guide.roleId === roleTab)
  const activeOverview = ROLE_OVERVIEWS.find(role => role.id === roleTab)
  const activeFeatures = featuresByRole[roleTab] ?? []

  const totalResults =
    filteredOverviews.length +
    filteredAccounts.length +
    filteredClasses.length +
    Object.values(featuresByRole).reduce((sum, list) => sum + list.length, 0) +
    filteredJourneys.length +
    filteredDemos.length +
    filteredFaq.length

  return (
    <Box dir='ltr' sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <Box
        component='header'
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          px: { xs: 4, md: 8 },
          py: 4
        }}
      >
        <Box sx={{ maxWidth: 1280, mx: 'auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3 }}>
          <Box sx={{ flex: '1 1 320px' }}>
            <Typography variant='h3' component='h1'>
              Guide d&apos;utilisation
            </Typography>
            <Typography color='text.secondary'>{GUIDE_INTRO.subtitle}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button component={Link} href={`/${lang}/login`} variant='contained' startIcon={<i className='ri-login-box-line' />}>
              Se connecter
            </Button>
            <Button component={Link} href={`/${lang}/admin/dashboard`} variant='outlined'>
              Mon espace
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 4, md: 8 }, py: 6 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
              <TextField
                fullWidth
                size='small'
                placeholder='Rechercher dans le guide…'
                value={search}
                onChange={event => setSearch(event.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='ri-search-line' />
                      </InputAdornment>
                    ),
                    endAdornment: search ? (
                      <InputAdornment position='end'>
                        <IconButton size='small' onClick={() => setSearch('')} aria-label='Effacer la recherche'>
                          <i className='ri-close-line' />
                        </IconButton>
                      </InputAdornment>
                    ) : undefined
                  }
                }}
              />
              {query && (
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
                  {totalResults} élément(s) correspondant(s)
                </Typography>
              )}
              <Card variant='outlined' sx={{ mt: 4 }}>
                <CardContent>
                  <Typography variant='overline' color='text.secondary'>
                    Sommaire
                  </Typography>
                  <Box component='nav' sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, flexWrap: 'wrap', gap: 1 }}>
                    {TOC.map(entry => (
                      <Button
                        key={entry.id}
                        href={`#${entry.id}`}
                        size='small'
                        color='inherit'
                        sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
                        startIcon={<i className={entry.icon} />}
                      >
                        {entry.label}
                      </Button>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 9 }}>
            {/* 1. Présentation */}
            <Box component='section' sx={{ mb: 10 }}>
              <SectionTitle id='presentation' icon='ri-information-line'>
                Présentation et rôles
              </SectionTitle>
              {GUIDE_INTRO.paragraphs.map(paragraph => (
                <Typography key={paragraph} sx={{ mb: 2 }}>
                  {paragraph}
                </Typography>
              ))}
              <Grid container spacing={4} sx={{ mt: 2 }}>
                {filteredOverviews.map(role => (
                  <Grid key={role.id} size={{ xs: 12, lg: 6 }}>
                    <Card variant='outlined' sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                          <Typography variant='h5'>{role.label}</Typography>
                          <Chip size='small' label={role.account} variant='tonal' color='primary' />
                        </Box>
                        <Typography color='text.secondary' sx={{ mb: 2 }}>
                          {role.summary}
                        </Typography>
                        <Typography variant='body2' sx={{ mb: 2 }}>
                          <strong>Page d&apos;accueil :</strong> {role.home}
                        </Typography>
                        <Typography variant='subtitle2' color='success.main'>
                          Peut
                        </Typography>
                        <Box component='ul' sx={{ mt: 0.5, mb: 2, pl: 5 }}>
                          {role.can.map(item => (
                            <li key={item}>
                              <Typography variant='body2'>{item}</Typography>
                            </li>
                          ))}
                        </Box>
                        <Typography variant='subtitle2' color='error.main'>
                          Ne peut pas
                        </Typography>
                        <Box component='ul' sx={{ mt: 0.5, mb: 0, pl: 5 }}>
                          {role.cannot.map(item => (
                            <li key={item}>
                              <Typography variant='body2'>{item}</Typography>
                            </li>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* 2. Comptes de démonstration */}
            <Box component='section' sx={{ mb: 10 }}>
              <SectionTitle id='comptes' icon='ri-key-2-line'>
                Comptes de démonstration
              </SectionTitle>
              <Alert severity='warning' sx={{ mb: 4 }}>
                Ces comptes sont publics et réservés à la démonstration. Ne saisissez aucune donnée réelle avec
                ces comptes.
              </Alert>
              <Grid container spacing={4} sx={{ mb: 4 }}>
                {loginUrls.map(entry => (
                  <Grid key={entry.path} size={{ xs: 12, md: 6 }}>
                    <Card variant='outlined'>
                      <CardContent>
                        <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                          {entry.label}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography
                            component='a'
                            href={entry.path}
                            color='primary.main'
                            sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}
                          >
                            {entry.url}
                          </Typography>
                          <CopyButton text={entry.url} label='URL' />
                        </Box>
                        <Typography variant='body2' color='text.secondary'>
                          {entry.note}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <TableContainer component={Card} variant='outlined' sx={{ mb: 4 }}>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Rôle</TableCell>
                      <TableCell>Identifiant</TableCell>
                      <TableCell>Mot de passe</TableCell>
                      <TableCell>Remarque</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAccounts.map(account => (
                      <TableRow key={account.username}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{account.role}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Box component='code' sx={{ fontFamily: 'monospace' }}>
                            {account.username}
                          </Box>
                          {account.copyable !== false && <CopyButton text={account.username} label='Identifiant' />}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Box component='code' sx={{ fontFamily: 'monospace' }}>
                            {account.password}
                          </Box>
                          <CopyButton text={account.password} label='Mot de passe' />
                        </TableCell>
                        <TableCell sx={{ minWidth: 220 }}>
                          <Typography variant='body2'>{account.note}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant='h5' sx={{ mb: 2 }}>
                Élèves, classes et parents
              </Typography>
              {CLASS_ACCOUNTS_NOTE.map(paragraph => (
                <Typography key={paragraph} sx={{ mb: 2 }}>
                  {paragraph}
                </Typography>
              ))}
              <TableContainer component={Card} variant='outlined'>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Classe</TableCell>
                      <TableCell>Comptes élèves</TableCell>
                      <TableCell>Comptes parents</TableCell>
                      <TableCell>Professeur principal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredClasses.map(entry => (
                      <TableRow key={entry.classe}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{entry.classe}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{entry.eleves}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{entry.parents}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{entry.headTeacher}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* 3. Guide par rôle */}
            <Box component='section' sx={{ mb: 10 }}>
              <SectionTitle id='roles' icon='ri-team-line'>
                Guide pas à pas par rôle
              </SectionTitle>
              <Typography sx={{ mb: 4 }}>
                Chaque entrée indique le chemin dans le menu latéral (« Menu &gt; Sous-menu »), l&apos;adresse de la
                page et les actions disponibles. Un rôle ne voit que les menus listés dans son onglet.
              </Typography>
              <Tabs
                value={roleTab}
                onChange={(_event: SyntheticEvent, value: RoleId) => setRoleTab(value)}
                variant='scrollable'
                scrollButtons='auto'
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}
              >
                {ROLE_GUIDES.map(guide => {
                  const label = ROLE_OVERVIEWS.find(role => role.id === guide.roleId)?.label ?? guide.roleId
                  const count = featuresByRole[guide.roleId]?.length ?? 0

                  return <Tab key={guide.roleId} value={guide.roleId} label={query ? `${label} (${count})` : label} />
                })}
              </Tabs>
              {activeOverview && (
                <Alert severity='info' sx={{ mb: 4 }}>
                  <strong>Compte de démo :</strong> {activeOverview.account} — <strong>page d&apos;accueil :</strong>{' '}
                  {activeOverview.home}
                  {activeGuide?.intro ? (
                    <>
                      <br />
                      {activeGuide.intro}
                    </>
                  ) : null}
                </Alert>
              )}
              {activeFeatures.length === 0 && (
                <Typography color='text.secondary'>Aucune fonctionnalité ne correspond à la recherche.</Typography>
              )}
              {activeFeatures.map(feature => (
                <Accordion key={`${roleTab}-${feature.path}-${query ? 'q' : ''}`} defaultExpanded={Boolean(query)} disableGutters>
                  <AccordionSummary expandIcon={<i className='ri-arrow-down-s-line' />}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ fontWeight: 600 }}>{feature.path}</Typography>
                      {feature.route && (
                        <Typography variant='caption' color='text.secondary' sx={{ fontFamily: 'monospace' }}>
                          /{lang}
                          {feature.route}
                        </Typography>
                      )}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {feature.description && <Typography sx={{ mb: 2 }}>{feature.description}</Typography>}
                    <Box component='ol' sx={{ m: 0, pl: 5 }}>
                      {feature.actions.map(action => (
                        <li key={action}>
                          <Typography variant='body2' sx={{ mb: 1 }}>
                            {action}
                          </Typography>
                        </li>
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>

            {/* 4. Parcours de bout en bout */}
            <Box component='section' sx={{ mb: 10 }}>
              <SectionTitle id='parcours' icon='ri-route-line'>
                Parcours de bout en bout
              </SectionTitle>
              {filteredJourneys.length === 0 && (
                <Typography color='text.secondary'>Aucun parcours ne correspond à la recherche.</Typography>
              )}
              {filteredJourneys.map(journey => (
                <Accordion key={`${journey.id}-${query ? 'q' : ''}`} defaultExpanded={Boolean(query)} disableGutters>
                  <AccordionSummary expandIcon={<i className='ri-arrow-down-s-line' />}>
                    <Box>
                      <Typography variant='h6'>{journey.title}</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {journey.summary}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table size='small'>
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Qui</TableCell>
                            <TableCell>Où (menu)</TableCell>
                            <TableCell>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {journey.steps.map((step, index) => (
                            <TableRow key={`${journey.id}-${index}`}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>{step.actor}</TableCell>
                              <TableCell sx={{ minWidth: 180 }}>{step.path}</TableCell>
                              <TableCell sx={{ minWidth: 260 }}>{step.action}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>

            {/* 5. Scénarios de démonstration */}
            <Box component='section' sx={{ mb: 10 }}>
              <SectionTitle id='demos' icon='ri-slideshow-line'>
                Scénarios de démonstration
              </SectionTitle>
              <Typography sx={{ mb: 4 }}>
                Démonstrations prêtes à dérouler avec les données de démo. Si une donnée annoncée n&apos;apparaît pas
                (base réinitialisée, action déjà effectuée par un autre visiteur), utilisez un autre élément de la
                liste : le déroulé reste identique.
              </Typography>
              <Grid container spacing={4}>
                {filteredDemos.map((demo, index) => (
                  <Grid key={demo.id} size={{ xs: 12, lg: 6 }}>
                    <Card variant='outlined' sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant='overline' color='text.secondary'>
                          Démo {index + 1}
                        </Typography>
                        <Typography variant='h6' sx={{ mb: 1 }}>
                          {demo.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Chip size='small' color='primary' variant='tonal' label={`Compte : ${demo.account}`} />
                          <CopyButton text={demo.account} label='Identifiant' />
                        </Box>
                        <Box component='ol' sx={{ m: 0, pl: 5 }}>
                          {demo.steps.map(step => (
                            <li key={step}>
                              <Typography variant='body2' sx={{ mb: 1 }}>
                                {step}
                              </Typography>
                            </li>
                          ))}
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant='body2'>
                          <strong>Résultat attendu :</strong> {demo.expected}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* 6. FAQ */}
            <Box component='section' sx={{ mb: 10 }}>
              <SectionTitle id='faq' icon='ri-question-line'>
                FAQ et dépannage
              </SectionTitle>
              {filteredFaq.map(item => (
                <Accordion key={`${item.q}-${query ? 'q' : ''}`} defaultExpanded={Boolean(query)} disableGutters>
                  <AccordionSummary expandIcon={<i className='ri-arrow-down-s-line' />}>
                    <Typography sx={{ fontWeight: 600 }}>{item.q}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>{item.a}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={2500}
        onClose={() => setSnack(null)}
        message={snack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  )
}

export default GuidePage
