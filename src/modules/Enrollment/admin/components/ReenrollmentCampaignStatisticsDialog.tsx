'use client';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';

import { useCampaignStatistics } from '../hooks/useReenrollmentCampaigns';

import type { ReenrollmentCampaign } from '../../types/reenrollment.types';

interface ReenrollmentCampaignStatisticsDialogProps {
  open: boolean;
  onClose: () => void;
  campaign: ReenrollmentCampaign | null;
}

/**
 * Stat Card Component
 */
const StatCard = ({
  title,
  value,
  color = 'primary',
}: {
  title: string;
  value: number | string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}) => (
  <Card variant="outlined">
    <CardContent sx={{ textAlign: 'center', py: 2 }}>
      <Typography variant="h4" color={`${color}.main`}>
        {value}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {title}
      </Typography>
    </CardContent>
  </Card>
);

/**
 * ReenrollmentCampaignStatisticsDialog Component
 * Dialog for displaying campaign statistics
 */
export const ReenrollmentCampaignStatisticsDialog = ({
  open,
  onClose,
  campaign,
}: ReenrollmentCampaignStatisticsDialogProps) => {
  const { statistics, loading } = useCampaignStatistics(open && campaign ? campaign.id : null);

  if (!campaign) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Statistiques - {campaign.name}
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : statistics ? (
          <Box>
            {/* Overview Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6, md: 3 }}>
                <StatCard title="Total" value={statistics.total} color="primary" />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <StatCard title="Brouillons" value={statistics.by_status.draft} color="info" />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <StatCard title="Soumises" value={statistics.by_status.submitted} color="warning" />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <StatCard title="Validées" value={statistics.by_status.validated} color="success" />
              </Grid>
            </Grid>

            {/* Validation Rate */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Taux de validation
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={statistics.validation_rate}
                  sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                  color={statistics.validation_rate > 50 ? 'success' : 'warning'}
                />
                <Typography variant="body2" fontWeight={500}>
                  {statistics.validation_rate}%
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* By Eligibility */}
            <Typography variant="subtitle1" gutterBottom>
              Par éligibilité
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip label={statistics.by_eligibility.eligible} color="success" sx={{ mb: 1 }} />
                  <Typography variant="caption" display="block">
                    Éligibles
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip label={statistics.by_eligibility.not_eligible} color="error" sx={{ mb: 1 }} />
                  <Typography variant="caption" display="block">
                    Non éligibles
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip label={statistics.by_eligibility.pending} color="default" sx={{ mb: 1 }} />
                  <Typography variant="caption" display="block">
                    En attente
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Special Cases */}
            <Typography variant="subtitle1" gutterBottom>
              Cas particuliers
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip label={statistics.special_cases.redoing} color="warning" sx={{ mb: 1 }} />
                  <Typography variant="caption" display="block">
                    Redoublements
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip label={statistics.special_cases.reorientation} color="info" sx={{ mb: 1 }} />
                  <Typography variant="caption" display="block">
                    Réorientations
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* By Target Level */}
            {Object.keys(statistics.by_target_level).length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Par niveau cible
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(statistics.by_target_level).map(([level, count]) => (
                    <Chip key={level} label={`${level}: ${count}`} variant="outlined" />
                  ))}
                </Box>
              </>
            )}

            {/* Rejected */}
            {statistics.by_status.rejected > 0 && (
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={`${statistics.by_status.rejected} rejetée(s)`}
                  color="error"
                  variant="outlined"
                />
              </Box>
            )}
          </Box>
        ) : (
          <Typography color="textSecondary" textAlign="center">
            Aucune statistique disponible
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};
