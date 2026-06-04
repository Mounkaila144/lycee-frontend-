'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import OutlinedInput from '@mui/material/OutlinedInput'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'

import { createApiClient } from '@/shared/lib/api-client'

import type { User } from '../../types/user.types'

interface Option {
  id: number
  name: string
  code?: string
}

interface Assignment {
  id: number
  class_id: number
  subject_id: number
  classe?: { id: number; name: string }
  subject?: { id: number; code?: string; name: string }
}

interface Props {
  open: boolean
  onClose: () => void
  teacher: User | null
}

const api = () => createApiClient()

function toArray<T>(resp: unknown): T[] {
  if (Array.isArray(resp)) return resp as T[]
  const r = resp as { data?: unknown }
  if (r && Array.isArray(r.data)) return r.data as T[]
  const nested = (r?.data as { data?: unknown })?.data
  if (Array.isArray(nested)) return nested as T[]
  return []
}

export const TeacherAssignmentsDialog: React.FC<Props> = ({ open, onClose, teacher }) => {
  const [classes, setClasses] = useState<Option[]>([])
  const [subjects, setSubjects] = useState<Option[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [classId, setClassId] = useState('')
  const [subjectIds, setSubjectIds] = useState<number[]>([])

  const loadAssignments = useCallback(async () => {
    if (!teacher) return
    const resp = (await api().get('/admin/teacher-assignments', { params: { teacher_id: teacher.id } })).data
    setAssignments(toArray<Assignment>(resp))
  }, [teacher])

  useEffect(() => {
    if (!open || !teacher) return
    setError(null)
    setClassId('')
    setSubjectIds([])
    setLoading(true)
    Promise.all([
      api().get('/admin/classes').then(r => setClasses(toArray<Option>(r.data))),
      api().get('/admin/subjects').then(r => setSubjects(toArray<Option>(r.data))),
      loadAssignments()
    ])
      .catch(() => setError('Échec du chargement des données.'))
      .finally(() => setLoading(false))
  }, [open, teacher, loadAssignments])

  const grouped = useMemo(() => {
    const map = new Map<number, { name: string; items: Assignment[] }>()
    assignments.forEach(a => {
      const name = a.classe?.name ?? `Classe #${a.class_id}`
      if (!map.has(a.class_id)) map.set(a.class_id, { name, items: [] })
      map.get(a.class_id)!.items.push(a)
    })
    return Array.from(map.values())
  }, [assignments])

  const handleAdd = async () => {
    if (!teacher || !classId || subjectIds.length === 0) return
    setSaving(true)
    setError(null)
    try {
      await api().post('/admin/teacher-assignments', {
        teacher_id: teacher.id,
        class_id: Number(classId),
        subject_ids: subjectIds
      })
      setClassId('')
      setSubjectIds([])
      await loadAssignments()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Échec de l'enregistrement.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    setError(null)
    try {
      await api().delete(`/admin/teacher-assignments/${id}`)
      await loadAssignments()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Échec de la suppression.')
    }
  }

  const subjectLabel = (s: Option) => (s.code ? `${s.code} — ${s.name}` : s.name)

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        Matières enseignées
        {teacher && (
          <Typography variant='body2' color='text.secondary'>
            {teacher.full_name || teacher.username}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box display='flex' justifyContent='center' p={3}><CircularProgress /></Box>
        ) : (
          <>
            {/* Add form */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              <TextField
                select
                size='small'
                label='Classe'
                value={classId}
                onChange={e => setClassId(String(e.target.value))}
                fullWidth
              >
                {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </TextField>

              <FormControl size='small' fullWidth disabled={!classId}>
                <InputLabel id='subjects-label'>Matières</InputLabel>
                <Select
                  labelId='subjects-label'
                  multiple
                  value={subjectIds}
                  onChange={e => setSubjectIds(typeof e.target.value === 'string' ? [] : (e.target.value as number[]))}
                  input={<OutlinedInput label='Matières' />}
                  renderValue={selected => {
                    const labels = subjects.filter(s => (selected as number[]).includes(s.id)).map(s => s.code ?? s.name)
                    return labels.join(', ')
                  }}
                >
                  {subjects.map(s => (
                    <MenuItem key={s.id} value={s.id}>
                      <Checkbox checked={subjectIds.includes(s.id)} />
                      <ListItemText primary={subjectLabel(s)} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant='contained'
                  size='small'
                  disabled={!classId || subjectIds.length === 0 || saving}
                  onClick={handleAdd}
                >
                  {saving ? 'Ajout…' : 'Affecter'}
                </Button>
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Existing assignments */}
            {grouped.length === 0 ? (
              <Alert severity='info'>Aucune affectation. Sélectionnez une classe et des matières.</Alert>
            ) : (
              grouped.map(group => (
                <Box key={group.name} sx={{ mb: 2 }}>
                  <Typography variant='subtitle2' sx={{ mb: 1 }}>{group.name}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {group.items.map(a => (
                      <Chip
                        key={a.id}
                        label={a.subject?.code ? `${a.subject.code} — ${a.subject.name}` : a.subject?.name ?? `Matière #${a.subject_id}`}
                        onDelete={() => handleDelete(a.id)}
                        color='primary'
                        variant='tonal'
                        size='small'
                      />
                    ))}
                  </Box>
                </Box>
              ))
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  )
}

export default TeacherAssignmentsDialog
