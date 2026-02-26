import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { TestResultBadge } from './TestResultBadge';
import { Timer } from 'lucide-react';
import type { KernelReport, TestCategory } from '@/types/report';
import { getTierResults, getTierScore, TIER_DESCRIPTIONS } from '@/types/report';

interface TierBreakdownProps {
  report: KernelReport;
}

const TIERS: TestCategory[] = ['tier1_basic', 'tier2_interactive', 'tier3_rich_output', 'tier4_advanced'];

// Color based on score percentage
function getScoreColor(percentage: number): string {
  if (percentage >= 90) return 'text-ctp-green';
  if (percentage >= 70) return 'text-ctp-yellow';
  if (percentage >= 50) return 'text-ctp-peach';
  return 'text-ctp-red';
}

export function TierBreakdown({ report }: TierBreakdownProps) {
  return (
    <Accordion type="multiple" className="w-full space-y-2" defaultValue={['tier1_basic']}>
      {TIERS.map((tier) => {
        const results = getTierResults(report, tier);
        if (results.length === 0) return null;

        const [passed, total] = getTierScore(report, tier);
        const percentage = Math.round((passed / total) * 100);

        return (
          <AccordionItem
            key={tier}
            value={tier}
            className="border border-ctp-surface0 rounded-lg bg-ctp-mantle px-4"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center justify-between w-full pr-4">
                <span className="text-ctp-text font-medium">{TIER_DESCRIPTIONS[tier]}</span>
                <span className={`font-mono text-sm ${getScoreColor(percentage)}`}>
                  {passed}/{total}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 pb-2">
                {results.map((test) => (
                  <div
                    key={test.name}
                    className="flex items-start justify-between py-3 border-b border-ctp-surface0 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-ctp-text">{test.name}</div>
                      <div className="text-xs text-ctp-subtext0 truncate mt-0.5">
                        {test.description}
                      </div>
                      <div className="text-xs text-ctp-subtext0 mt-1.5 flex items-center gap-3">
                        <code className="bg-ctp-surface0 px-1.5 py-0.5 rounded text-ctp-lavender">
                          {test.message_type}
                        </code>
                        {test.duration > 0 && (
                          <span className="flex items-center gap-1 text-ctp-overlay0">
                            <Timer className="h-3 w-3" />
                            {test.duration}ms
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <TestResultBadge result={test.result} />
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
