import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ScorpionAI - Inteligência Artificial Comercial',
  description: 'Painel Comercial de Inteligência Artificial',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
