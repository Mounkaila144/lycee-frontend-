'use client'

import { useState, useMemo } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { useSemesterModules } from '../hooks/useModuleSemester'
import { useModules } from '../hooks/useModules'
import type { Semester } from '../../types/academicCalendar.types'
import type { Module } from '../../types/module.types'
import { getModuleLevelLabel, getModuleSemesterLabel, getModuleTypeLabel } from '../../types/module.types'

interface SemesterModulesDialogProps {
  open: boolean
  onClose: () => void
  semester: Semester | null
}

const SemesterModulesDialog = ({ open, onClose, semester }: SemesterModulesDialogProps) => {
  const { modules: semesterModules, loading, error, attachModules, detachModule } = useSemesterModules(
    semester?.id || null
  )
  const { modules: allModules, loading: loadingAllModules } = useModules()

  const [selectedModules, setSelectedModules] = useState<Module[]>([])
  const [isAttaching, setIsAttaching] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // Filter out modules already attached to this semester
  const availableModules = useMemo(() => {
    const attachedIds = new Set(semesterModules.map(m => m.id))
    return allModules.filter(m => !attachedIds.has(m.id))
  }, [allModules, semesterModules])

  const handleAttachModules = async () => {
    if (selectedModules.length === 0) return

    try {
      setIsAttaching(true)
      setActionError(null)
      const modulesData = selectedModules.map(m => ({
        id: m.id,
        program_id: undefined // Can be added later if needed
      }))
      await attachModules(modulesData)
      setSelectedModules([])
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to attach modules')
    } finally {
      setIsAttaching(false)
    }
  }

  const handleDetachModule = async (moduleId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir détacher ce module du semestre ?')) return

    try {
      setActionError(null)
      await detachModule(moduleId)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to detach module')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            Modules du Semestre {semester?.name}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <i className="ri-close-line" />
          </IconButton>
        </Box>
        {semester && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Année académique: {semester.academic_year?.name} | Période: {new Date(semester.start_date).toLocaleDateString()} - {new Date(semester.end_date).toLocaleDateString()}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {/* Error Display */}
        {(error || actionError) && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
            {error || actionError}
          </Alert>
        )}

        {/* Add Modules Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Rattacher des modules
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Autocomplete
              multiple
              fullWidth
              options={availableModules}
              getOptionLabel={(option) => `${option.code} - ${option.name}`}
              value={selectedModules}
              onChange={(_, newValue) => setSelectedModules(newValue)}
              loading={loadingAllModules}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Sélectionner des modules"
                  placeholder="Rechercher par code ou nom..."
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Box>
                    <Typography variant="body2">
                      <strong>{option.code}</strong> - {option.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getModuleLevelLabel(option.level)} | {getModuleSemesterLabel(option.semester)} | {getModuleTypeLabel(option.type)}
                    </Typography>
                  </Box>
                </li>
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    label={option.code}
                    size="small"
                  />
                ))
              }
            />
            <Button
              variant="contained"
              onClick={handleAttachModules}
              disabled={selectedModules.length === 0 || isAttaching}
              sx={{ minWidth: 120 }}
            >
              {isAttaching ? <CircularProgress size={20} /> : 'Rattacher'}
            </Button>
          </Box>
        </Box>

        {/* Attached Modules List */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Modules rattachés ({semesterModules.length})
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : semesterModules.length === 0 ? (
            <Alert severity="info">Aucun module rattaché à ce semestre</Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Nom</TableCell>
                    <TableCell>Niveau</TableCell>
                    <TableCell>Semestre</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Crédits</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {semesterModules.map((module) => (
                    <TableRow key={module.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {module.code}
                        </Typography>
                      </TableCell>
                      <TableCell>{module.name}</TableCell>
                      <TableCell>
                        <Chip label={getModuleLevelLabel(module.level)} size="small" color="primary" />
                      </TableCell>
                      <TableCell>
                        <Chip label={getModuleSemesterLabel(module.semester)} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip label={getModuleTypeLabel(module.type)} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{module.credits_ects}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Détacher du semestre">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDetachModule(module.id)}
                          >
                            <i className="ri-link-unlink" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  )
}

export default SemesterModulesDialog
