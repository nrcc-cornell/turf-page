import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageTracking = (): void => {
  const location = useLocation();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search + location.hash,
      page_search: location.search,
      page_hash: location.hash,
    });
  }, [location]);
};
