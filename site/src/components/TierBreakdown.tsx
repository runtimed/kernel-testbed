import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { TestResultBadge } from './TestResultBadge';
import type { KernelReport, TestCategory } from '@/types/report';
import { getTierResults, getTierScore, TIER_DESCRIPTIONS } from '@/types/report';

interface TierBreakdownProps {
  report: KernelReport;
}

const TIERS: TestCategory[] = ['tier1_basic', 'tier2_interactive', 'tier3_rich_output', 'tier4_advanced'];

export function TierBreakdown({ report }: TierBreakdownProps) {
  return (
    <Accordion type="multiple" className="w-full" defaultValue={['tier1_basic']}>
      {TIERS.map((tier) => {
        const results = getTierResults(report, tier);
        if (results.length === 0) return null;

        const [passed, total] = getTierScore(report, tier);

        return (
          <AccordionItem key={tier} value={tier}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <span>{TIER_DESCRIPTIONS[tier]}</span>
                <span className="font-mono text-sm text-muted-foreground">
                  {passed}/{total}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pl-4">
                {results.map((test) => (
                  <div
                    key={test.name}
                    className="flex items-start justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{test.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {test.description}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Message: <code className="bg-muted px-1 rounded">{test.message_type}</code>
                        {test.duration > 0 && (
                          <span className="ml-2">({test.duration}ms)</span>
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
