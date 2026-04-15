'use client'

import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import type { AcademicYear, Semester } from '../../types/academicCalendar.types'
import { useSemesters } from '../hooks/useSemesters'
import SemesterFormDialog from './SemesterFormDialog'
import SemesterClosureDialog from './SemesterClosureDialog'
import AcademicPeriodsDialog from './AcademicPeriodsDialog'
import SemesterModulesDialog from './SemesterModulesDialog'
import { EvaluationPeriodsDialog } from './EvaluationPeriodsDialog'

interface SemesterManagementDialogProps {
  open: boolean
  onClose: () => void
  academicYear: AcademicYear
}

const SemesterManagementDialog = ({ open, onClose, academicYear }: SemesterManagementDialogProps) => {
  const { semesters, loading, error, createSemester, updateSemester, deleteSemester, closeSemester } = useSemesters({
    academicYearId: academicYear.id
  })

  const [formOpen, setFormOpen] = useState(false)
  const [closureOpen, setClosureOpen] = useState(false)
  const [periodsOpen, setPeriodsOpen] = useState(false)
  const [modulesOpen, setModulesOpen] = useState(false)
  const [evaluationPeriodsOpen, setEvaluationPeriodsOpen] = useState(false)
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null)

  const handleEdit = (semester: Semester) => {
    setSelectedSemester(semester)
    setFormOpen(true)
  }

  const handleCloseSemester = (semester: Semester) => {
    setSelectedSemester(semester)
    setClosureOpen(true)
  }

  const handleManagePeriods = (semester: Semester) => {
    setSelectedSemester(semester)
    setPeriodsOpen(true)
  }

  const handleManageModules = (semester: Semester) => {
    setSelectedSemester(semester)
    setModulesOpen(true)
  }

  const handleManageEvaluationPeriods = (semester: Semester) => {
    setSelectedSemester(semester)
    setEvaluationPeriodsOpen(true)
  }

  const handleFormSubmit = async (data: any) => {
    if (selectedSemester) {
      await updateSemester(selectedSemester.id, data)
    } else {
      await createSemester({ ...data, academic_year_id: academicYear.id })
    }
  }

  const handleClosureConfirm = async () => {
    if (selectedSemester) {
      await closeSemester(selectedSemester.id)
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Gestion des semestres - {academicYear.name}</Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<i className="ri-add-line" />}
              onClick={() => {
                setSelectedSemester(null)
                setFormOpen(true)
              }}
              disabled={loading}
            >
              Nouveau semestre
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : semesters.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                Aucun semestre créé
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Créez votre premier semestre pour cette année académique
              </Typography>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {semesters.map(semester => (
                <Card key={semester.id} variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="h6">{semester.name}</Typography>
                          {semester.is_closed && <Chip label="Clôturé" color="error" size="small" />}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(semester.start_date)} - {formatDate(semester.end_date)}
                        </Typography>
                      </Box>
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="Périodes d'évaluation">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleManageEvaluationPeriods(semester)}
                          >
                            <i className="ri-calendar-check-line" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Gérer les périodes">
                          <IconButton size="small" onClick={() => handleManagePeriods(semester)}>
                            <i className="ri-time-line" />
                          </IconButton>
                        </Tooltip>
                        {!semester.is_closed && (
                          <>
                            <Tooltip title="Modifier">
                              <IconButton size="small" onClick={() => handleEdit(semester)}>
                                <i className="ri-edit-line" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Clôturer">
                              <IconButton size="small" color="warning" onClick={() => handleCloseSemester(semester)}>
                                <i className="ri-lock-line" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Box display="flex" flexDirection="column" gap={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Cours:
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(semester.courses_start_date)} - {formatDate(semester.courses_end_date)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Examens:
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(semester.exams_start_date)} - {formatDate(semester.exams_end_date)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Périodes:
                        </Typography>
                        <Typography variant="body2">{semester.periods?.length || 0} période(s)</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <SemesterFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setSelectedSemester(null)
        }}
        onSubmit={handleFormSubmit}
        semester={selectedSemester}
      />

      <SemesterClosureDialog
        open={closureOpen}
        onClose={() => {
          setClosureOpen(false)
          setSelectedSemester(null)
        }}
        onConfirm={handleClosureConfirm}
        semester={selectedSemester}
      />

      {selectedSemester && (
        <AcademicPeriodsDialog
          open={periodsOpen}
          onClose={() => {
            setPeriodsOpen(false)
            setSelectedSemester(null)
          }}
          semester={selectedSemester}
        />
      )}

      <SemesterModulesDialog
        open={modulesOpen}
        onClose={() => {
          setModulesOpen(false)
          setSelectedSemester(null)
        }}
        semester={selectedSemester}
      />

      <EvaluationPeriodsDialog
        open={evaluationPeriodsOpen}
        onClose={() => {
          setEvaluationPeriodsOpen(false)
          setSelectedSemester(null)
        }}
        semester={selectedSemester}
      />
    </>
  )
}

export default SemesterManagementDialog
