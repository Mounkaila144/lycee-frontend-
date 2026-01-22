'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/UsersGuard/superadmin/hooks/useAuth';
import {
  StatisticsCards,
  SitesTable,
  SiteFormModal,
  SiteDetailModal,
  useSite,
  SiteListItem,
  CreateSiteData,
  UpdateSiteData,
  Site,
  SiteFilters,
  SitePaginationMeta,
  SiteStatistics,
} from '@/modules/Site';
import { siteService } from '@/modules/Site/superadmin/services/siteService';
import { AxiosError } from 'axios';

export default function SitesManagementPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    site,
    createSite,
    updateSite,
    deleteSite,
    loadSite,
    isLoading: siteLoading,
  } = useSite();

  // States
  const [sites, setSites] = useState<SiteListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [pagination, setPagination] = useState<SitePaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: null,
    to: null
  });

  // Statistics
  const [statistics, setStatistics] = useState<SiteStatistics | null>(null);

  // Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [filters, setFilters] = useState<SiteFilters>({
    sort_by: 'site_id',
    sort_order: 'desc',
    per_page: 15
  });

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  // Auth check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/superadmin/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Load sites
  const loadSites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await siteService.getSites({
        ...filters,
        page: pagination.current_page,
        search: globalSearch || undefined
      });

      setSites(response.data);
      setPagination(response.meta);
    } catch (err: any) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Erreur lors du chargement des tenants';
      setError(errorMessage);
      console.error('Error loading tenants:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.current_page, filters, globalSearch]);

  // Load statistics
  const loadStatistics = useCallback(async () => {
    try {
      const stats = await siteService.getStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  }, []);

  // Load on mount and when dependencies change
  useEffect(() => {
    if (isAuthenticated) {
      loadSites();
      loadStatistics();
    }
  }, [isAuthenticated, loadSites, loadStatistics]);

  // Refresh function
  const refresh = useCallback(async () => {
    await loadSites();
    await loadStatistics();
  }, [loadSites, loadStatistics]);

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Handlers
  const handleCreateClick = () => {
    setSelectedSiteId(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleEditClick = async (siteItem: SiteListItem) => {
    setSelectedSiteId(siteItem.id);
    setFormMode('edit');
    await loadSite(siteItem.id);
    setIsFormModalOpen(true);
  };

  const handleViewClick = async (siteItem: SiteListItem) => {
    setSelectedSiteId(siteItem.id);
    await loadSite(siteItem.id);
    setIsDetailModalOpen(true);
  };

  const handleDeleteClick = async (siteItem: SiteListItem) => {
    try {
      await deleteSite(siteItem.id);
      await refresh();
    } catch (err) {
      console.error('Error deleting tenant:', err);
    }
  };

  const handleFormSubmit = async (data: CreateSiteData | UpdateSiteData) => {
    try {
      if (formMode === 'create') {
        await createSite(data as CreateSiteData);
      } else if (selectedSiteId) {
        await updateSite(selectedSiteId, data as UpdateSiteData);
      }
      await refresh();
      setIsFormModalOpen(false);
      setSelectedSiteId(null);
    } catch (err) {
      console.error('Form submission error:', err);
      throw err;
    }
  };

  return (
    <div className="container mx-auto py-6">
      {/* Statistics */}
      <div className="mb-6">
        <StatisticsCards statistics={statistics} isLoading={loading} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Tenants Table */}
      <SitesTable
        sites={sites}
        isLoading={loading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onView={handleViewClick}
        onAdd={handleCreateClick}
        pagination={pagination}
        onPageChange={(page) => {
          setPagination(prev => ({ ...prev, current_page: page }));
        }}
        onPageSizeChange={(size) => {
          setFilters(prev => ({ ...prev, per_page: size }));
          setPagination(prev => ({ ...prev, per_page: size, current_page: 1 }));
        }}
        onRefresh={refresh}
        onSearch={setGlobalSearch}
      />

      {/* Form Modal */}
      <SiteFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedSiteId(null);
        }}
        onSubmit={handleFormSubmit}
        site={formMode === 'edit' ? site : null}
        mode={formMode}
      />

      {/* Detail Modal */}
      <SiteDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedSiteId(null);
        }}
        site={site}
      />
    </div>
  );
}
