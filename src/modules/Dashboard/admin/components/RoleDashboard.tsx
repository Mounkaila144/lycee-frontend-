'use client'

import { useEffect, useState } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'

import { createApiClient } from '@/shared/lib/api-client'
import { useAuthUser } from '@/shared/hooks/useAuthUser'
import TeacherHome from '@/modules/StructureAcademique/teacher/components/TeacherHome'

type KpiTile = {
  label: string
  value: string | null
}

const PRIVILEGED_ROLES = ['Administrator', 'Manager']

const formatAmount = (value: number | string | null | undefined): string =>
  value === null || value === undefined ? '—' : `${Number(value).toLocaleString('fr-FR')} FCFA`

/**
 * Indicateurs clés pour Administrator / Manager.
 * Chaque widget appelle un endpoint autorisé pour ces deux rôles :
 *   GET /admin/academic-years/active
 *   GET /admin/enrollment/students/statistics/summary
 *   GET /admin/classes/stats
 *   GET /admin/finance/reports/dashboard
 * Un widget en échec affiche « — » sans bloquer les autres.
 */
function AdminKpis() {
  const [tiles, setTiles] = useState<KpiTile[] | null>(null)

  useEffect(() => {
    const client = createApiClient()

    const safe = <T,>(promise: Promise<{ data: { data: T } }>): Promise<T | null> =>
      promise.then(response => response.data.data).catch(() => null)

    Promise.all([
      safe<{ name: string }>(client.get('/admin/academic-years/active')),
      safe<{ total: number }>(client.get('/admin/enrollment/students/statistics/summary')),
      safe<{ total_classes: number }>(client.get('/admin/classes/stats')),
      safe<{ summary: { total_paid: string; total_outstanding: number; collection_rate: number } }>(
        client.get('/admin/finance/reports/dashboard')
      )
    ]).then(([year, students, classes, finance]) => {
      setTiles([
        { label: 'Année scolaire active', value: year?.name ?? null },
        { label: 'Élèves', value: students ? String(students.total) : null },
        { label: 'Classes', value: classes ? String(classes.total_classes) : null },
        { label: 'Encaissé', value: finance ? formatAmount(finance.summary.total_paid) : null },
        { label: 'Reste à recouvrer', value: finance ? formatAmount(finance.summary.total_outstanding) : null },
        { label: 'Taux de recouvrement', value: finance ? `${finance.summary.collection_rate} %` : null }
      ])
    })
  }, [])

  if (!tiles) {
    return <CircularProgress size={28} />
  }

  return (
    <Grid container spacing={4}>
      {tiles.map(tile => (
        <Grid key={tile.label} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card variant='outlined'>
            <CardContent>
              <Typography variant='body2' color='text.secondary'>
                {tile.label}
              </Typography>
              <Typography variant='h5'>{tile.value ?? '—'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

/**
 * Tableau de bord `/admin/dashboard` adapté au rôle :
 *   - Professeur (sans rôle privilégié) → accueil « Mes classes »
 *   - Administrator / Manager → indicateurs clés
 *   - autres rôles → message d'accueil (aucun appel API)
 */
export default function RoleDashboard({ title }: { title: string }) {
  const authUser = useAuthUser()

  if (!authUser) {
    return null
  }

  const isPrivileged = authUser.roles.some(role => PRIVILEGED_ROLES.includes(role))

  if (!isPrivileged && authUser.roles.includes('Professeur')) {
    return <TeacherHome />
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Typography variant='h4' className='mbe-4'>
              {title}
            </Typography>
            <Typography variant='body1' color='text.secondary' className='mbe-4'>
              Bienvenue sur votre tableau de bord.
            </Typography>
            {isPrivileged && <AdminKpis />}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
