import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { TestResult, TestStatus } from '@/types/report';
import { FAILURE_HINTS, FAILURE_SOURCES, getStatusEmoji } from '@/types/report';

interface TestResultBadgeProps {
  result: TestResult;
  showTooltip?: boolean;
}

const STATUS_VARIANTS: Record<TestStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pass: 'default',
  fail: 'destructive',
  unsupported: 'secondary',
  timeout: 'outline',
  partial_pass: 'secondary',
};

const STATUS_LABELS: Record<TestStatus, string> = {
  pass: 'Pass',
  fail: 'Fail',
  unsupported: 'Skip',
  timeout: 'Timeout',
  partial_pass: 'Partial',
};

export function TestResultBadge({ result, showTooltip = true }: TestResultBadgeProps) {
  const status = result.status;
  const emoji = getStatusEmoji(status);
  const variant = STATUS_VARIANTS[status];
  const label = STATUS_LABELS[status];

  const badge = (
    <Badge variant={variant} className="font-mono text-xs">
      {emoji} {label}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  // Build tooltip content based on result type
  let tooltipContent: React.ReactNode = null;

  if (result.status === 'fail') {
    const kind = result.kind;
    tooltipContent = (
      <div className="max-w-xs space-y-1">
        <p className="font-medium">Failed</p>
        <p className="text-sm text-muted-foreground">{result.reason}</p>
        {kind && (
          <>
            <p className="text-xs mt-2">
              <span className="font-medium">Source:</span> {FAILURE_SOURCES[kind]}
            </p>
            <p className="text-xs text-muted-foreground">{FAILURE_HINTS[kind]}</p>
          </>
        )}
      </div>
    );
  } else if (result.status === 'partial_pass') {
    tooltipContent = (
      <div className="max-w-xs space-y-1">
        <p className="font-medium">Partial Pass ({Math.round(result.score * 100)}%)</p>
        <p className="text-sm text-muted-foreground">{result.notes}</p>
      </div>
    );
  } else if (result.status === 'timeout') {
    tooltipContent = (
      <div className="max-w-xs">
        <p className="font-medium">Timeout</p>
        <p className="text-sm text-muted-foreground">Kernel did not respond within the timeout period</p>
      </div>
    );
  } else if (result.status === 'unsupported') {
    tooltipContent = (
      <div className="max-w-xs">
        <p className="font-medium">Skipped</p>
        <p className="text-sm text-muted-foreground">Feature not supported by this kernel</p>
      </div>
    );
  }

  if (!tooltipContent) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent>{tooltipContent}</TooltipContent>
    </Tooltip>
  );
}

/** Compact icon-only version for matrix cells */
export function TestResultIcon({ result }: { result: TestResult }) {
  const emoji = getStatusEmoji(result.status);

  // Build tooltip content
  let tooltipContent: React.ReactNode = <span>{STATUS_LABELS[result.status]}</span>;

  if (result.status === 'fail') {
    tooltipContent = (
      <div className="max-w-xs">
        <p className="font-medium">Failed</p>
        <p className="text-sm">{result.reason}</p>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-default text-lg">{emoji}</span>
      </TooltipTrigger>
      <TooltipContent>{tooltipContent}</TooltipContent>
    </Tooltip>
  );
}
