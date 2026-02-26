import { Metadata } from 'next';
import { CardsContent } from '../components/CardsContent';
import { getConformanceData } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Kernel Cards',
  description: 'Visual overview of Jupyter kernel conformance results',
  openGraph: {
    title: 'Kernel Cards - Jupyter Kernel Conformance',
    description: 'Visual overview of Jupyter kernel conformance results',
  },
};

export default async function CardsPage() {
  const data = await getConformanceData();

  return <CardsContent data={data} />;
}
