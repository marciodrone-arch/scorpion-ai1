
import type { Metadata } from 'next';
import './globals.css';
import ParticleBackground from './components/ParticleBackground';

export const metadata: Metadata = {
  title: 'ScorpionAI - Inteligência Artificial Comercial',
  description: 'Painel Comercial de Inteligência Artificial',
  verification: {
    google: '3irPN1LYwdo9ZuSrykFpve0pV8hrlctTo3DG2_RJFi8',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950 text-slate-100 antialiased font-sans">
        <ParticleBackground />
        <div className="relative z-10 min-h-screen">{children}</div>
      </body>
    </html>
  );
}
