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
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧪</text></svg>"
        />
      </head>
      <body className="min-h-screen bg-ctp-base text-ctp-text antialiased">{children}</body>
    </html>
  );
}
