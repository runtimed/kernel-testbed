import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network } from 'lucide-react';
import { getLanguageIcon } from './LanguageIcons';
import type { KernelReport, TestCategory } from '@/types/report';
import { getPassedCount, getTotalCount, getTierScore, TIER_DESCRIPTIONS } from '@/types/report';

interface KernelCardProps {
  report: KernelReport;
  onClick?: () => void;
}

const TIERS: TestCategory[] = ['tier1_basic', 'tier2_interactive', 'tier3_rich_output', 'tier4_advanced'];

// Color based on score percentage
function getScoreColor(percentage: number): string {
  if (percentage >= 90) return 'text-ctp-green';
  if (percentage >= 70) return 'text-ctp-yellow';
  if (percentage >= 50) return 'text-ctp-peach';
  return 'text-ctp-red';
}

function getProgressColor(percentage: number): string {
  if (percentage >= 90) return 'bg-ctp-green';
  if (percentage >= 70) return 'bg-ctp-yellow';
  if (percentage >= 50) return 'bg-ctp-peach';
  return 'bg-ctp-red';
}

export function KernelCard({ report, onClick }: KernelCardProps) {
  const passed = getPassedCount(report);
  const total = getTotalCount(report);
  const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
  const LanguageIcon = getLanguageIcon(report.kernel_name, report.language);

  return (
    <Card
      className={`bg-ctp-mantle border-ctp-surface0 ${onClick ? 'cursor-pointer hover:border-ctp-mauve/50 hover:shadow-lg hover:shadow-ctp-mauve/5 transition-all' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-ctp-surface0">
              <LanguageIcon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg text-ctp-text">{report.kernel_name}</CardTitle>
              <CardDescription className="text-ctp-subtext0">
                {report.implementation || report.language}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-lg font-mono border-ctp-surface1 bg-ctp-surface0/50 ${getScoreColor(percentage)}`}
          >
            {passed}/{total}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Score progress bar */}
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-ctp-subtext0 flex items-center gap-1.5">
                <Network className="h-3.5 w-3.5" />
                Protocol {report.protocol_version}
              </span>
              <span className={`font-medium ${getScoreColor(percentage)}`}>{percentage}%</span>
            </div>
            <div className="h-2 bg-ctp-surface0 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor(percentage)} transition-all`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Tier breakdown */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            {TIERS.map((tier) => {
              const [tierPassed, tierTotal] = getTierScore(report, tier);
              if (tierTotal === 0) return null;
              const tierPercent = Math.round((tierPassed / tierTotal) * 100);
              return (
                <div key={tier} className="flex justify-between items-center">
                  <span className="text-ctp-subtext0 truncate text-xs">
                    {TIER_DESCRIPTIONS[tier]}
                  </span>
                  <span className={`font-mono text-xs ml-2 ${getScoreColor(tierPercent)}`}>
                    {tierPassed}/{tierTotal}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
