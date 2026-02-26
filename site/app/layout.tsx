import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Jupyter Kernel Conformance',
    template: '%s | Jupyter Kernel Conformance',
  },
  description: 'Protocol compliance test results for Jupyter kernels',
  metadataBase: new URL('https://runtimed.github.io'),
  openGraph: {
    type: 'website',
    siteName: 'Jupyter Kernel Conformance',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ctp-base text-ctp-text antialiased">{children}</body>
    </html>
  );
}
