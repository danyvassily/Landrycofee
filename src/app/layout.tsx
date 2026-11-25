import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Project Living Room — Prototype MVP Local-First | Paris Cible Déc. 2027',
  description:
    'Outil de travail local-first (prototype MVP sans authentification active) pour Project Living Room : simulateurs financiers à valeurs d’exemple neutres et listes de questions à vérifier.',
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
