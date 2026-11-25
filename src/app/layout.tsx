import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Project Living Room — Espace Fondateur Privé | Paris Déc. 2027',
  description:
    'Cockpit fondateur privé pour Project Living Room : Laverie urbaine, Coffee Shop de spécialité & Listening/Cocktail Bar à Paris (cible Décembre 2027).',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="bg-living-bg text-living-ink antialiased selection:bg-living-ink selection:text-living-bg">
        {children}
      </body>
    </html>
  );
}
