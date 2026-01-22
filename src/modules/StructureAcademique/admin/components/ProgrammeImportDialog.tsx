'use client'

// React Imports
import { useState, useRef } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'

// Hook Imports
import { useProgrammeImportExport } from '../hooks/useProgrammeImportExport'

interface ProgrammeImportDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export const ProgrammeImportDialog = ({ open, onClose, onSuccess }: ProgrammeImportDialogProps) => {
  const {
    previewData,
    isUploading,
    isImporting,
    isDownloadingTemplate,
    error,
    uploadForPreview,
    confirmImport,
    downloadTemplate,
    clearPreview,
  } = useProgrammeImportExport()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ]
    if (!validTypes.includes(file.type)) {
      alert('Format de fichier invalide. Utilisez Excel (.xlsx) ou CSV (.csv)')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Fichier trop volumineux. Taille maximale: 5MB')
      return
    }

    setSelectedFile(file)
    await uploadForPreview(file)
  }

  const handleConfirmImport = async () => {
    const result = await confirmImport()
    if (result) {
      setImportResult(result)
      if (result.success && result.created_count > 0) {
        setTimeout(() => {
          handleClose()
          onSuccess()
        }, 3000)
      }
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    clearPreview()
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  const handleDownloadTemplate = async () => {
    await downloadTemplate()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5">Importer des Programmes</Typography>
          <IconButton onClick={handleClose} size="small">
            <i className="ri-close-line" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Template Download Section */}
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Téléchargez le template Excel pour voir le format attendu et les exemples de données.
          </Alert>
          <Button
            variant="outlined"
            startIcon={<i className="ri-download-line" />}
            onClick={handleDownloadTemplate}
            disabled={isDownloadingTemplate}
          >
            {isDownloadingTemplate ? 'Téléchargement...' : 'Télécharger le Template'}
          </Button>
        </Box>

        {/* File Upload Section */}
        {!previewData && !importResult && (
          <Box>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="import-file-input"
            />
            <label htmlFor="import-file-input">
              <Paper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  border: '2px dashed',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <i className="ri-upload-cloud-line" style={{ fontSize: 48, color: 'var(--mui-palette-text-secondary)' }} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Cliquez pour sélectionner un fichier
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Formats acceptés: Excel (.xlsx) ou CSV (.csv) - Max 5MB
                </Typography>
              </Paper>
            </label>

            {isUploading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        )}

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Preview Section */}
        {previewData && !importResult && (
          <Box>
            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Chip
                label={`Total: ${previewData.total_rows || 0} lignes`}
                color="default"
              />
              <Chip
                label={`Valides: ${previewData.valid_rows || 0}`}
                color="success"
              />
              <Chip
                label={`Invalides: ${previewData.invalid_rows || 0}`}
                color="error"
              />
            </Box>

            {previewData.total_rows === 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Le backend n'a détecté aucune ligne de données. Vérifiez que:
                <ul style={{ marginTop: 8, marginBottom: 0 }}>
                  <li>Le fichier contient des données (pas seulement les en-têtes)</li>
                  <li>Les données commencent à la ligne 2 (après les en-têtes)</li>
                  <li>Le backend Laravel Excel est correctement configuré</li>
                  <li>Les colonnes correspondent au format attendu</li>
                </ul>
              </Alert>
            )}

            {!previewData.can_import && previewData.total_rows > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Impossible d'importer: corrigez les erreurs ci-dessous
              </Alert>
            )}

            {previewData.rows && previewData.rows.length > 0 ? (
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Ligne</TableCell>
                      <TableCell>Code</TableCell>
                      <TableCell>Libellé</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Durée</TableCell>
                      <TableCell>Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewData.rows?.map((row) => (
                    <TableRow
                      key={row.row_number}
                      sx={{
                        bgcolor: row.is_valid ? 'transparent' : 'error.lighter',
                      }}
                    >
                      <TableCell>{row.row_number}</TableCell>
                      <TableCell>{row.data.code}</TableCell>
                      <TableCell>{row.data.libelle}</TableCell>
                      <TableCell>{row.data.type}</TableCell>
                      <TableCell>{row.data.duree_annees}</TableCell>
                      <TableCell>
                        {row.is_valid ? (
                          <Chip label="Valide" color="success" size="small" />
                        ) : (
                          <Box>
                            <Chip label="Erreur" color="error" size="small" />
                            {row.errors?.map((err, idx) => (
                              <Typography key={idx} variant="caption" color="error" display="block">
                                {err}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            ) : (
              <Alert severity="info">
                Aucune donnée à prévisualiser. Le fichier est peut-être vide.
              </Alert>
            )}
          </Box>
        )}

        {/* Import Result Section */}
        {importResult && (
          <Box>
            <Alert severity={importResult.success ? 'success' : 'error'} sx={{ mb: 2 }}>
              {importResult.message || 'Import terminé'}
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Chip
                label={`Créés: ${importResult.created_count || 0}`}
                color="success"
              />
              <Chip
                label={`Échecs: ${importResult.failed_count || 0}`}
                color="error"
              />
            </Box>

            {importResult.errors && importResult.errors.length > 0 && (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Ligne</TableCell>
                      <TableCell>Erreur</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {importResult.errors?.map((err: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{err.row}</TableCell>
                        <TableCell>{err.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isImporting}>
          {importResult ? 'Fermer' : 'Annuler'}
        </Button>
        {previewData && !importResult && (
          <Button
            variant="contained"
            onClick={handleConfirmImport}
            disabled={!previewData.can_import || isImporting}
            startIcon={isImporting ? <CircularProgress size={20} /> : <i className="ri-check-line" />}
          >
            {isImporting ? 'Import en cours...' : `Importer ${previewData.valid_rows} programmes`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ProgrammeImportDialog
