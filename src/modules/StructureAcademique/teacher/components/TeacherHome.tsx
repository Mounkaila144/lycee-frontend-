'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid2'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import { useAuth } from '@/modules/UsersGuard/admin/hooks/useAuth'
import type { Classe, ClasseStudent } from '../../types/classe.types'
import { teacherClassesService } from '../services/teacherClassesService'

const shortcuts = [
  { label: 'Saisie des notes', route: '/admin/teacher/grades', icon: '✏️' },
  { label: 'Résultats & bulletins', route: '/admin/grades/class-results', icon: '📊' },
  { label: "Feuille d'appel", route: '/admin/attendance/sessions', icon: '✅' },
  { label: 'Mon emploi du temps', route: '/admin/timetable/teacher-view', icon: '📅' },
  { label: 'Messages', route: '/admin/teacher/messages', icon: '✉️' }
]

/**
 * Accueil Professeur (`/admin/teacher/home`) : raccourcis + « Mes classes »
 * (classes dont le professeur est professeur principal) et leurs élèves.
 */
export default function TeacherHome() {
  const { user } = useAuth()
  const [classes, setClasses] = useState<Classe[]>([])
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [classesError, setClassesError] = useState<string | null>(null)
  const [selectedClasse, setSelectedClasse] = useState<Classe | null>(null)
  const [students, setStudents] = useState<ClasseStudent[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [studentsError, setStudentsError] = useState<string | null>(null)

  useEffect(() => {
    teacherClassesService
      .myClasses()
      .then(data => {
        setClasses(data)

        if (data.length > 0) {
          setSelectedClasse(data[0])
        }
      })
      .catch(() => setClassesError('Impossible de charger vos classes.'))
      .finally(() => setLoadingClasses(false))
  }, [])

  useEffect(() => {
    if (!selectedClasse) {
      return
    }

    setLoadingStudents(true)
    setStudentsError(null)
    teacherClassesService
      .classStudents(selectedClasse.id)
      .then(setStudents)
      .catch(() => setStudentsError('Impossible de charger les élèves de cette classe.'))
      .finally(() => setLoadingStudents(false))
  }, [selectedClasse])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>Bonjour{user?.firstname ? ` ${user.firstname}` : ''}</Typography>
        <Typography color='text.secondary'>Bienvenue dans votre espace professeur.</Typography>
      </Grid>

      {shortcuts.map(shortcut => (
        <Grid key={shortcut.route} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardActionArea component={Link} href={shortcut.route}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant='h4' component='span'>
                  {shortcut.icon}
                </Typography>
                <Typography variant='h6'>{shortcut.label}</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}

      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardHeader title='Mes classes' subheader='Classes dont vous êtes professeur principal' />
          <CardContent>
            {loadingClasses && <CircularProgress size={28} />}
            {classesError && <Alert severity='error'>{classesError}</Alert>}
            {!loadingClasses && !classesError && classes.length === 0 && (
              <Alert severity='info'>Aucune classe ne vous est attribuée pour l&apos;année scolaire active.</Alert>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {classes.map(classe => (
                <Card
                  key={classe.id}
                  variant='outlined'
                  sx={{ borderColor: selectedClasse?.id === classe.id ? 'primary.main' : undefined }}
                >
                  <CardActionArea onClick={() => setSelectedClasse(classe)}>
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant='h6'>{classe.name}</Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {classe.level?.name}
                          {classe.academic_year?.name ? ` — ${classe.academic_year.name}` : ''}
                        </Typography>
                      </Box>
                      <Chip label={`${classe.students_count ?? 0} élève(s)`} size='small' color='primary' variant='tonal' />
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <Card>
          <CardHeader
            title={selectedClasse ? `Élèves — ${selectedClasse.name}` : 'Élèves'}
            subheader={selectedClasse ? `${students.length} élève(s) inscrit(s)` : 'Sélectionnez une classe'}
          />
          <CardContent>
            {loadingStudents && <CircularProgress size={28} />}
            {studentsError && <Alert severity='error'>{studentsError}</Alert>}
            {!loadingStudents && !studentsError && selectedClasse && (
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Matricule</TableCell>
                      <TableCell>Nom</TableCell>
                      <TableCell>Prénom</TableCell>
                      <TableCell>Sexe</TableCell>
                      <TableCell>Date de naissance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5}>Aucun élève inscrit dans cette classe.</TableCell>
                      </TableRow>
                    )}
                    {students.map(student => (
                      <TableRow key={student.id}>
                        <TableCell>{student.matricule}</TableCell>
                        <TableCell>{student.lastname}</TableCell>
                        <TableCell>{student.firstname}</TableCell>
                        <TableCell>{student.sex ?? '—'}</TableCell>
                        <TableCell>
                          {student.birthdate ? new Date(student.birthdate).toLocaleDateString('fr-FR') : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
