import { Metadata } from 'next';
import { HomeContent } from './components/HomeContent';
import { getConformanceData } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Jupyter Kernel Conformance',
  description: 'Protocol compliance test results for Jupyter kernels',
  openGraph: {
    title: 'Jupyter Kernel Conformance',
    description: 'Protocol compliance test results for Jupyter kernels',
  },
};

export default async function HomePage() {
  const data = await getConformanceData();

  return <HomeContent data={data} />;
}
