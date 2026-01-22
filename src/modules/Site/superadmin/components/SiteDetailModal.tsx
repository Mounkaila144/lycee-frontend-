'use client';

import { Site } from '../../types/site.types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SiteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: Site | null;
}

export default function SiteDetailModal({ isOpen, onClose, site }: SiteDetailModalProps) {
  if (!isOpen || !site) return null;

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
    } catch {
      return '-';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Détails du tenant</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="bg-white px-6 py-6">
          {/* Informations générales */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Informations générales
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">ID Tenant</label>
                <p className="mt-1 text-sm text-gray-900 font-medium font-mono">{site.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Nom de la société</label>
                <p className="mt-1 text-sm text-gray-900 font-semibold">
                  {site.company_name || (
                    <span className="text-orange-600 italic">Non renseigné</span>
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-sm text-gray-900">{site.company_email || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Téléphone</label>
                <p className="mt-1 text-sm text-gray-900">{site.company_phone || '-'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500">Adresse</label>
                <p className="mt-1 text-sm text-gray-900">{site.company_address || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Statut</label>
                <p className="mt-1">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      site.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {site.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </p>
              </div>
              {site.company_logo && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Logo</label>
                  <p className="mt-1 text-sm text-gray-900 truncate">{site.company_logo}</p>
                </div>
              )}
            </div>
          </div>

          {/* Domaines */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Domaines ({site.domains.length})
            </h4>
            <div className="space-y-2">
              {site.domains.map((domain) => (
                <div
                  key={domain.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 font-mono">{domain.domain}</p>
                      <p className="text-xs text-gray-500">ID: {domain.id}</p>
                    </div>
                  </div>
                  {domain.is_primary && (
                    <span className="px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded-full">
                      Principal
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Abonnement et essai */}
          {(site.trial_ends_at || site.subscription_ends_at) && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Abonnement</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {site.trial_ends_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Fin de l'essai</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(site.trial_ends_at)}</p>
                  </div>
                )}
                {site.subscription_ends_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Fin de l'abonnement</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(site.subscription_ends_at)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Paramètres */}
          {site.settings && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Paramètres</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-xs text-gray-700 overflow-x-auto">
                  {JSON.stringify(site.settings, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Historique</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Créé</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(site.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Dernière modification</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(site.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
