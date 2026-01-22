'use client'

import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { useEvaluationPeriods } from '../hooks/useEvaluationPeriods'
import { EvaluationPeriodFormDialog } from './EvaluationPeriodFormDialog'
import type { Semester, EvaluationPeriod, EvaluationPeriodFormInput } from '../../types/academicCalendar.types'
import { getEvaluationPeriodTypeLabel, getEvaluationPeriodTypeColor } from '../../types/academicCalendar.types'

interface EvaluationPeriodsDialogProps {
  open: boolean
  onClose: () => void
  semester: Semester | null
}

export const EvaluationPeriodsDialog: React.FC<EvaluationPeriodsDialogProps> = ({ open, onClose, semester }) => {
  const [formOpen, setFormOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<EvaluationPeriod | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    evaluationPeriods,
    loading,
    error,
    createEvaluationPeriod,
    updateEvaluationPeriod,
    deleteEvaluationPeriod
  } = useEvaluationPeriods(semester?.id || null)

  const handleAdd = () => {
    setSelectedPeriod(null)
    setFormOpen(true)
  }

  const handleEdit = (period: EvaluationPeriod) => {
    setSelectedPeriod(period)
    setFormOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette période d\'évaluation ?')) {
      try {
        setIsSubmitting(true)
        await deleteEvaluationPeriod(id)
        setSuccessMessage('Période d\'évaluation supprimée avec succès')
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Erreur lors de la suppression'
        setErrorMessage(message)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleFormSubmit = async (data: Omit<EvaluationPeriodFormInput, 'semester_id'>) => {
    setIsSubmitting(true)
    try {
      if (selectedPeriod) {
        await updateEvaluationPeriod(selectedPeriod.id, data)
        setSuccessMessage('Période d\'évaluation modifiée avec succès')
      } else {
        await createEvaluationPeriod(data)
        setSuccessMessage('Période d\'évaluation créée avec succès')
      }
      setFormOpen(false)
      setSelectedPeriod(null)
    } catch (err: any) {
      // Error will be handled in the form dialog
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Périodes d'Évaluation - {semester?.name}</Typography>
            <Button variant="contained" size="small" onClick={handleAdd} disabled={!semester}>
              Ajouter
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loading && (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Erreur lors du chargement des périodes d'évaluation
            </Alert>
          )}

          {!loading && !error && evaluationPeriods && evaluationPeriods.length === 0 && (
            <Alert severity="info">Aucune période d'évaluation configurée pour ce semestre.</Alert>
          )}

          {!loading && !error && evaluationPeriods && evaluationPeriods.length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Date Début</TableCell>
                    <TableCell>Date Fin</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {evaluationPeriods.map((period: EvaluationPeriod) => (
                    <TableRow key={period.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {period.name}
                        </Typography>
                        {period.description && (
                          <Typography variant="caption" color="text.secondary">
                            {period.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getEvaluationPeriodTypeLabel(period.type)}
                          color={getEvaluationPeriodTypeColor(period.type)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(period.start_date)}</TableCell>
                      <TableCell>{formatDate(period.end_date)}</TableCell>
                      <TableCell>
                        <Chip
                          label={period.is_active ? 'Active' : 'Inactive'}
                          color={period.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleEdit(period)} color="primary">
                          <i className="ri-edit-line" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(period.id)} color="error">
                          <i className="ri-delete-bin-line" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <EvaluationPeriodFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setSelectedPeriod(null)
        }}
        onSubmit={handleFormSubmit}
        evaluationPeriod={selectedPeriod}
        isSubmitting={isSubmitting}
      />

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setErrorMessage('')} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  )
}
