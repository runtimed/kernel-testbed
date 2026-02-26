import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TestResultIcon } from './TestResultBadge';
import type { ConformanceMatrix as MatrixType, TestCategory } from '@/types/report';
import { getAllTestNames, getPassedCount, getTotalCount, getTierScore, TIER_DESCRIPTIONS } from '@/types/report';

interface ConformanceMatrixProps {
  matrix: MatrixType;
  onKernelClick?: (kernelName: string) => void;
}

const TIERS: TestCategory[] = ['tier1_basic', 'tier2_interactive', 'tier3_rich_output', 'tier4_advanced'];

/** Summary table showing tier scores for each kernel */
export function SummaryTable({ matrix, onKernelClick }: ConformanceMatrixProps) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[120px]">Kernel</TableHead>
            <TableHead className="text-center">Protocol</TableHead>
            {TIERS.map((tier) => (
              <TableHead key={tier} className="text-center min-w-[80px]">
                {TIER_DESCRIPTIONS[tier].split(' ')[0]}
              </TableHead>
            ))}
            <TableHead className="text-center min-w-[80px]">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matrix.reports.map((report) => {
            const passed = getPassedCount(report);
            const total = getTotalCount(report);
            const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;

            return (
              <TableRow
                key={report.kernel_name}
                className={onKernelClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                onClick={() => onKernelClick?.(report.kernel_name)}
              >
                <TableCell className="font-medium">
                  <div>
                    <div>{report.kernel_name}</div>
                    <div className="text-xs text-muted-foreground">{report.implementation}</div>
                  </div>
                </TableCell>
                <TableCell className="text-center font-mono text-sm">
                  {report.protocol_version}
                </TableCell>
                {TIERS.map((tier) => {
                  const [tierPassed, tierTotal] = getTierScore(report, tier);
                  return (
                    <TableCell key={tier} className="text-center font-mono text-sm">
                      {tierTotal > 0 ? `${tierPassed}/${tierTotal}` : '-'}
                    </TableCell>
                  );
                })}
                <TableCell className="text-center">
                  <div className="font-mono">
                    {passed}/{total}
                  </div>
                  <div className="text-xs text-muted-foreground">{percentage}%</div>
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
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px] sticky left-0 bg-background">Test</TableHead>
            {matrix.reports.map((report) => (
              <TableHead key={report.kernel_name} className="text-center min-w-[80px]">
                <div className="text-xs">
                  {report.kernel_name}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {TIERS.map((tier) => {
            const testsInTier = testsByCategory[tier];
            if (testsInTier.length === 0) return null;

            return (
              <>
                {/* Tier header row */}
                <TableRow key={`${tier}-header`} className="bg-muted/30">
                  <TableCell
                    colSpan={matrix.reports.length + 1}
                    className="font-semibold text-xs uppercase tracking-wide sticky left-0 bg-muted/30"
                  >
                    {TIER_DESCRIPTIONS[tier]}
                  </TableCell>
                </TableRow>
                {/* Test rows */}
                {testsInTier.map((testName) => (
                  <TableRow key={testName}>
                    <TableCell className="font-mono text-xs sticky left-0 bg-background">
                      {testName}
                    </TableCell>
                    {matrix.reports.map((report) => {
                      const test = report.results.find((t) => t.name === testName);
                      return (
                        <TableCell key={report.kernel_name} className="text-center">
                          {test ? (
                            <TestResultIcon result={test.result} />
                          ) : (
                            <span className="text-muted-foreground">-</span>
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
