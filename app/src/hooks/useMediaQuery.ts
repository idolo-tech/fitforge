import { useEffect, useState } from 'react';

/** Reactive matchMedia hook. SSR-safe (defaults to false when no window). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = () => setMatches(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

/** True on tablet/desktop widths (≥ 1000px). Drives the fluid full-width layout. */
export const useIsDesktop = (): boolean => useMediaQuery('(min-width: 1000px)');
