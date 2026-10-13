'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';

/**
 * SSR/WebGL-safe host for the Three.js hero.
 *
 *  - `ssr: false` because WebGL only exists after hydration.
 *  - `next/dynamic` keeps `three` out of the initial bundle.
 *  - Feature detection degrades to a styled static panel on devices without
 *    WebGL, low-power mode, or when the user prefers reduced motion.
 */

const ScoutCanvas = dynamic(() => import('./ScoutCanvas'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-3xl bg-beige-200/60" />,
});

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') ?? canvas.getContext('webgl')),
    );
  } catch {
    return false;
  }
}

export function ScoutHero({ className }: { className?: string }) {
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    setReady(true);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  if (!ready) {
    return <div className={className} aria-hidden="true" />;
  }

  if (reduced || !supportsWebGL()) {
    return (
      <div
        className={`grid place-items-center rounded-3xl bg-gradient-to-br from-forest-100 to-beige-200 ${className ?? ''}`}
        role="img"
        aria-label="كشاف يرتدي زي الكشافة"
      >
        <div className="flex flex-col items-center gap-3 text-forest-700">
          <span className="grid h-20 w-20 place-items-center rounded-3xl bg-forest-600 text-white shadow-lg">
            <Compass className="h-10 w-10" />
          </span>
          <p className="text-sm font-medium">مشهد الكشاف</p>
        </div>
      </div>
    );
  }

  return <ScoutCanvas className={className} animated={!reduced} />;
}