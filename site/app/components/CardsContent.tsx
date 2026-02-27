'use client';

import { Github, Table2, Grid3X3, LayoutGrid } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Header } from '@/components/Header';
import { KernelCard } from '@/components/KernelCard';
import type { ConformanceMatrix } from '@/types/report';
import { getPassedCount, getTotalCount } from '@/types/report';

interface CardsContentProps {
  data: ConformanceMatrix;
}

export function CardsContent({ data }: CardsContentProps) {
  // Sort reports by score (highest first)
  const sortedReports = [...data.reports].sort((a, b) => {
    const aPercent = getTotalCount(a) > 0 ? getPassedCount(a) / getTotalCount(a) : 0;
    const bPercent = getTotalCount(b) > 0 ? getPassedCount(b) / getTotalCount(b) : 0;
    return bPercent - aPercent;
  });

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-ctp-base flex flex-col">
        <Header generatedAt={data.generated_at} commitSha={data.commit_sha} />

        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="space-y-6">
            {/* Tab navigation */}
            <nav className="flex gap-1 text-sm">
              <a
                href="/kernel-testbed/"
                className="px-3 py-1.5 rounded-md flex items-center gap-1.5 text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-surface0/50"
              >
                <Table2 className="h-4 w-4" />
                Summary
              </a>
              <a
                href="/kernel-testbed/matrix/"
                className="px-3 py-1.5 rounded-md flex items-center gap-1.5 text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-surface0/50"
              >
                <Grid3X3 className="h-4 w-4" />
                Detailed Matrix
              </a>
              <a
                href="/kernel-testbed/cards/"
                className="px-3 py-1.5 rounded-md flex items-center gap-1.5 bg-ctp-surface0 text-ctp-text"
              >
                <LayoutGrid className="h-4 w-4" />
                Kernel Cards
              </a>
            </nav>

            {/* Kernel cards grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedReports.map((report) => (
                <KernelCard
                  key={report.kernel_name}
                  report={report}
                  href={`/kernel/${encodeURIComponent(report.kernel_name)}/`}
                />
              ))}
            </div>
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
