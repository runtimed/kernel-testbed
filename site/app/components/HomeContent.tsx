'use client';

import { Github } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Header } from '@/components/Header';
import { SummaryTable } from '@/components/ConformanceMatrix';
import type { ConformanceMatrix } from '@/types/report';

interface HomeContentProps {
  data: ConformanceMatrix;
}

export function HomeContent({ data }: HomeContentProps) {

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-ctp-base flex flex-col">
        <Header generatedAt={data.generated_at} commitSha={data.commit_sha} currentPage="summary" />

        <main className="max-w-screen-2xl mx-auto px-4 py-4 flex-1 w-full">
          <SummaryTable matrix={data} />
        </main>

        <footer className="border-t border-ctp-surface0 bg-ctp-mantle">
          <div className="max-w-screen-2xl mx-auto px-4 py-6 flex items-center justify-center gap-2 text-sm text-ctp-subtext0">
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
