import type { Metadata } from 'next';
import ManualExpressClient from './manual-express-client';

export const metadata: Metadata = {
  title: 'Manual Operacional Express | Modelos práticos para trabalhar com IA',
  description: 'Modelos práticos em português para atendimento, organização de demandas e comunicação comercial com inteligência artificial.',
};

export default function ManualOperacionalExpressPage() {
  return <ManualExpressClient />;
}
