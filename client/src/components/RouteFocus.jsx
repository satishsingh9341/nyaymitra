import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * RouteFocus Component
 * PRD 5.5: Focus moves to main content heading on route change (for screen reader users).
 */
export default function RouteFocus() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Small timeout to allow DOM transition to mount the new heading
    const timer = setTimeout(() => {
      const heading = document.querySelector('h1');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus();
      } else {
        window.scrollTo(0, 0);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
