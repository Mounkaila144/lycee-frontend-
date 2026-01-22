'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import StudentCardDashboard from './StudentCardDashboard';

// Import translations directly for the Enrollment module
import frTranslations from '../../translations/fr.json';
import enTranslations from '../../translations/en.json';
import arTranslations from '../../translations/ar.json';

/**
 * Get translations based on current locale
 */
function getTranslations(locale: string): Record<string, any> {
  switch (locale) {
    case 'fr':
      return frTranslations;
    case 'ar':
      return arTranslations;
    default:
      return enTranslations;
  }
}

/**
 * Hook to get current locale from URL or document
 */
function useLocale(): string {
  const [locale, setLocale] = useState<string>('fr');

  useEffect(() => {
    // Get locale from URL path (e.g., /fr/admin/...)
    const pathSegments = window.location.pathname.split('/');
    const urlLocale = pathSegments[1];

    if (['en', 'fr', 'ar'].includes(urlLocale)) {
      setLocale(urlLocale);
    }
  }, []);

  return locale;
}

/**
 * Student Cards page wrapper component
 * Provides the main entry point for student card management
 */
export const StudentCards = () => {
  const locale = useLocale();
  const [translations, setTranslations] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    setTranslations(getTranslations(locale));
  }, [locale]);

  // Show loading while translations are being loaded
  if (!translations) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          {translations.studentCards?.title || 'Student Cards'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {translations.studentCards?.description ||
            'Manage student card generation, printing, and verification.'}
        </Typography>
      </Box>

      {/* Dashboard */}
      <StudentCardDashboard translations={translations} />
    </Box>
  );
};

export default StudentCards;
