'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, number, boolean, optional, pipe, minLength, minValue } from 'valibot'
import type { InferInput } from 'valibot'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormHelperText from '@mui/material/FormHelperText'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Grid from '@mui/material/Grid'
import type { Specialization, SpecializationType, SelectionMode, AcademicLevel } from '../../types/specialization.types'

const schema = object({
  code: pipe(string(), minLength(1, 'Code is required')),
  name: pipe(string(), minLength(1, 'Name is required')),
  description: optional(string()),
  programme_id: pipe(number(), minValue(1, 'Programme is required')),
  available_from_level: string() as any,
  capacity: optional(number()),
  responsable_id: optional(number()),
  min_average_required: optional(number()),
  application_start_date: optional(string()),
  application_end_date: optional(string()),
  type: string() as any,
  selection_mode: string() as any,
  is_active: boolean()
})

type FormData = InferInput<typeof schema>

interface SpecializationFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: FormData) => Promise<void>
  specialization?: Specialization | null
  programmes: Array<{ id: number; code: string; name: string }>
  responsables?: Array<{ id: number; username: string; email: string }>
}

const SpecializationFormDialog = ({
  open,
  onClose,
  onSubmit,
  specialization,
  programmes,
  responsables = []
}: SpecializationFormDialogProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      programme_id: 0,
      available_from_level: 'L1' as AcademicLevel,
      capacity: undefined,
      responsable_id: undefined,
      min_average_required: undefined,
      application_start_date: '',
      application_end_date: '',
      type: 'Obligatoire' as SpecializationType,
      selection_mode: 'Exclusive' as SelectionMode,
      is_active: true
    }
  })

  useEffect(() => {
    if (specialization) {
      reset({
        code: specialization.code,
        name: specialization.name,
        description: specialization.description || '',
        programme_id: specialization.programme_id,
        available_from_level: specialization.available_from_level,
        capacity: specialization.capacity || undefined,
        responsable_id: specialization.responsable_id || undefined,
        min_average_required: specialization.min_average_required || undefined,
        application_start_date: specialization.application_start_date || '',
        application_end_date: specialization.application_end_date || '',
        type: specialization.type,
        selection_mode: specialization.selection_mode,
        is_active: specialization.is_active
      })
    } else {
      reset({
        code: '',
        name: '',
        description: '',
        programme_id: 0,
        available_from_level: 'L1' as AcademicLevel,
        capacity: undefined,
        responsable_id: undefined,
        min_average_required: undefined,
        application_start_date: '',
        application_end_date: '',
        type: 'Obligatoire',
        selection_mode: 'Exclusive',
        is_active: true
      })
    }
  }, [specialization, reset])

  const handleFormSubmit = async (data: FormData) => {
    try {
      await onSubmit(data)
      onClose()
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{specialization ? 'Edit Specialization' : 'Create Specialization'}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Code"
                    error={!!errors.code}
                    helperText={errors.code?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Name"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="programme_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.programme_id}>
                    <InputLabel>Programme</InputLabel>
                    <Select {...field} label="Programme" disabled={isSubmitting}>
                      <MenuItem value={0}>Select Programme</MenuItem>
                      {programmes.map(prog => (
                        <MenuItem key={prog.id} value={prog.id}>
                          {prog.code} - {prog.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.programme_id && <FormHelperText>{errors.programme_id.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="available_from_level"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.available_from_level}>
                    <InputLabel>Available From Level</InputLabel>
                    <Select {...field} label="Available From Level" disabled={isSubmitting}>
                      <MenuItem value="L1">L1 (Licence 1)</MenuItem>
                      <MenuItem value="L2">L2 (Licence 2)</MenuItem>
                      <MenuItem value="L3">L3 (Licence 3)</MenuItem>
                      <MenuItem value="M1">M1 (Master 1)</MenuItem>
                      <MenuItem value="M2">M2 (Master 2)</MenuItem>
                    </Select>
                    {errors.available_from_level && (
                      <FormHelperText>{errors.available_from_level.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="capacity"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value || ''}
                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    fullWidth
                    type="number"
                    label="Capacity (optional)"
                    error={!!errors.capacity}
                    helperText={errors.capacity?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="min_average_required"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value || ''}
                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    fullWidth
                    type="number"
                    label="Min Average Required (optional)"
                    inputProps={{ step: 0.01 }}
                    error={!!errors.min_average_required}
                    helperText={errors.min_average_required?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="responsable_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.responsable_id}>
                    <InputLabel>Responsable (optional)</InputLabel>
                    <Select
                      {...field}
                      value={field.value || ''}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      label="Responsable (optional)"
                      disabled={isSubmitting}
                    >
                      <MenuItem value="">None</MenuItem>
                      {responsables.map(resp => (
                        <MenuItem key={resp.id} value={resp.id}>
                          {resp.username} ({resp.email})
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.responsable_id && <FormHelperText>{errors.responsable_id.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="application_start_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Application Start Date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.application_start_date}
                    helperText={errors.application_start_date?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="application_end_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Application End Date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.application_end_date}
                    helperText={errors.application_end_date?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.type}>
                    <InputLabel>Type</InputLabel>
                    <Select {...field} label="Type" disabled={isSubmitting}>
                      <MenuItem value="Obligatoire">Obligatoire</MenuItem>
                      <MenuItem value="Optionnelle">Optionnelle</MenuItem>
                    </Select>
                    {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="selection_mode"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.selection_mode}>
                    <InputLabel>Selection Mode</InputLabel>
                    <Select {...field} label="Selection Mode" disabled={isSubmitting}>
                      <MenuItem value="Exclusive">Exclusive</MenuItem>
                      <MenuItem value="Multiple">Multiple</MenuItem>
                    </Select>
                    {errors.selection_mode && <FormHelperText>{errors.selection_mode.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} disabled={isSubmitting} />}
                    label="Active"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default SpecializationFormDialog
