'use client'

import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from '@/shared/i18n/use-translation'
import type { Specialization } from '../../types/specialization.types'

interface SpecializationListTableProps {
  specializations: Specialization[]
  onEdit: (specialization: Specialization) => void
  onDelete: (specialization: Specialization) => void
  onViewCandidates: (specialization: Specialization) => void
  onManageModules: (specialization: Specialization) => void
}

const SpecializationListTable = ({
  specializations,
  onEdit,
  onDelete,
  onViewCandidates,
  onManageModules
}: SpecializationListTableProps) => {
  const { t } = useTranslation('StructureAcademique')

  if (specializations.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          {t('Aucune spécialisation trouvée')}
        </Typography>
      </Paper>
    )
  }

  const getTypeColor = (type: string) => {
    return type === 'Obligatoire' ? 'error' : 'info'
  }

  const getModeColor = (mode: string) => {
    return mode === 'Exclusive' ? 'warning' : 'success'
  }

  const getAvailablePlaces = (spec: Specialization) => {
    if (!spec.capacity) return t('Illimité')
    const accepted = spec.accepted_count || 0
    const available = spec.capacity - accepted
    return `${available}/${spec.capacity}`
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('Code')}</TableCell>
            <TableCell>{t('Nom')}</TableCell>
            <TableCell>{t('Filière')}</TableCell>
            <TableCell>{t('Niveau')}</TableCell>
            <TableCell>{t('Type')}</TableCell>
            <TableCell>{t('Mode')}</TableCell>
            <TableCell>{t('Places')}</TableCell>
            <TableCell>{t('Candidats')}</TableCell>
            <TableCell>{t('Statut')}</TableCell>
            <TableCell align="right">{t('Actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {specializations.map(spec => (
            <TableRow key={spec.id} hover>
              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  {spec.code}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{spec.name}</Typography>
                {spec.description && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {spec.description.substring(0, 50)}
                    {spec.description.length > 50 ? '...' : ''}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                {spec.programme ? (
                  <Typography variant="body2">
                    {spec.programme.code} - {spec.programme.name}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    N/A
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Chip label={spec.available_from_level} size="small" />
              </TableCell>
              <TableCell>
                <Chip label={spec.type} size="small" color={getTypeColor(spec.type)} />
              </TableCell>
              <TableCell>
                <Chip label={spec.selection_mode} size="small" color={getModeColor(spec.selection_mode)} />
              </TableCell>
              <TableCell>
                <Typography variant="body2">{getAvailablePlaces(spec)}</Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">{spec.candidates_count || 0}</Typography>
                  {(spec.candidates_count || 0) > 0 && (
                    <Tooltip title={t('Voir les candidats')}>
                      <IconButton size="small" onClick={() => onViewCandidates(spec)}>
                        <i className="ri-eye-line" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={spec.is_active ? t('Actif') : t('Inactif')}
                  size="small"
                  color={spec.is_active ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                  <Tooltip title={t('Gérer les modules')}>
                    <IconButton size="small" color="primary" onClick={() => onManageModules(spec)}>
                      <i className="ri-book-line" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('Modifier')}>
                    <IconButton size="small" onClick={() => onEdit(spec)}>
                      <i className="ri-edit-line" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('Supprimer')}>
                    <IconButton size="small" color="error" onClick={() => onDelete(spec)}>
                      <i className="ri-delete-bin-line" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default SpecializationListTable
