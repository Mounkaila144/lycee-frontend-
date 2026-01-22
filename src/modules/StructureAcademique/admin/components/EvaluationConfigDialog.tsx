'use client'

import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import { useEvaluationConfig } from '../hooks/useEvaluationConfig'
import EvaluationConfigForm from './EvaluationConfigForm'
import TemplateSelector from './TemplateSelector'
import ConfigValidator from './ConfigValidator'
import type { EvaluationConfig, EvaluationConfigFormInput } from '../../types/evaluationConfig.types'

interface EvaluationConfigDialogProps {
  open: boolean
  onClose: () => void
  moduleId: number
  moduleName: string
  semesterId: number
  semesterName: string
}

const EvaluationConfigDialog = ({
  open,
  onClose,
  moduleId,
  moduleName,
  semesterId,
  semesterName
}: EvaluationConfigDialogProps) => {
  const {
    configurations,
    loading,
    error,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    applyTemplate,
    validateConfiguration,
    publishConfiguration
  } = useEvaluationConfig(moduleId, semesterId)

  const [editingConfig, setEditingConfig] = useState<EvaluationConfig | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [validationResult, setValidationResult] = useState<any>(null)
  const [publishing, setPublishing] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const isPublished = configurations.some(c => c.status === 'Published')
  const totalCoefficient = configurations.reduce((sum, c) => sum + c.coefficient, 0)

  useEffect(() => {
    if (open && configurations.length > 0) {
      handleValidate()
    }
  }, [open, configurations])

  const handleValidate = async () => {
    try {
      const result = await validateConfiguration()
      setValidationResult(result)
    } catch (err) {
      console.error('Validation error:', err)
    }
  }

  const handlePublish = async () => {
    try {
      setPublishing(true)
      const result = await publishConfiguration()
      setSuccessMessage(result.message)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Publish error:', err)
    } finally {
      setPublishing(false)
    }
  }

  const handleApplyTemplate = async (templateId: number) => {
    try {
      await applyTemplate(templateId)
      setShowTemplateSelector(false)
      setSuccessMessage('Template appliqué avec succès')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Apply template error:', err)
    }
  }

  const handleSaveConfig = async (data: EvaluationConfigFormInput) => {
    try {
      if (editingConfig) {
        await updateConfiguration(editingConfig.id, data)
      } else {
        await createConfiguration(data)
      }
      setShowForm(false)
      setEditingConfig(null)
      setSuccessMessage(editingConfig ? 'Configuration mise à jour' : 'Configuration créée')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      throw err
    }
  }

  const handleDeleteConfig = async (configId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette évaluation ?')) return

    try {
      await deleteConfiguration(configId)
      setSuccessMessage('Configuration supprimée')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const handleEdit = (config: EvaluationConfig) => {
    setEditingConfig(config)
    setShowForm(true)
  }

  const handleAddNew = () => {
    setEditingConfig(null)
    setShowForm(true)
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      CC: 'primary',
      TP: 'secondary',
      Projet: 'info',
      Examen: 'error',
      Rattrapage: 'warning'
    }
    return colors[type] || 'default'
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">Configuration des Évaluations</Typography>
            <Typography variant="body2" color="text.secondary">
              {moduleName} - {semesterName}
            </Typography>
          </Box>
          {isPublished && (
            <Chip label="Publié" color="success" size="small" icon={<i className="ri-lock-line" />} />
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Template Selector */}
            {!isPublished && configurations.length === 0 && !showForm && (
              <Box sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<i className="ri-file-copy-line" />}
                  onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                  fullWidth
                >
                  {showTemplateSelector ? 'Masquer les templates' : 'Appliquer un template'}
                </Button>
                {showTemplateSelector && (
                  <Box sx={{ mt: 2 }}>
                    <TemplateSelector onSelect={handleApplyTemplate} />
                  </Box>
                )}
              </Box>
            )}

            {/* Validation Results */}
            {validationResult && configurations.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <ConfigValidator result={validationResult} totalCoefficient={totalCoefficient} />
              </Box>
            )}

            {/* Configuration Form */}
            {showForm && (
              <Box sx={{ mb: 3 }}>
                <EvaluationConfigForm
                  initialData={editingConfig || undefined}
                  onSubmit={handleSaveConfig}
                  onCancel={() => {
                    setShowForm(false)
                    setEditingConfig(null)
                  }}
                  disabled={isPublished}
                />
              </Box>
            )}

            {/* Configurations List */}
            {!showForm && configurations.length > 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Évaluations configurées ({configurations.length})
                  </Typography>
                  <Typography variant="body2" color={totalCoefficient === 100 ? 'success.main' : 'warning.main'}>
                    Total: {totalCoefficient}%
                  </Typography>
                </Box>

                {configurations
                  .sort((a, b) => a.order - b.order)
                  .map((config, index) => (
                    <Box
                      key={config.id}
                      sx={{
                        p: 2,
                        mb: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="body1" fontWeight="medium">
                              {config.name}
                            </Typography>
                            <Chip label={config.type} color={getTypeColor(config.type)} size="small" />
                            {config.is_eliminatory && (
                              <Chip label="Éliminatoire" color="error" size="small" variant="outlined" />
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Typography variant="body2" color="text.secondary">
                              Coefficient: <strong>{config.coefficient}%</strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Note max: <strong>{config.max_score}</strong>
                            </Typography>
                            {config.planned_date && (
                              <Typography variant="body2" color="text.secondary">
                                Date: <strong>{new Date(config.planned_date).toLocaleDateString('fr-FR')}</strong>
                              </Typography>
                            )}
                            {config.is_eliminatory && config.elimination_threshold && (
                              <Typography variant="body2" color="error.main">
                                Seuil: <strong>{config.elimination_threshold}/20</strong>
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        {!isPublished && (
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton size="small" onClick={() => handleEdit(config)} color="primary">
                              <i className="ri-edit-line" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteConfig(config.id)} color="error">
                              <i className="ri-delete-bin-line" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  ))}
              </Box>
            )}

            {/* Empty State */}
            {!showForm && configurations.length === 0 && !showTemplateSelector && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Aucune évaluation configurée
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Commencez par appliquer un template ou créer une évaluation
                </Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
        {!isPublished && !showForm && configurations.length > 0 && (
          <Button variant="outlined" startIcon={<i className="ri-add-line" />} onClick={handleAddNew}>
            Ajouter
          </Button>
        )}
        {!isPublished && configurations.length > 0 && validationResult?.valid && (
          <Button
            variant="contained"
            color="success"
            startIcon={publishing ? <CircularProgress size={16} /> : <i className="ri-check-line" />}
            onClick={handlePublish}
            disabled={publishing}
          >
            Publier
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default EvaluationConfigDialog
