import { useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { KernelCard } from '@/components/KernelCard';
import { TierBreakdown } from '@/components/TierBreakdown';
import { SummaryTable, DetailedMatrix } from '@/components/ConformanceMatrix';
import { useConformanceData } from '@/hooks/useConformanceData';
import { ArrowLeft, Table2, Grid3X3, LayoutGrid, Github, AlertCircle } from 'lucide-react';
import type { KernelReport } from '@/types/report';

function App() {
  const { data, loading, error } = useConformanceData();
  const [selectedKernel, setSelectedKernel] = useState<KernelReport | null>(null);

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
              onClick={() => setSelectedKernel(null)}
              className="mb-6 text-sm text-ctp-subtext0 hover:text-ctp-mauve transition-colors flex items-center gap-2"
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

            <TierBreakdown report={selectedKernel} />
          </main>
        </div>
      </TooltipProvider>
    );
  }

  // Main matrix view
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-ctp-base">
        <Header generatedAt={data.generated_at} commitSha={data.commit_sha} />

        <main className="container mx-auto px-4 py-8">
          <Tabs defaultValue="summary" className="space-y-6">
            <TabsList className="bg-ctp-mantle border border-ctp-surface0">
              <TabsTrigger
                value="summary"
                className="data-[state=active]:bg-ctp-surface0 data-[state=active]:text-ctp-mauve gap-1.5"
              >
                <Table2 className="h-4 w-4" />
                Summary
              </TabsTrigger>
              <TabsTrigger
                value="matrix"
                className="data-[state=active]:bg-ctp-surface0 data-[state=active]:text-ctp-mauve gap-1.5"
              >
                <Grid3X3 className="h-4 w-4" />
                Detailed Matrix
              </TabsTrigger>
              <TabsTrigger
                value="cards"
                className="data-[state=active]:bg-ctp-surface0 data-[state=active]:text-ctp-mauve gap-1.5"
              >
                <LayoutGrid className="h-4 w-4" />
                Kernel Cards
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-6">
              <SummaryTable
                matrix={data}
                onKernelClick={(name) => {
                  const report = data.reports.find((r) => r.kernel_name === name);
                  if (report) setSelectedKernel(report);
                }}
              />
            </TabsContent>

            <TabsContent value="matrix">
              <DetailedMatrix matrix={data} />
            </TabsContent>

            <TabsContent value="cards">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.reports.map((report) => (
                  <KernelCard
                    key={report.kernel_name}
                    report={report}
                    onClick={() => setSelectedKernel(report)}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>

        <footer className="border-t border-ctp-surface0 mt-12 bg-ctp-mantle">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-ctp-subtext0">
            <a
              href="https://github.com/runtimed/kernel-testbed"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-ctp-mauve transition-colors"
            >
              <Github className="h-4 w-4" />
              kernel-testbed
            </a>
            <span className="mx-2">•</span>
            Jupyter kernel protocol conformance testing
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

export default App;
