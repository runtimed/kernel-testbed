import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle2, XCircle, SkipForward, Clock, AlertTriangle } from 'lucide-react';
import type { TestResult, TestStatus } from '@/types/report';
import { FAILURE_HINTS, FAILURE_SOURCES } from '@/types/report';

interface TestResultBadgeProps {
  result: TestResult;
  showTooltip?: boolean;
}

const STATUS_LABELS: Record<TestStatus, string> = {
  pass: 'Pass',
  fail: 'Fail',
  unsupported: 'Skip',
  timeout: 'Timeout',
  partial_pass: 'Partial',
};

function StatusIcon({ status, className }: { status: TestStatus; className?: string }) {
  const baseClass = className || 'h-4 w-4';

  switch (status) {
    case 'pass':
      return <CheckCircle2 className={`${baseClass} text-ctp-green`} />;
    case 'fail':
      return <XCircle className={`${baseClass} text-ctp-red`} />;
    case 'unsupported':
      return <SkipForward className={`${baseClass} text-ctp-blue`} />;
    case 'timeout':
      return <Clock className={`${baseClass} text-ctp-peach`} />;
    case 'partial_pass':
      return <AlertTriangle className={`${baseClass} text-ctp-yellow`} />;
  }
}

export function TestResultBadge({ result, showTooltip = true }: TestResultBadgeProps) {
  const status = result.status;
  const label = STATUS_LABELS[status];

  const badge = (
    <Badge
      variant="outline"
      className="font-mono text-xs gap-1.5 bg-ctp-surface0/50 border-ctp-surface1"
    >
      <StatusIcon status={status} />
      {label}
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
        <p className="font-medium text-ctp-red">Failed</p>
        <p className="text-sm text-ctp-subtext0">{result.reason}</p>
        {kind && (
          <>
            <p className="text-xs mt-2">
              <span className="font-medium text-ctp-text">Source:</span>{' '}
              <span className="text-ctp-peach">{FAILURE_SOURCES[kind]}</span>
            </p>
            <p className="text-xs text-ctp-subtext0">{FAILURE_HINTS[kind]}</p>
          </>
        )}
      </div>
    );
  } else if (result.status === 'partial_pass') {
    tooltipContent = (
      <div className="max-w-xs space-y-1">
        <p className="font-medium text-ctp-yellow">Partial Pass ({Math.round(result.score * 100)}%)</p>
        <p className="text-sm text-ctp-subtext0">{result.notes}</p>
      </div>
    );
  } else if (result.status === 'timeout') {
    tooltipContent = (
      <div className="max-w-xs">
        <p className="font-medium text-ctp-peach">Timeout</p>
        <p className="text-sm text-ctp-subtext0">Kernel did not respond within the timeout period</p>
      </div>
    );
  } else if (result.status === 'unsupported') {
    tooltipContent = (
      <div className="max-w-xs">
        <p className="font-medium text-ctp-blue">Skipped</p>
        <p className="text-sm text-ctp-subtext0">Feature not supported by this kernel</p>
      </div>
    );
  }

  if (!tooltipContent) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent className="bg-ctp-mantle border-ctp-surface1">{tooltipContent}</TooltipContent>
    </Tooltip>
  );
}

/** Compact icon-only version for matrix cells */
export function TestResultIcon({ result }: { result: TestResult }) {
  // Only show tooltip for non-pass statuses
  if (result.status === 'pass') {
    return (
      <span className="inline-flex">
        <StatusIcon status={result.status} className="h-5 w-5" />
      </span>
    );
  }

  // Build tooltip content for failures and other states
  let tooltipContent: React.ReactNode;

  if (result.status === 'fail') {
    tooltipContent = (
      <div className="max-w-xs">
        <p className="font-medium text-ctp-red">Failed</p>
        <p className="text-sm text-ctp-subtext0">{result.reason}</p>
      </div>
    );
  } else if (result.status === 'partial_pass') {
    tooltipContent = (
      <div className="max-w-xs">
        <p className="font-medium text-ctp-yellow">Partial ({Math.round(result.score * 100)}%)</p>
        <p className="text-sm text-ctp-subtext0">{result.notes}</p>
      </div>
    );
  } else if (result.status === 'timeout') {
    tooltipContent = <p className="text-ctp-peach">Timeout</p>;
  } else {
    tooltipContent = <p className="text-ctp-blue">Skipped</p>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help inline-flex">
          <StatusIcon status={result.status} className="h-5 w-5" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="bg-ctp-mantle border-ctp-surface1">{tooltipContent}</TooltipContent>
    </Tooltip>
  );
}
