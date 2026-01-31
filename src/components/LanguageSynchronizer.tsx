'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/shared/lib/language-context';
import type { Locale } from '@configs/i18n';

/**
 * LanguageSynchronizer Component
 *
 * Synchronizes the URL [lang] parameter with the LanguageContext
 * This ensures that when users switch languages via the LanguageDropdown,
 * the translation system (useTranslation hook) updates accordingly.
 */
export function LanguageSynchronizer() {
  const params = useParams();
  const { language, setLanguage } = useLanguage();

  // Get the language from URL params
  const urlLang = params?.lang as Locale | undefined;

  useEffect(() => {
    // Only update if URL lang is different from current language
    if (urlLang && urlLang !== language) {
      console.log('🔄 [LanguageSynchronizer] Syncing language from URL:', urlLang);
      setLanguage(urlLang);
    }
  }, [urlLang, language, setLanguage]);

  // This component doesn't render anything
  return null;
}
