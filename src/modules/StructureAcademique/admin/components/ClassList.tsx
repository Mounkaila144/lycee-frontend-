'use client'

import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

import { useClasses } from '../hooks/useClasses'
import { useCycles } from '../hooks/useCycles'
import { useSeries } from '../hooks/useSeries'
import { useAcademicYears } from '../hooks/useAcademicYears'
import type { Classe, ClasseFormData, ClasseQueryParams } from '../../types/classe.types'
import type { Level } from '../../types/cycle.types'

export const ClassList = () => {
  const { classes, stats, loading, error, createClasse, updateClasse, deleteClasse, updateParams } = useClasses()
  const { cycles, levels } = useCycles()
  const { series } = useSeries()
  const { academicYears } = useAcademicYears()

  const activeYear = academicYears.find(y => y.is_active)

  const [formOpen, setFormOpen] = useState(false)
  const [editingClasse, setEditingClasse] = useState<Classe | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Filter state
  const [filterCycleId, setFilterCycleId] = useState<number | ''>('')
  const [filterLevelId, setFilterLevelId] = useState<number | ''>('')
  const [filterSeriesId, setFilterSeriesId] = useState<number | ''>('')

  // Form state
  const [formData, setFormData] = useState<ClasseFormData>({
    academic_year_id: 0,
    level_id: 0,
    series_id: null,
    section: '',
    max_capacity: 50,
    head_teacher_id: null,
  })

  const filteredLevels = filterCycleId
    ? levels.filter(l => l.cycle_id === filterCycleId)
    : levels

  const handleFilter = () => {
    const params: ClasseQueryParams = {}
    if (filterCycleId) params.cycle_id = filterCycleId as number
    if (filterLevelId) params.level_id = filterLevelId as number
    if (filterSeriesId) params.series_id = filterSeriesId as number
    updateParams(params)
  }

  const handleResetFilters = () => {
    setFilterCycleId('')
    setFilterLevelId('')
    setFilterSeriesId('')
    updateParams({})
  }

  const handleOpenCreate = () => {
    setEditingClasse(null)
    setFormData({
      academic_year_id: activeYear?.id || 0,
      level_id: 0,
      series_id: null,
      section: 'A',
      max_capacity: 50,
      head_teacher_id: null,
    })
    setFormError(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (classe: Classe) => {
    setEditingClasse(classe)
    setFormData({
      academic_year_id: classe.academic_year_id,
      level_id: classe.level_id,
      series_id: classe.series_id,
      section: classe.section,
      max_capacity: classe.max_capacity,
      head_teacher_id: classe.head_teacher_id,
    })
    setFormError(null)
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      setFormError(null)
      if (editingClasse) {
        await updateClasse(editingClasse.id, formData)
      } else {
        await createClasse(formData)
      }
      setFormOpen(false)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Une erreur est survenue'
      setFormError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteClasse(id)
      setDeleteConfirm(null)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Impossible de supprimer cette classe')
      setDeleteConfirm(null)
    }
  }

  const getCycleName = (classe: Classe): string => {
    if (!classe.level) return '-'
    const cycle = cycles.find(c => c.id === classe.level?.cycle_id)
    return cycle?.name || '-'
  }

  if (loading && classes.length === 0) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1">Gestion des Classes</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Créez et gérez les classes de votre établissement
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<i className="ri-add-line" />} onClick={handleOpenCreate} disabled={!activeYear}>
          Nouvelle classe
        </Button>
      </Box>

      {/* Stats cards */}
      {stats && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="h5" color="primary">{stats.total_classes}</Typography>
                <Typography variant="body2" color="text.secondary">Classes</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="h5" color="info.main">{stats.total_capacity}</Typography>
                <Typography variant="body2" color="text.secondary">Capacité totale</Typography>
              </CardContent>
            </Card>
          </Grid>
          {Object.entries(stats.by_cycle || {}).map(([name, count]) => (
            <Grid item xs={6} sm={3} key={name}>
              <Card variant="outlined">
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="h5" color="secondary">{count}</Typography>
                  <Typography variant="body2" color="text.secondary">{name}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Filters */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Cycle</InputLabel>
          <Select value={filterCycleId} label="Cycle" onChange={e => { setFilterCycleId(e.target.value as number); setFilterLevelId(''); }}>
            <MenuItem value="">Tous</MenuItem>
            {cycles.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Niveau</InputLabel>
          <Select value={filterLevelId} label="Niveau" onChange={e => setFilterLevelId(e.target.value as number)}>
            <MenuItem value="">Tous</MenuItem>
            {filteredLevels.map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Série</InputLabel>
          <Select value={filterSeriesId} label="Série" onChange={e => setFilterSeriesId(e.target.value as number)}>
            <MenuItem value="">Toutes</MenuItem>
            {series.filter(s => s.is_active).map(s => <MenuItem key={s.id} value={s.id}>{s.name} ({s.code})</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="outlined" size="small" onClick={handleFilter}>Filtrer</Button>
        <Button variant="text" size="small" onClick={handleResetFilters}>Réinitialiser</Button>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
          {classes.length} classe(s) affichée(s)
        </Typography>
      </Box>

      {!activeYear && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Aucune année scolaire active. Veuillez activer une année scolaire avant de créer des classes.
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Cycle</TableCell>
              <TableCell>Niveau</TableCell>
              <TableCell>Série</TableCell>
              <TableCell>Section</TableCell>
              <TableCell align="center">Effectif / Capacité</TableCell>
              <TableCell>Prof. Principal</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary" py={3}>
                    Aucune classe trouvée. Créez votre première classe.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              classes.map(classe => (
                <TableRow key={classe.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{classe.name}</Typography>
                  </TableCell>
                  <TableCell>{getCycleName(classe)}</TableCell>
                  <TableCell>{classe.level?.name || '-'}</TableCell>
                  <TableCell>
                    {classe.series ? (
                      <Chip label={classe.series.code} size="small" color="primary" variant="outlined" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">—</Typography>
                    )}
                  </TableCell>
                  <TableCell>{classe.section}</TableCell>
                  <TableCell align="center">
                    <Typography
                      color={(classe.students_count || 0) >= classe.max_capacity ? 'error' : 'text.primary'}
                    >
                      {classe.students_count || 0} / {classe.max_capacity}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {classe.head_teacher ? (
                      `${classe.head_teacher.firstname} ${classe.head_teacher.lastname}`
                    ) : (
                      <Chip label="Non affecté" size="small" color="warning" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Modifier">
                      <IconButton size="small" onClick={() => handleOpenEdit(classe)}>
                        <i className="ri-edit-line" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton size="small" color="error" onClick={() => setDeleteConfirm(classe.id)}>
                        <i className="ri-delete-bin-line" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onClose={() => !submitting && setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingClasse ? 'Modifier la classe' : 'Nouvelle classe'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          {activeYear && !editingClasse && (
            <Alert severity="info" sx={{ mb: 2 }}>
              La classe sera créée pour l'année scolaire <strong>{activeYear.name}</strong>
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Niveau</InputLabel>
                <Select
                  value={formData.level_id || ''}
                  label="Niveau"
                  onChange={e => setFormData(prev => ({ ...prev, level_id: e.target.value as number, series_id: null }))}
                >
                  {levels.map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Série</InputLabel>
                <Select
                  value={formData.series_id || ''}
                  label="Série"
                  onChange={e => setFormData(prev => ({ ...prev, series_id: e.target.value as number || null }))}
                >
                  <MenuItem value="">Aucune (tronc commun)</MenuItem>
                  {series.filter(s => s.is_active).map(s => <MenuItem key={s.id} value={s.id}>{s.name} ({s.code})</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Section"
                value={formData.section}
                onChange={e => setFormData(prev => ({ ...prev, section: e.target.value.toUpperCase() }))}
                placeholder="A, B, C..."
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Capacité maximale"
                value={formData.max_capacity}
                onChange={e => setFormData(prev => ({ ...prev, max_capacity: parseInt(e.target.value) || 0 }))}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)} disabled={submitting}>Annuler</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting || !formData.level_id || !formData.section}>
            {submitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Supprimer la classe</DialogTitle>
        <DialogContent>
          <Typography>Êtes-vous sûr de vouloir supprimer cette classe ? Cette action est irréversible.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Annuler</Button>
          <Button variant="contained" color="error" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ClassList
