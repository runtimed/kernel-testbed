import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { KernelReport, TestCategory } from '@/types/report';
import { getPassedCount, getTotalCount, getTierScore, TIER_DESCRIPTIONS } from '@/types/report';

interface KernelCardProps {
  report: KernelReport;
  onClick?: () => void;
}

const TIERS: TestCategory[] = ['tier1_basic', 'tier2_interactive', 'tier3_rich_output', 'tier4_advanced'];

export function KernelCard({ report, onClick }: KernelCardProps) {
  const passed = getPassedCount(report);
  const total = getTotalCount(report);
  const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;

  // Determine badge color based on score
  let scoreVariant: 'default' | 'secondary' | 'destructive' = 'default';
  if (percentage < 50) {
    scoreVariant = 'destructive';
  } else if (percentage < 80) {
    scoreVariant = 'secondary';
  }

  return (
    <Card
      className={onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{report.kernel_name}</CardTitle>
            <CardDescription>
              {report.implementation} ({report.language})
            </CardDescription>
          </div>
          <Badge variant={scoreVariant} className="text-lg font-mono">
            {passed}/{total}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Score progress bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Protocol {report.protocol_version}</span>
              <span className="font-medium">{percentage}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Tier breakdown */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {TIERS.map((tier) => {
              const [tierPassed, tierTotal] = getTierScore(report, tier);
              if (tierTotal === 0) return null;
              return (
                <div key={tier} className="flex justify-between">
                  <span className="text-muted-foreground truncate">
                    {TIER_DESCRIPTIONS[tier]}
                  </span>
                  <span className="font-mono ml-2">
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
