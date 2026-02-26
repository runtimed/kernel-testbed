import { AlertTriangle, XCircle, CheckCircle2, ChevronRight, Skull } from 'lucide-react';
import type { KernelReport, TestRecord } from '@/types/report';
import { getPassedCount, getTotalCount, hasStartupError } from '@/types/report';

interface FailureSummaryProps {
  report: KernelReport;
}

// Group failures by their reason pattern
function groupFailuresByReason(report: KernelReport): Map<string, TestRecord[]> {
  const groups = new Map<string, TestRecord[]>();

  for (const test of report.results) {
    if (test.result.status === 'fail') {
      const reason = test.result.reason || 'Unknown error';
      // Normalize common patterns
      const key = reason.includes('Timeout') ? 'Timeout' : reason;
      const existing = groups.get(key) || [];
      existing.push(test);
      groups.set(key, existing);
    }
  }

  return groups;
}

export function FailureSummary({ report }: FailureSummaryProps) {
  // Check for startup error first - this is a critical failure
  if (hasStartupError(report)) {
    return (
      <div className="rounded-lg border border-ctp-red/50 bg-ctp-red/10 p-4 mb-6">
        <div className="flex items-start gap-3">
          <Skull className="h-6 w-6 text-ctp-red flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-ctp-red">Kernel failed during startup</h3>
            <p className="text-sm text-ctp-subtext0 mt-1">
              The kernel could not complete initialization. No tests were run.
            </p>
            <div className="mt-3 p-3 rounded bg-ctp-surface0/50 font-mono text-sm text-ctp-red">
              {report.startup_error}
            </div>
            <p className="mt-3 text-xs text-ctp-subtext0">
              This usually indicates a fundamental protocol compatibility issue.
              Check that the kernel sends valid Jupyter protocol messages.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const passed = getPassedCount(report);
  const total = getTotalCount(report);
  const failed = total - passed;
  const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;

  // All passing - show success state
  if (failed === 0) {
    return (
      <div className="rounded-lg border border-ctp-green/30 bg-ctp-green/5 p-4 mb-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-ctp-green flex-shrink-0" />
          <div>
            <h3 className="font-medium text-ctp-green">All tests passing</h3>
            <p className="text-sm text-ctp-subtext0 mt-0.5">
              {passed}/{total} tests pass ({percentage}%)
            </p>
          </div>
        </div>
      </div>
    );
  }

  const failureGroups = groupFailuresByReason(report);
  const sortedGroups = Array.from(failureGroups.entries()).sort(
    (a, b) => b[1].length - a[1].length
  );

  // Determine severity
  const isCritical = percentage < 50;
  const borderColor = isCritical ? 'border-ctp-red/30' : 'border-ctp-peach/30';
  const bgColor = isCritical ? 'bg-ctp-red/5' : 'bg-ctp-peach/5';
  const iconColor = isCritical ? 'text-ctp-red' : 'text-ctp-peach';
  const Icon = isCritical ? XCircle : AlertTriangle;

  return (
    <div className={`rounded-lg border ${borderColor} ${bgColor} p-4 mb-6`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-6 w-6 ${iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className={`font-medium ${iconColor}`}>
              {failed} test{failed !== 1 ? 's' : ''} failing
            </h3>
            <span className="text-sm text-ctp-subtext0 tabular-nums">
              {passed}/{total} passing ({percentage}%)
            </span>
          </div>

          {/* Grouped failure reasons */}
          <div className="mt-3 space-y-2">
            {sortedGroups.map(([reason, tests]) => (
              <div key={reason} className="text-sm">
                <div className="flex items-center gap-2 text-ctp-text">
                  <ChevronRight className="h-3.5 w-3.5 text-ctp-overlay0" />
                  <span className="font-medium">{reason}</span>
                  <span className="text-ctp-subtext0">({tests.length})</span>
                </div>
                <div className="ml-5 mt-1 text-xs text-ctp-subtext0">
                  {tests
                    .slice(0, 3)
                    .map((t) => t.name)
                    .join(', ')}
                  {tests.length > 3 && ` +${tests.length - 3} more`}
                </div>
              </div>
            ))}
          </div>

          {/* Actionable hint for timeout issues */}
          {failureGroups.has('Timeout') && (
            <p className="mt-3 text-xs text-ctp-subtext0 border-t border-ctp-surface0 pt-3">
              Timeout failures often indicate the kernel doesn't implement certain message types.
              Check if these messages are supported in your kernel.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
