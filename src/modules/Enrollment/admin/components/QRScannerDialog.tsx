'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { useCardVerification } from '../hooks/useStudentCards';

import type { VerifyCardResponse } from '../../types/studentCard.types';

interface QRScannerDialogProps {
  open: boolean;
  onClose: () => void;
  translations: Record<string, any>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`verification-tabpanel-${index}`}
      aria-labelledby={`verification-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export const QRScannerDialog = ({ open, onClose, translations }: QRScannerDialogProps) => {
  const t = translations;
  const { verificationResult, loading, error, verifyCard, clearVerification } = useCardVerification();

  const [activeTab, setActiveTab] = useState(0);
  const [manualQrData, setManualQrData] = useState('');
  const [manualSignature, setManualSignature] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up camera on close
  useEffect(() => {
    if (!open) {
      stopCamera();
      clearVerification();
      setManualQrData('');
      setManualSignature('');
      setActiveTab(0);
    }
  }, [open, clearVerification]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraActive(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  }, []);

  const handleManualVerify = useCallback(async () => {
    if (!manualQrData.trim() || !manualSignature.trim()) return;

    try {
      await verifyCard({
        qr_data: manualQrData.trim(),
        signature: manualSignature.trim(),
      });
    } catch {
      // Error is handled in the hook
    }
  }, [manualQrData, manualSignature, verifyCard]);

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: number) => {
      setActiveTab(newValue);
      clearVerification();

      if (newValue === 0 && cameraActive) {
        // Keep camera
      } else if (newValue === 1) {
        stopCamera();
      }
    },
    [cameraActive, stopCamera, clearVerification]
  );

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  const renderVerificationResult = (result: VerifyCardResponse) => (
    <Card
      sx={{
        bgcolor: result.valid ? 'success.lighter' : 'error.lighter',
        border: 2,
        borderColor: result.valid ? 'success.main' : 'error.main',
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          {/* Status */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: result.valid ? 'success.main' : 'error.main',
                color: 'white',
              }}
            >
              <i
                className={result.valid ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'}
                style={{ fontSize: 28 }}
              />
            </Box>
            <Box>
              <Typography variant="h6" color={result.valid ? 'success.main' : 'error.main'}>
                {result.valid
                  ? t.studentCards?.cardValid || 'Carte valide'
                  : t.studentCards?.cardInvalid || 'Carte invalide'}
              </Typography>
              {result.message && (
                <Typography variant="body2" color="text.secondary">
                  {result.message}
                </Typography>
              )}
            </Box>
          </Stack>

          <Divider />

          {/* Student Info */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={result.student.photo} sx={{ width: 64, height: 64 }}>
              {result.student.firstname?.[0]}
              {result.student.lastname?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {result.student.firstname} {result.student.lastname}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {result.student.matricule}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {result.student.email}
              </Typography>
            </Box>
          </Stack>

          {/* Academic Info */}
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip
              icon={<i className="ri-book-line" />}
              label={result.student.program}
              variant="outlined"
            />
            <Chip
              icon={<i className="ri-graduation-cap-line" />}
              label={result.student.level}
              variant="outlined"
            />
          </Stack>

          {/* Card Info */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t.studentCards?.cardInfo || 'Informations de la carte'}
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Typography variant="body2">
                <strong>{t.studentCards?.cardNumber || 'N° Carte'}:</strong> {result.card.card_number}
              </Typography>
              <Typography variant="body2">
                <strong>{t.studentCards?.validUntil || 'Valide jusqu\'à'}:</strong>{' '}
                {new Date(result.card.valid_until).toLocaleDateString('fr-FR')}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <i className="ri-qr-scan-2-line" style={{ fontSize: 24 }} />
          <span>{t.studentCards?.verifyCard || 'Vérifier une carte étudiant'}</span>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab
            icon={<i className="ri-camera-line" />}
            iconPosition="start"
            label={t.studentCards?.scanQRCode || 'Scanner QR Code'}
          />
          <Tab
            icon={<i className="ri-keyboard-line" />}
            iconPosition="start"
            label={t.studentCards?.manualEntry || 'Saisie manuelle'}
          />
        </Tabs>

        {/* Camera Tab */}
        <TabPanel value={activeTab} index={0}>
          <Stack spacing={2}>
            {!cameraActive ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<i className="ri-camera-line" />}
                  onClick={startCamera}
                >
                  {t.studentCards?.startCamera || 'Démarrer la caméra'}
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {t.studentCards?.cameraPermissionNote ||
                    'Autorisez l\'accès à la caméra pour scanner les QR codes'}
                </Typography>
              </Box>
            ) : (
              <Box>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 400,
                    mx: 'auto',
                    aspectRatio: '1',
                    bgcolor: 'black',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Scanner overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '60%',
                      height: '60%',
                      border: '2px solid white',
                      borderRadius: 1,
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                  {t.studentCards?.scanInstruction || 'Placez le QR code de la carte dans le cadre'}
                </Typography>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button variant="outlined" onClick={stopCamera}>
                    {t.studentCards?.stopCamera || 'Arrêter la caméra'}
                  </Button>
                </Box>
              </Box>
            )}

            <Alert severity="info">
              <Typography variant="body2">
                {t.studentCards?.scannerNote ||
                  'Note: La fonctionnalité de scan automatique nécessite une bibliothèque de lecture QR code (ex: @zxing/browser). Pour l\'instant, utilisez la saisie manuelle.'}
              </Typography>
            </Alert>
          </Stack>
        </TabPanel>

        {/* Manual Entry Tab */}
        <TabPanel value={activeTab} index={1}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label={t.studentCards?.qrCodeData || 'Données QR Code'}
              placeholder={t.studentCards?.qrDataPlaceholder || 'Collez les données du QR code ici...'}
              value={manualQrData}
              onChange={e => setManualQrData(e.target.value)}
            />

            <TextField
              fullWidth
              label={t.studentCards?.signature || 'Signature'}
              placeholder={t.studentCards?.signaturePlaceholder || 'Collez la signature ici...'}
              value={manualSignature}
              onChange={e => setManualSignature(e.target.value)}
            />

            <Button
              variant="contained"
              onClick={handleManualVerify}
              disabled={loading || !manualQrData.trim() || !manualSignature.trim()}
              startIcon={loading ? <CircularProgress size={16} /> : <i className="ri-check-line" />}
            >
              {t.studentCards?.verify || 'Vérifier'}
            </Button>
          </Stack>
        </TabPanel>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error.message}
          </Alert>
        )}

        {/* Result */}
        {verificationResult && (
          <Box sx={{ mt: 2 }}>{renderVerificationResult(verificationResult)}</Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>{t.common?.close || 'Fermer'}</Button>
        {verificationResult && (
          <Button variant="outlined" onClick={clearVerification}>
            {t.studentCards?.newVerification || 'Nouvelle vérification'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QRScannerDialog;
