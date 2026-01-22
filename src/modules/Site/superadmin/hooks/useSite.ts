'use client';

import { useState, useCallback } from 'react';
import { siteService } from '../services/siteService';
import {
  Site,
  CreateSiteData,
  UpdateSiteData,
  AddDomainData,
} from '../../types/site.types';
import { AxiosError } from 'axios';

interface UseSiteReturn {
  site: Site | null;
  isLoading: boolean;
  error: string | null;
  loadSite: (id: string) => Promise<void>;
  createSite: (data: CreateSiteData) => Promise<Site>;
  updateSite: (id: string, data: UpdateSiteData) => Promise<Site>;
  deleteSite: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<Site>;
  addDomain: (tenantId: string, data: AddDomainData) => Promise<Site>;
  removeDomain: (tenantId: string, domainId: number) => Promise<Site>;
}

export const useSite = (): UseSiteReturn => {
  const [site, setSite] = useState<Site | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSite = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await siteService.getSite(id);
      setSite(data);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Failed to load tenant';
      setError(errorMessage);
      console.error('Failed to load tenant:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSite = useCallback(async (data: CreateSiteData): Promise<Site> => {
    setIsLoading(true);
    setError(null);

    try {
      const newSite = await siteService.createSite(data);
      setSite(newSite);
      return newSite;
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string; errors?: any }>;
      const errorMessage = axiosError.response?.data?.message || 'Failed to create tenant';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSite = useCallback(async (id: string, data: UpdateSiteData): Promise<Site> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedSite = await siteService.updateSite(id, data);
      setSite(updatedSite);
      return updatedSite;
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string; errors?: any }>;
      const errorMessage = axiosError.response?.data?.message || 'Failed to update tenant';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSite = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await siteService.deleteSite(id);
      setSite(null);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Failed to delete tenant';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleActive = useCallback(async (id: string): Promise<Site> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedSite = await siteService.toggleActive(id);
      setSite(updatedSite);
      return updatedSite;
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Failed to toggle tenant status';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addDomain = useCallback(async (tenantId: string, data: AddDomainData): Promise<Site> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedSite = await siteService.addDomain(tenantId, data);
      setSite(updatedSite);
      return updatedSite;
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Failed to add domain';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeDomain = useCallback(async (tenantId: string, domainId: number): Promise<Site> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedSite = await siteService.removeDomain(tenantId, domainId);
      setSite(updatedSite);
      return updatedSite;
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Failed to remove domain';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    site,
    isLoading,
    error,
    loadSite,
    createSite,
    updateSite,
    deleteSite,
    toggleActive,
    addDomain,
    removeDomain,
  };
};
