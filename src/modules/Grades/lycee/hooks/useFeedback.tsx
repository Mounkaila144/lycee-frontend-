'use client';

import { useCallback, useState } from 'react';

import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

type Severity = 'success' | 'error' | 'info' | 'warning';

interface FeedbackState {
  message: string;
  severity: Severity;
}

/**
 * Petit système de notifications (Snackbar MUI) pour les écrans de notes.
 */
export function useFeedback() {
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const notify = useCallback((message: string, severity: Severity = 'success') => {
    setFeedback({ message, severity });
  }, []);

  const feedbackElement = (
    <Snackbar
      open={feedback !== null}
      autoHideDuration={5000}
      onClose={() => setFeedback(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      {feedback ? (
        <Alert severity={feedback.severity} variant='filled' onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      ) : undefined}
    </Snackbar>
  );

  return { notify, feedbackElement };
}
