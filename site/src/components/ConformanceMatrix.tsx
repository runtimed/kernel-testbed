import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TestResultIcon } from './TestResultBadge';
import { getLanguageIcon } from './LanguageIcons';
import type { ConformanceMatrix as MatrixType, TestCategory } from '@/types/report';
import { getAllTestNames, getPassedCount, getTotalCount, getTierScore, TIER_DESCRIPTIONS } from '@/types/report';

interface ConformanceMatrixProps {
  matrix: MatrixType;
  onKernelClick?: (kernelName: string) => void;
}

const TIERS: TestCategory[] = ['tier1_basic', 'tier2_interactive', 'tier3_rich_output', 'tier4_advanced'];

// Color based on score percentage
function getScoreColor(percentage: number): string {
  if (percentage >= 90) return 'text-ctp-green';
  if (percentage >= 70) return 'text-ctp-yellow';
  if (percentage >= 50) return 'text-ctp-peach';
  return 'text-ctp-red';
}

/** Summary table showing tier scores for each kernel */
export function SummaryTable({ matrix, onKernelClick }: ConformanceMatrixProps) {
  return (
    <div className="rounded-lg border border-ctp-surface0 overflow-x-auto bg-ctp-mantle">
      <Table>
        <TableHeader>
          <TableRow className="border-ctp-surface0 hover:bg-transparent">
            <TableHead className="min-w-[150px] text-ctp-subtext0 pl-4">Kernel</TableHead>
            <TableHead className="text-center text-ctp-subtext0">Protocol</TableHead>
            {TIERS.map((tier) => (
              <TableHead key={tier} className="text-center min-w-[80px] text-ctp-subtext0">
                {TIER_DESCRIPTIONS[tier].split(' ')[0]}
              </TableHead>
            ))}
            <TableHead className="text-center min-w-[80px] text-ctp-subtext0">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matrix.reports.map((report) => {
            const passed = getPassedCount(report);
            const total = getTotalCount(report);
            const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
            const LanguageIcon = getLanguageIcon(report.kernel_name, report.language);

            return (
              <TableRow
                key={report.kernel_name}
                className={`border-ctp-surface0 ${onKernelClick ? 'cursor-pointer hover:bg-ctp-surface0/50' : ''}`}
                onClick={() => onKernelClick?.(report.kernel_name)}
              >
                <TableCell className="font-medium pl-4">
                  <div className="flex items-center gap-2.5">
                    <LanguageIcon className="h-5 w-5 flex-shrink-0" />
                    <div>
                      <div className="text-ctp-text">{report.kernel_name}</div>
                      <div className="text-xs text-ctp-subtext0">{report.implementation}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center font-mono text-sm text-ctp-lavender">
                  {report.protocol_version}
                </TableCell>
                {TIERS.map((tier) => {
                  const [tierPassed, tierTotal] = getTierScore(report, tier);
                  const tierPercent = tierTotal > 0 ? Math.round((tierPassed / tierTotal) * 100) : 0;
                  return (
                    <TableCell key={tier} className={`text-center font-mono text-sm ${getScoreColor(tierPercent)}`}>
                      {tierTotal > 0 ? `${tierPassed}/${tierTotal}` : '-'}
                    </TableCell>
                  );
                })}
                <TableCell className="text-center">
                  <div className={`font-mono ${getScoreColor(percentage)}`}>
                    {passed}/{total}
                  </div>
                  <div className={`text-xs ${getScoreColor(percentage)}`}>{percentage}%</div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

/** Detailed matrix showing all tests vs all kernels */
export function DetailedMatrix({ matrix }: ConformanceMatrixProps) {
  const testNames = getAllTestNames(matrix);

  // Group tests by category for display
  const testsByCategory: Record<TestCategory, string[]> = {
    tier1_basic: [],
    tier2_interactive: [],
    tier3_rich_output: [],
    tier4_advanced: [],
  };

  // Build category mapping from first report that has each test
  for (const testName of testNames) {
    for (const report of matrix.reports) {
      const test = report.results.find((t) => t.name === testName);
      if (test) {
        testsByCategory[test.category].push(testName);
        break;
      }
    }
  }

  return (
    <div className="rounded-lg border border-ctp-surface0 overflow-x-auto bg-ctp-mantle">
      <Table>
        <TableHeader>
          <TableRow className="border-ctp-surface0 hover:bg-transparent">
            <TableHead className="min-w-[200px] sticky left-0 bg-ctp-mantle text-ctp-subtext0">Test</TableHead>
            {matrix.reports.map((report) => {
              const LanguageIcon = getLanguageIcon(report.kernel_name, report.language);
              return (
                <TableHead key={report.kernel_name} className="text-center min-w-[80px] text-ctp-subtext0 py-3">
                  <div className="flex flex-col items-center gap-1.5">
                    <LanguageIcon className="h-5 w-5" />
                    <span className="text-xs">{report.kernel_name}</span>
                  </div>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {TIERS.map((tier) => {
            const testsInTier = testsByCategory[tier];
            if (testsInTier.length === 0) return null;

            return (
              <>
                {/* Tier header row */}
                <TableRow key={`${tier}-header`} className="bg-ctp-surface0/30 hover:bg-ctp-surface0/30 border-ctp-surface0">
                  <TableCell
                    colSpan={matrix.reports.length + 1}
                    className="font-semibold text-xs uppercase tracking-wide sticky left-0 bg-ctp-surface0/30 text-ctp-mauve"
                  >
                    {TIER_DESCRIPTIONS[tier]}
                  </TableCell>
                </TableRow>
                {/* Test rows */}
                {testsInTier.map((testName) => (
                  <TableRow key={testName} className="border-ctp-surface0 hover:bg-ctp-surface0/30">
                    <TableCell className="font-mono text-xs sticky left-0 bg-ctp-mantle text-ctp-text">
                      {testName}
                    </TableCell>
                    {matrix.reports.map((report) => {
                      const test = report.results.find((t) => t.name === testName);
                      return (
                        <TableCell key={report.kernel_name} className="text-center">
                          {test ? (
                            <TestResultIcon result={test.result} />
                          ) : (
                            <span className="text-ctp-surface2">-</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
