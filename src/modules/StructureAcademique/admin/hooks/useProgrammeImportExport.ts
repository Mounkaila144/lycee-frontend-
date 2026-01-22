'use client'

import { useState } from 'react'
import { useTenant } from '@/shared/lib/tenant-context'
import { programmeService } from '../services/programmeService'
import type {
  ImportPreviewResponse,
  ImportConfirmResponse,
  ExportParams,
} from '../../types/programme.types'

/**
 * Hook for programme import/export operations
 */
export const useProgrammeImportExport = () => {
  const { tenantId } = useTenant()
  const [previewData, setPreviewData] = useState<ImportPreviewResponse | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Upload file for preview
   */
  const uploadForPreview = async (file: File): Promise<ImportPreviewResponse | null> => {
    try {
      setIsUploading(true)
      setError(null)
      const data = await programmeService.uploadForPreview(file, tenantId || undefined)
      
      // Debug: Log the response
      console.log('📊 Preview Response:', data)
      console.log('📁 File info:', {
        name: file.name,
        size: file.size,
        type: file.type
      })
      
      setPreviewData(data)
      return data
    } catch (err: any) {
      console.error('❌ Upload error:', err)
      console.error('❌ Error response:', err.response?.data)
      const errorMessage = err.response?.data?.message || 'Erreur lors du téléchargement du fichier'
      setError(errorMessage)
      return null
    } finally {
      setIsUploading(false)
    }
  }

  /**
   * Confirm import after preview
   */
  const confirmImport = async (): Promise<ImportConfirmResponse | null> => {
    if (!previewData?.preview_key) {
      setError('Clé de prévisualisation manquante. Veuillez recharger le fichier.');
      return null;
    }

    try {
      setIsImporting(true)
      setError(null)
      const result = await programmeService.confirmImport(previewData.preview_key, tenantId || undefined)
      setPreviewData(null) // Clear preview after import
      return result
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erreur lors de l'import"
      setError(errorMessage)
      return null
    } finally {
      setIsImporting(false)
    }
  }

  /**
   * Download import template
   */
  const downloadTemplate = async (): Promise<void> => {
    try {
      setIsDownloadingTemplate(true)
      setError(null)
      const blob = await programmeService.downloadTemplate(tenantId || undefined)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'programmes_import_template.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du téléchargement du template'
      setError(errorMessage)
    } finally {
      setIsDownloadingTemplate(false)
    }
  }

  /**
   * Export programmes to Excel or CSV
   */
  const exportProgrammes = async (params: ExportParams): Promise<void> => {
    try {
      setIsExporting(true)
      setError(null)
      const blob = await programmeService.exportProgrammes(params, tenantId || undefined)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      const date = new Date().toISOString().split('T')[0]
      const extension = params.format === 'excel' ? 'xlsx' : 'csv'
      link.download = `programmes_export_${date}.${extension}`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erreur lors de l'export"
      setError(errorMessage)
    } finally {
      setIsExporting(false)
    }
  }

  /**
   * Clear preview data
   */
  const clearPreview = () => {
    setPreviewData(null)
    setError(null)
  }

  return {
    // State
    previewData,
    isUploading,
    isImporting,
    isExporting,
    isDownloadingTemplate,
    error,

    // Actions
    uploadForPreview,
    confirmImport,
    downloadTemplate,
    exportProgrammes,
    clearPreview,
  }
}
