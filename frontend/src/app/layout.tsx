import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Martverse — Immersive 3D Virtual Supermarket',
  description:
    'Experience real supermarket shopping in 3D. Explore physical aisles, pick products from shelves into your interactive shopping trolley, checkout with barcode scanning, and pay securely.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                var origWarn = console.warn;
                console.warn = function() {
                  var m = arguments[0];
                  if (typeof m === 'string' && (
                    m.indexOf('THREE.Clock') !== -1 ||
                    m.indexOf('PCFSoftShadowMap') !== -1 ||
                    m.indexOf('Failed to fetch') !== -1 ||
                    m.indexOf('API [') !== -1
                  )) {
                    return;
                  }
                  origWarn.apply(console, arguments);
                };
              })();
            `,
          }}
        />
      </head>
      <body className="h-full w-full overflow-hidden bg-[#080B11] text-slate-100 select-none">
        {children}
      </body>
    </html>
  );
}
