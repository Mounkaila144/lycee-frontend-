'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// Hook Imports
import { useProgrammeImportExport } from '../hooks/useProgrammeImportExport'

// Type Imports
import type { ProgrammeType, ProgrammeStatus, ExportParams } from '../../types/programme.types'

interface ProgrammeExportDialogProps {
  open: boolean
  onClose: () => void
}

export const ProgrammeExportDialog = ({ open, onClose }: ProgrammeExportDialogProps) => {
  const { isExporting, error, exportProgrammes } = useProgrammeImportExport()

  const [format, setFormat] = useState<'excel' | 'csv'>('excel')
  const [filterType, setFilterType] = useState<ProgrammeType | ''>('')
  const [filterStatus, setFilterStatus] = useState<ProgrammeStatus | ''>('')

  const handleExport = async () => {
    const params: ExportParams = {
      format,
      ...(filterType && { type: filterType }),
      ...(filterStatus && { statut: filterStatus }),
    }

    await exportProgrammes(params)
    
    // Close dialog after successful export
    if (!error) {
      setTimeout(() => {
        onClose()
      }, 500)
    }
  }

  const handleClose = () => {
    setFormat('excel')
    setFilterType('')
    setFilterStatus('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5">Exporter les Programmes</Typography>
          <IconButton onClick={handleClose} size="small">
            <i className="ri-close-line" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Format Selection */}
          <FormControl>
            <FormLabel>Format d'export</FormLabel>
            <RadioGroup
              value={format}
              onChange={(e) => setFormat(e.target.value as 'excel' | 'csv')}
            >
              <FormControlLabel
                value="excel"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">Excel (.xlsx)</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Recommandé - Avec mise en forme et filtres
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="csv"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">CSV (.csv)</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Compatibilité maximale - Format texte simple
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          {/* Type Filter */}
          <FormControl fullWidth>
            <FormLabel>Filtrer par type (optionnel)</FormLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ProgrammeType | '')}
              displayEmpty
            >
              <MenuItem value="">Tous les types</MenuItem>
              <MenuItem value="Licence">Licence</MenuItem>
              <MenuItem value="Master">Master</MenuItem>
              <MenuItem value="Doctorat">Doctorat</MenuItem>
            </Select>
          </FormControl>

          {/* Status Filter */}
          <FormControl fullWidth>
            <FormLabel>Filtrer par statut (optionnel)</FormLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ProgrammeStatus | '')}
              displayEmpty
            >
              <MenuItem value="">Tous les statuts</MenuItem>
              <MenuItem value="Brouillon">Brouillon</MenuItem>
              <MenuItem value="Actif">Actif</MenuItem>
              <MenuItem value="Inactif">Inactif</MenuItem>
              <MenuItem value="Archivé">Archivé</MenuItem>
            </Select>
          </FormControl>

          {/* Info Alert */}
          <Alert severity="info">
            Le fichier exporté contiendra: code, libellé, type, durée, responsable, statut et date de création.
          </Alert>

          {/* Error Display */}
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isExporting}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={isExporting}
          startIcon={isExporting ? <CircularProgress size={20} /> : <i className="ri-download-line" />}
        >
          {isExporting ? 'Export en cours...' : 'Exporter'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProgrammeExportDialog
