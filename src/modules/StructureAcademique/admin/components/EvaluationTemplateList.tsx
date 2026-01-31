'use client'

import { useState } from 'react'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Typography,
  Alert,
  CircularProgress,
  Switch,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material'
import { useTranslation } from '@/shared/i18n/use-translation'
import { useEvaluationTemplates } from '../hooks/useEvaluationConfig'
import type { EvaluationTemplate } from '../../types/evaluationConfig.types'

interface EvaluationTemplateListProps {
  onEdit: (template: EvaluationTemplate) => void
}

const EvaluationTemplateList = ({ onEdit }: EvaluationTemplateListProps) => {
  const { t } = useTranslation('StructureAcademique')
  const { templates, loading, error, deleteTemplate, toggleActive, refetch } = useEvaluationTemplates(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<EvaluationTemplate | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const handleDeleteClick = (template: EvaluationTemplate) => {
    setTemplateToDelete(template)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return

    try {
      setActionLoading(templateToDelete.id)
      await deleteTemplate(templateToDelete.id)
      setDeleteDialogOpen(false)
      setTemplateToDelete(null)
      await refetch()
    } catch (err) {
      console.error('Error deleting template:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setTemplateToDelete(null)
  }

  const handleToggleActive = async (template: EvaluationTemplate) => {
    try {
      setActionLoading(template.id)
      await toggleActive(template.id)
      await refetch()
    } catch (err) {
      console.error('Error toggling template:', err)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {t('Erreur lors du chargement des templates')} : {error}
      </Alert>
    )
  }

  if (templates.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {t('Aucun template d\'évaluation')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('Créez votre premier template pour configurer rapidement vos modules')}
        </Typography>
      </Box>
    )
  }

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>{t('Nom')}</strong></TableCell>
              <TableCell><strong>{t('Description')}</strong></TableCell>
              <TableCell align="center"><strong>{t('Évaluations')}</strong></TableCell>
              <TableCell align="center"><strong>{t('Total Coef.')}</strong></TableCell>
              <TableCell align="center"><strong>{t('Actif')}</strong></TableCell>
              <TableCell align="right"><strong>{t('Actions')}</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id} hover>
                <TableCell>
                  <Typography variant="body1" fontWeight="medium">
                    {template.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {template.description}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={template.evaluations_count || template.config_json.evaluations.length}
                    color="primary"
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={`${template.total_coefficient || template.config_json.evaluations.reduce((sum, e) => sum + e.coefficient, 0)}%`}
                    color={
                      (template.total_coefficient || template.config_json.evaluations.reduce((sum, e) => sum + e.coefficient, 0)) === 100
                        ? 'success'
                        : 'warning'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title={template.is_active ? 'Désactiver' : 'Activer'}>
                    <Switch
                      checked={template.is_active}
                      onChange={() => handleToggleActive(template)}
                      disabled={actionLoading === template.id}
                      color="success"
                    />
                  </Tooltip>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                    <Tooltip title="Modifier">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(template)}
                        color="primary"
                        disabled={actionLoading === template.id}
                      >
                        <i className='ri-edit-line' />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(template)}
                        color="error"
                        disabled={actionLoading === template.id}
                      >
                        <i className='ri-delete-bin-line' />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer le template "{templateToDelete?.name}" ?
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Annuler</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={actionLoading !== null}
            startIcon={actionLoading !== null ? <CircularProgress size={16} /> : undefined}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default EvaluationTemplateList
