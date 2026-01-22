'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid2'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Checkbox from '@mui/material/Checkbox'
import FormGroup from '@mui/material/FormGroup'
import Chip from '@mui/material/Chip'
import OutlinedInput from '@mui/material/OutlinedInput'
import Box from '@mui/material/Box'

// Translation Imports
import { useTranslation } from '@/shared/i18n'

// Service Imports
import { userService } from '../services/userService'

// Hook Imports - Use new hooks for roles and permissions
import { useRolesList, usePermissionsList } from '@/modules/UsersGuard'

// Type Imports
import type { CreateUserPayload } from '../../types/user.types'

// Tenant Imports
import { useTenant } from '@/shared/lib/tenant-context'

interface UserAddModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const UserAddModal = ({ open, onClose, onSuccess }: UserAddModalProps) => {
  const { t } = useTranslation('Users')
  const { tenantId } = useTenant()

  // Load roles and permissions from API
  const { roles, loading: loadingRoles, error: rolesError } = useRolesList()
  const { permissions, loading: loadingPermissions, error: permissionsError } = usePermissionsList()

  // Convert tenantId from string | null to string | undefined
  const tenantIdOrUndefined = tenantId || undefined

  // Loading states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState<CreateUserPayload>({
    username: '',
    password: '',
    email: '',
    firstname: '',
    lastname: '',
    application: 'frontend',
    is_active: true,
    roles: [],
    permissions: []
  })

  // Handle form field changes
  const handleFieldChange = (field: keyof CreateUserPayload, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle permission toggle
  const handlePermissionToggle = (permissionName: string) => {
    const currentPermissions = formData.permissions || []
    const isSelected = currentPermissions.includes(permissionName)

    if (isSelected) {
      handleFieldChange('permissions', currentPermissions.filter(p => p !== permissionName))
    } else {
      handleFieldChange('permissions', [...currentPermissions, permissionName])
    }
  }

  // Group permissions by category (extract category from permission name or use a default)
  const permissionsByCategory = permissions.reduce((acc, perm) => {
    // Try to extract category from permission name (e.g., "users.view" -> "Users")
    const parts = perm.name.split('.')
    const category = parts.length > 1 ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'General'
    
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(perm)
    return acc
  }, {} as Record<string, typeof permissions>)

  // Handle form submit
  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)

      // Create user
      await userService.createUser(formData, tenantIdOrUndefined)

      // Success
      onSuccess()
      handleClose()
    } catch (err: any) {
      console.error('Error creating user:', err)
      setError(err?.response?.data?.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  // Handle close
  const handleClose = () => {
    // Reset form
    setFormData({
      username: '',
      password: '',
      email: '',
      firstname: '',
      lastname: '',
      application: 'frontend',
      is_active: true,
      roles: [],
      permissions: []
    })
    setError(null)
    onClose()
  }

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.username.trim() !== '' &&
      formData.password.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.firstname.trim() !== '' &&
      formData.lastname.trim() !== ''
    )
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle className='flex items-center justify-between'>
        <div>
          <Typography variant='h5'>{t('Add New User')}</Typography>
          <Typography variant='body2' color='text.secondary'>
            {t('Fill in the information to create a new user')}
          </Typography>
        </div>
        <IconButton onClick={handleClose} size='small'>
          <i className='ri-close-line' />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <div className='space-y-4'>
          {error && (
            <Alert severity='error' onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Show loading state for roles/permissions */}
          {(loadingRoles || loadingPermissions) && (
            <Alert severity='info' icon={<CircularProgress size={20} />}>
              {t('Loading roles and permissions...')}
            </Alert>
          )}

          {/* Show errors for roles/permissions */}
          {rolesError && (
            <Alert severity='warning'>
              <strong>{t('Roles loading error')}:</strong> {rolesError.message}
              <br />
              <Typography variant='caption'>
                {t('Make sure the backend has implemented')} <code>GET /api/admin/roles</code>
              </Typography>
            </Alert>
          )}

          {permissionsError && (
            <Alert severity='warning'>
              <strong>{t('Permissions loading error')}:</strong> {permissionsError.message}
              <br />
              <Typography variant='caption'>
                {t('Make sure the backend has implemented')} <code>GET /api/admin/permissions</code>
              </Typography>
            </Alert>
          )}

          {/* Basic Information */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<i className='ri-arrow-down-s-line' />}>
              <Typography variant='h6'>{t('Basic Information')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    required
                    label={t('Username')}
                    value={formData.username}
                    onChange={e => handleFieldChange('username', e.target.value)}
                    helperText={t('Required field')}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    required
                    type='email'
                    label={t('Email')}
                    value={formData.email}
                    onChange={e => handleFieldChange('email', e.target.value)}
                    helperText={t('Required field')}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    required
                    label={t('Firstname')}
                    value={formData.firstname}
                    onChange={e => handleFieldChange('firstname', e.target.value)}
                    helperText={t('Required field')}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    required
                    label={t('Lastname')}
                    value={formData.lastname}
                    onChange={e => handleFieldChange('lastname', e.target.value)}
                    helperText={t('Required field')}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    required
                    type='password'
                    label={t('Password')}
                    value={formData.password}
                    onChange={e => handleFieldChange('password', e.target.value)}
                    helperText={t('Minimum 8 characters')}
                    slotProps={{
                      htmlInput: { minLength: 8 }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth required>
                    <InputLabel>{t('Application')}</InputLabel>
                    <Select
                      value={formData.application}
                      label={t('Application')}
                      onChange={e => handleFieldChange('application', e.target.value)}
                    >
                      <MenuItem value='admin'>Admin</MenuItem>
                      <MenuItem value='frontend'>Frontend</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_active}
                        onChange={e => handleFieldChange('is_active', e.target.checked)}
                      />
                    }
                    label={t('Active')}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Roles */}
          <Accordion>
            <AccordionSummary expandIcon={<i className='ri-arrow-down-s-line' />}>
              <Typography variant='h6'>
                {t('Roles')} ({formData.roles?.length || 0})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {loadingRoles ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : roles.length === 0 ? (
                <Alert severity='warning'>
                  {t('No roles available. Please create roles in the backend first.')}
                </Alert>
              ) : (
                <FormControl fullWidth>
                  <InputLabel>{t('Select Roles')}</InputLabel>
                  <Select
                    multiple
                    value={formData.roles || []}
                    onChange={e => handleFieldChange('roles', e.target.value)}
                    input={<OutlinedInput label={t('Select Roles')} />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size='small' />
                        ))}
                      </Box>
                    )}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.name}>
                        <div className='flex flex-col'>
                          <Typography variant='body1'>{role.display_name || role.name}</Typography>
                          {role.description && (
                            <Typography variant='caption' color='text.secondary'>
                              {role.description}
                            </Typography>
                          )}
                        </div>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Permissions */}
          <Accordion>
            <AccordionSummary expandIcon={<i className='ri-arrow-down-s-line' />}>
              <Typography variant='h6'>
                {t('Permissions')} ({formData.permissions?.length || 0})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {loadingPermissions ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : permissions.length === 0 ? (
                <Alert severity='warning'>
                  {t('No permissions available. Please create permissions in the backend first.')}
                </Alert>
              ) : (
                <div className='space-y-3'>
                  <Typography variant='body2' color='text.secondary'>
                    {t('Select additional permissions for this user')}
                  </Typography>
                  {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                    <div key={category} className='space-y-2'>
                      <Typography variant='subtitle2' className='font-semibold'>
                        {category}
                      </Typography>
                      <FormGroup className='pl-4'>
                        {categoryPermissions.map((permission) => (
                          <FormControlLabel
                            key={permission.id}
                            control={
                              <Checkbox
                                checked={formData.permissions?.includes(permission.name) || false}
                                onChange={() => handlePermissionToggle(permission.name)}
                                size='small'
                              />
                            }
                            label={permission.display_name || permission.name}
                          />
                        ))}
                      </FormGroup>
                    </div>
                  ))}
                </div>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Optional Information */}
          <Accordion>
            <AccordionSummary expandIcon={<i className='ri-arrow-down-s-line' />}>
              <Typography variant='h6'>{t('Additional Information')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>{t('Gender')}</InputLabel>
                    <Select
                      value={formData.sex || ''}
                      label={t('Gender')}
                      onChange={e => handleFieldChange('sex', e.target.value || undefined)}
                    >
                      <MenuItem value=''>
                        <em>{t('None')}</em>
                      </MenuItem>
                      <MenuItem value='M'>{t('Male')}</MenuItem>
                      <MenuItem value='F'>{t('Female')}</MenuItem>
                      <MenuItem value='Other'>{t('Other')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t('Phone')}
                    value={formData.phone || ''}
                    onChange={e => handleFieldChange('phone', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t('Mobile')}
                    value={formData.mobile || ''}
                    onChange={e => handleFieldChange('mobile', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label={t('Address')}
                    value={formData.address || ''}
                    onChange={e => handleFieldChange('address', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t('City')}
                    value={formData.city || ''}
                    onChange={e => handleFieldChange('city', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t('Country')}
                    value={formData.country || ''}
                    onChange={e => handleFieldChange('country', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t('Postal Code')}
                    value={formData.postal_code || ''}
                    onChange={e => handleFieldChange('postal_code', e.target.value)}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </div>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={handleClose} variant='outlined' color='secondary' disabled={loading}>
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          color='primary'
          disabled={loading || !isFormValid()}
          startIcon={loading ? <CircularProgress size={20} color='inherit' /> : <i className='ri-user-add-line' />}
        >
          {loading ? t('Creating...') : t('Create User')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserAddModal
