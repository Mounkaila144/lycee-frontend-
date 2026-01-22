/**
 * Hook for Maquette PDF Generation
 */

'use client';

import { useState } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { maquetteService } from '../services/maquetteService';
import type {
  MaquetteGenerationOptions,
  MaquetteGenerationResponse,
  MaquettePreviewData,
} from '../../types/maquette.types';

export const useMaquetteGeneration = () => {
  const { tenantId } = useTenant();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMaquette = async (
    programmeId: number,
    options: MaquetteGenerationOptions = {}
  ): Promise<MaquetteGenerationResponse | null> => {
    try {
      setIsGenerating(true);
      setError(null);
      // Use storeMaquette to save the PDF and get the path
      const result = await maquetteService.storeMaquette(
        programmeId,
        options,
        tenantId || undefined
      );
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to generate maquette';
      setError(errorMessage);
      console.error('Error generating maquette:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadMaquette = async (
    programmeId: number,
    filename: string
  ): Promise<boolean> => {
    try {
      setIsDownloading(true);
      setError(null);
      const blob = await maquetteService.downloadMaquette(
        programmeId,
        filename,
        tenantId || undefined
      );
      maquetteService.triggerDownload(blob, filename);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to download maquette';
      setError(errorMessage);
      console.error('Error downloading maquette:', err);
      return false;
    } finally {
      setIsDownloading(false);
    }
  };

  const generateAndDownload = async (
    programmeId: number,
    options: MaquetteGenerationOptions = {}
  ): Promise<boolean> => {
    try {
      setIsGenerating(true);
      setError(null);
      // Use generateMaquette to directly download the PDF
      const blob = await maquetteService.generateMaquette(
        programmeId,
        options,
        tenantId || undefined
      );
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `maquette_${programmeId}_${timestamp}.pdf`;
      
      maquetteService.triggerDownload(blob as any, filename);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to generate and download maquette';
      setError(errorMessage);
      console.error('Error generating and downloading maquette:', err);
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateMaquette,
    downloadMaquette,
    generateAndDownload,
    isGenerating,
    isDownloading,
    error,
  };
};
