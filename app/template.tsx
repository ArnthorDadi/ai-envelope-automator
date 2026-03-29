'use client';

import { useEffect, useState } from 'react';

export default function Template({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <div className="page-transition">
      <style jsx global>{`
        @keyframes page-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .page-transition {
          animation: page-fade-in 0.2s ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .page-transition {
            animation: none;
          }
        }
      `}</style>
      {children}
    </div>
  );
}
