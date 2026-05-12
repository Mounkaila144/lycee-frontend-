'use client';

import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

interface ScaffoldPageProps<T> {
  title: string;
  subtitle?: string;
  /** Fonction qui charge les données (appelée au mount). */
  loader: () => Promise<T>;
  /** Rendu personnalisé des données. Si absent : JSON pretty-print. */
  render?: (data: T) => React.ReactNode;
  /** Message affiché si data est vide (array vide, null, etc.). */
  emptyMessage?: string;
}

/**
 * Page scaffold générique pour les Stories en cours d'enrichissement UI.
 *
 * Affiche un titre, lance un appel API au mount, gère loading/error/empty,
 * et rend les données (par défaut en JSON formaté).
 */
export function ScaffoldPage<T>({
  title,
  subtitle,
  loader,
  render,
  emptyMessage = 'Aucune donnée disponible pour le moment.',
}: ScaffoldPageProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    loader()
      .then((result) => {
        if (mounted) setData(result);
      })
      .catch((err) => {
        if (mounted)
          setError(err?.response?.data?.message ?? err?.message ?? 'Erreur de chargement.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isEmpty =
    data === null ||
    data === undefined ||
    (Array.isArray(data) && data.length === 0);

  return (
    <Card>
      <CardHeader title={title} subheader={subtitle} />
      <CardContent>
        {loading && (
          <Box display='flex' justifyContent='center' p={4}>
            <CircularProgress />
          </Box>
        )}
        {!loading && error && <Alert severity='error'>{error}</Alert>}
        {!loading && !error && isEmpty && (
          <Alert severity='info'>{emptyMessage}</Alert>
        )}
        {!loading && !error && !isEmpty && (
          <Box>
            {render ? (
              render(data as T)
            ) : (
              <pre style={{ fontSize: 12, overflow: 'auto' }}>
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
