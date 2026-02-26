import { useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { KernelCard } from '@/components/KernelCard';
import { TierBreakdown } from '@/components/TierBreakdown';
import { SummaryTable, DetailedMatrix } from '@/components/ConformanceMatrix';
import { useConformanceData } from '@/hooks/useConformanceData';
import type { KernelReport } from '@/types/report';

function App() {
  const { data, loading, error } = useConformanceData();
  const [selectedKernel, setSelectedKernel] = useState<KernelReport | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading conformance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Data</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
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
        <div className="min-h-screen bg-background">
          <Header generatedAt={data.generated_at} commitSha={data.commit_sha} />

          <main className="container mx-auto px-4 py-8">
            <button
              onClick={() => setSelectedKernel(null)}
              className="mb-6 text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
            >
              <span>←</span> Back to Matrix
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-semibold">{selectedKernel.kernel_name}</h2>
              <p className="text-muted-foreground">
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
      <div className="min-h-screen bg-background">
        <Header generatedAt={data.generated_at} commitSha={data.commit_sha} />

        <main className="container mx-auto px-4 py-8">
          <Tabs defaultValue="summary" className="space-y-6">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="matrix">Detailed Matrix</TabsTrigger>
              <TabsTrigger value="cards">Kernel Cards</TabsTrigger>
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

        <footer className="border-t mt-12">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            <p>
              <a
                href="https://github.com/runtimed/kernel-testbed"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                kernel-testbed
              </a>{' '}
              • Jupyter kernel protocol conformance testing
            </p>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

export default App;
