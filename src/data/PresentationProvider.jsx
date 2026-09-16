import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, fetchPublicPresentation } from './api.js';
import { buildFallbackPresentation, mapApiPresentation } from './mappers.js';

const PresentationContext = createContext(null);

export function PresentationProvider({ children, mode = 'public' }) {
  const [data, setData] = useState(() => buildFallbackPresentation());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const apiData =
          mode === 'draft'
            ? await api.get('/api/admin/preview/presentation')
            : await fetchPublicPresentation();
        if (!cancelled) {
          setData(mapApiPresentation(apiData));
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setData(buildFallbackPresentation());
          setError(e.message || 'fallback');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  return (
    <PresentationContext.Provider value={{ data, loading, error, source: data.source, mode }}>
      {children}
    </PresentationContext.Provider>
  );
}

export function usePresentation() {
  const ctx = useContext(PresentationContext);
  if (!ctx) {
    return { data: buildFallbackPresentation(), loading: false, error: null, source: 'fallback', mode: 'public' };
  }
  return ctx;
}
