import { Metadata } from 'next';
import { ArrowLeft, ExternalLink, Github } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Header } from '@/components/Header';
import { TierBreakdown } from '@/components/TierBreakdown';
import { FailureSummary } from '@/components/FailureSummary';
import { getConformanceData, getAllKernelNames, getKernelReport } from '@/lib/data';
import { getKernelMetadata } from '@/lib/kernel-metadata';
import { getPassedCount, getTotalCount, hasStartupError } from '@/types/report';
import { notFound } from 'next/navigation';

interface KernelPageProps {
  params: Promise<{ name: string }>;
}

export async function generateStaticParams() {
  const kernelNames = await getAllKernelNames();
  return kernelNames.map((name) => ({
    name: encodeURIComponent(name),
  }));
}

export async function generateMetadata({ params }: KernelPageProps): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const report = await getKernelReport(decodedName);

  if (!report) {
    return {
      title: 'Kernel Not Found',
    };
  }

  const passed = getPassedCount(report);
  const total = getTotalCount(report);
  const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;

  return {
    title: report.kernel_name,
    description: `${report.implementation} (${report.language}) passes ${passed}/${total} (${percentage}%) conformance tests. Protocol ${report.protocol_version}`,
    openGraph: {
      title: `${report.kernel_name} - Jupyter Kernel Conformance`,
      description: `${report.implementation} (${report.language}) passes ${passed}/${total} (${percentage}%) conformance tests`,
    },
  };
}

export default async function KernelPage({ params }: KernelPageProps) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const data = await getConformanceData();
  const report = await getKernelReport(decodedName);

  if (!report) {
    notFound();
  }

  const metadata = getKernelMetadata(report.kernel_name);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-ctp-base">
        <Header generatedAt={data.generated_at} commitSha={data.commit_sha} />

        <main className="container mx-auto px-4 py-8">
          <a
            href="/kernel-testbed/"
            className="mb-6 text-sm text-ctp-subtext0 hover:text-ctp-text transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Matrix
          </a>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-ctp-text">{report.kernel_name}</h2>
            <p className="text-ctp-subtext0">
              {report.implementation} ({report.language}) • Protocol {report.protocol_version}
            </p>
            {metadata?.repository && (
              <a
                href={metadata.repository}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-ctp-blue hover:text-ctp-sapphire transition-colors mt-2"
              >
                <Github className="h-4 w-4" />
                View on GitHub
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          <FailureSummary report={report} />

          {/* Only show tier breakdown if kernel started successfully */}
          {!hasStartupError(report) && <TierBreakdown report={report} />}
        </main>
      </div>
    </TooltipProvider>
  );
}
