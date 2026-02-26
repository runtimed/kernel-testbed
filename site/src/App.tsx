import { useState, useEffect } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { KernelCard } from '@/components/KernelCard';
import { TierBreakdown } from '@/components/TierBreakdown';
import { FailureSummary } from '@/components/FailureSummary';
import { SummaryTable, DetailedMatrix } from '@/components/ConformanceMatrix';
import { hasStartupError } from '@/types/report';
import { useConformanceData } from '@/hooks/useConformanceData';
import { ArrowLeft, Table2, Grid3X3, LayoutGrid, Github, AlertCircle } from 'lucide-react';
import type { KernelReport } from '@/types/report';

type ViewTab = 'summary' | 'matrix' | 'cards';

function parseHash(): { kernel: string | null; tab: ViewTab } {
  const hash = window.location.hash.slice(1); // Remove #
  if (hash.startsWith('/kernel/')) {
    return { kernel: decodeURIComponent(hash.slice(8)), tab: 'summary' };
  }
  if (hash === '/matrix') return { kernel: null, tab: 'matrix' };
  if (hash === '/cards') return { kernel: null, tab: 'cards' };
  return { kernel: null, tab: 'summary' };
}

function App() {
  const { data, loading, error } = useConformanceData();
  const [selectedKernel, setSelectedKernel] = useState<KernelReport | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>('summary');

  // Handle URL hash changes
  useEffect(() => {
    function handleHashChange() {
      const { kernel, tab } = parseHash();
      setActiveTab(tab);
      if (kernel && data) {
        const report = data.reports.find((r) => r.kernel_name === kernel);
        setSelectedKernel(report || null);
      } else {
        setSelectedKernel(null);
      }
    }

    handleHashChange(); // Initial parse
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [data]);

  // Navigate to kernel
  function navigateToKernel(name: string) {
    window.location.hash = `/kernel/${encodeURIComponent(name)}`;
  }

  // Navigate to tab
  function navigateToTab(tab: ViewTab) {
    window.location.hash = tab === 'summary' ? '' : `/${tab}`;
  }

  // Navigate back
  function navigateBack() {
    window.location.hash = activeTab === 'summary' ? '' : `/${activeTab}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ctp-base flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ctp-mauve mx-auto" />
          <p className="mt-4 text-ctp-subtext0">Loading conformance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ctp-base flex items-center justify-center p-4">
        <Card className="max-w-md bg-ctp-mantle border-ctp-surface0">
          <CardHeader>
            <CardTitle className="text-ctp-red flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error Loading Data
            </CardTitle>
            <CardDescription className="text-ctp-subtext0">{error.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ctp-subtext0">
              Conformance reports are published as GitHub releases. If no releases exist yet,
              run the CI workflow to generate reports.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // If a kernel is selected, show its detail view
  if (selectedKernel) {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-ctp-base">
          <Header generatedAt={data.generated_at} commitSha={data.commit_sha} />

          <main className="container mx-auto px-4 py-8">
            <button
              onClick={navigateBack}
              className="mb-6 text-sm text-ctp-subtext0 hover:text-ctp-text transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Matrix
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-ctp-text">{selectedKernel.kernel_name}</h2>
              <p className="text-ctp-subtext0">
                {selectedKernel.implementation} ({selectedKernel.language}) • Protocol{' '}
                {selectedKernel.protocol_version}
              </p>
            </div>

            <FailureSummary report={selectedKernel} />

            {/* Only show tier breakdown if kernel started successfully */}
            {!hasStartupError(selectedKernel) && <TierBreakdown report={selectedKernel} />}
          </main>
        </div>
      </TooltipProvider>
    );
  }

  // Main matrix view
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-ctp-base flex flex-col">
        <Header generatedAt={data.generated_at} commitSha={data.commit_sha} />

        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="space-y-6">
            {/* Simple tab buttons */}
            <div className="flex gap-1 text-sm">
              <button
                onClick={() => navigateToTab('summary')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                  activeTab === 'summary'
                    ? 'bg-ctp-surface0 text-ctp-text'
                    : 'text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-surface0/50'
                }`}
              >
                <Table2 className="h-4 w-4" />
                Summary
              </button>
              <button
                onClick={() => navigateToTab('matrix')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                  activeTab === 'matrix'
                    ? 'bg-ctp-surface0 text-ctp-text'
                    : 'text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-surface0/50'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
                Detailed Matrix
              </button>
              <button
                onClick={() => navigateToTab('cards')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                  activeTab === 'cards'
                    ? 'bg-ctp-surface0 text-ctp-text'
                    : 'text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-surface0/50'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                Kernel Cards
              </button>
            </div>

            {/* Tab content */}
            {activeTab === 'summary' && (
              <SummaryTable matrix={data} onKernelClick={navigateToKernel} />
            )}

            {activeTab === 'matrix' && <DetailedMatrix matrix={data} />}

            {activeTab === 'cards' && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.reports.map((report) => (
                  <KernelCard
                    key={report.kernel_name}
                    report={report}
                    onClick={() => navigateToKernel(report.kernel_name)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        <footer className="border-t border-ctp-surface0 bg-ctp-mantle">
          <div className="container mx-auto px-4 py-6 flex items-center justify-center gap-2 text-sm text-ctp-subtext0">
            <a
              href="https://github.com/runtimed/kernel-testbed"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-ctp-mauve transition-colors"
            >
              <Github className="h-4 w-4" />
              kernel-testbed
            </a>
            <span>•</span>
            <span>Jupyter kernel protocol conformance testing</span>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

export default App;
