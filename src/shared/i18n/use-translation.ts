'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useTranslationContext } from './translation-provider';
import { UseTranslationReturn, TranslationKeys, Locale } from './types';

/**
 * Load translations for a specific module and locale
 */
async function loadModuleTranslations(
  moduleName: string,
  locale: string
): Promise<TranslationKeys | null> {
  try {
    const translations = await import(
      `@/modules/${moduleName}/translations/${locale}.json`
    );
    return translations.default;
  } catch (error) {
    console.error(`Failed to load module translations for ${moduleName}/${locale}:`, error);
    return null;
  }
}

/**
 * Load global translations for a specific locale
 */
async function loadGlobalTranslations(
  locale: string
): Promise<TranslationKeys | null> {
  try {
    const translations = await import(`./translations/${locale}.json`);
    return translations.default;
  } catch (error) {
    console.error(`Failed to load global translations for ${locale}:`, error);
    return null;
  }
}


/**
 * Replace parameters in translation string
 * Example: interpolate('Hello {name}!', { name: 'John' }) => 'Hello John!'
 */
function interpolate(
  text: string,
  params?: Record<string, string | number>
): string {
  if (!params) return text;

  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
}

/**
 * Translation cache to avoid re-loading translations
 */
const translationCache: Record<string, TranslationKeys> = {};

/**
 * Main translation hook with French as base language
 *
 * @param moduleName - Optional module name for module-specific translations
 * @returns Translation function with locale management
 *
 * @example
 * // French text as key, translated to other languages
 * const { t } = useTranslation('StructureAcademique');
 * t('Ajouter'); // EN: "Add", FR: "Ajouter", AR: "إضافة"
 *
 * @example
 * // With parameters
 * const { t } = useTranslation();
 * t('Bienvenue, {name}!', { name: 'John' }); // EN: "Welcome, John!", FR: "Bienvenue, John!"
 *
 * @example
 * // Global translations
 * const { t } = useTranslation();
 * t('Enregistrer'); // EN: "Save", FR: "Enregistrer", AR: "حفظ"
 */
export function useTranslation(moduleName?: string): UseTranslationReturn {
  const { setLocale } = useTranslationContext();
  const params = useParams();
  const [updateCount, forceUpdate] = React.useReducer(x => x + 1, 0);

  // Get locale from URL params (source of truth) with fallback to 'fr'
  const urlLocale = params?.lang as string;
  const locale: Locale = (urlLocale === 'en' || urlLocale === 'fr' || urlLocale === 'ar')
    ? urlLocale as Locale
    : 'fr';

  /**
   * Translate text with fallback logic:
   * 1. Check module translations (if moduleName provided)
   * 2. Check global translations
   * 3. Return the default text (French) if no translation found
   */
  const t = React.useCallback((defaultText: string, params?: Record<string, string | number>): string => {
    // Try module translations first
    if (moduleName) {
      const moduleKey = `${moduleName}_${locale}`;
      const moduleTranslations = translationCache[moduleKey];

      if (moduleTranslations) {
        // Use defaultText as the key
        const value = moduleTranslations[defaultText];
        if (value && typeof value === 'string') {
          return interpolate(value, params);
        }
      }
    }

    // Fallback to global translations
    const globalKey = `global_${locale}`;
    const globalTranslations = translationCache[globalKey];

    if (globalTranslations) {
      // Use defaultText as the key
      const value = globalTranslations[defaultText];
      if (value && typeof value === 'string') {
        return interpolate(value, params);
      }
    }

    // Return default text (French) if no translation found
    return interpolate(defaultText, params);
  }, [locale, updateCount, moduleName]);

  // Preload translations for all locales (including English)
  React.useEffect(() => {
    const loadTranslations = async () => {
      console.log(`🔄 Loading translations for module: ${moduleName || 'global'}, locale: ${locale}`);

      // Load module translations
      if (moduleName) {
        const moduleKey = `${moduleName}_${locale}`;
        if (!translationCache[moduleKey]) {
          const moduleTranslations = await loadModuleTranslations(moduleName, locale);
          if (moduleTranslations) {
            translationCache[moduleKey] = moduleTranslations;
            console.log(`✅ Loaded ${Object.keys(moduleTranslations).length} module translations for ${moduleName}/${locale}`);
          }
        }
      }

      // Load global translations
      const globalKey = `global_${locale}`;
      if (!translationCache[globalKey]) {
        const globalTranslations = await loadGlobalTranslations(locale);
        if (globalTranslations) {
          translationCache[globalKey] = globalTranslations;
          console.log(`✅ Loaded ${Object.keys(globalTranslations).length} global translations for ${locale}`);
        }
      }

      // Always force re-render when locale changes to ensure translations are applied
      console.log(`🔄 Forcing re-render for locale: ${locale}`);
      forceUpdate();
    };

    loadTranslations();
  }, [locale, moduleName]);

  return { t, locale, setLocale };
}
