import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ScorpionAI - Inteligência Artificial Comercial',
  description: 'Painel Comercial de Inteligência Artificial'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
