/**
 * Markdown renderer functions that parallel React components
 *
 * These generate markdown output using the same data transformation logic
 * as the React components, enabling React → Markdown content generation.
 */

import type { ConformanceMatrix, KernelReport, TestCategory, TestRecord } from '@/types/report';
import {
  getStatusEmoji,
  getPassedCount,
  getTotalCount,
  getScore,
  getTierScore,
  getTierResults,
  TIER_DESCRIPTIONS,
  hasStartupError,
} from '@/types/report';
import { getKernelMetadata } from './kernel-metadata';

const TIERS: TestCategory[] = ['tier1_basic', 'tier2_interactive', 'tier3_rich_output', 'tier4_advanced'];

/**
 * Render a score with optional checkmark for perfect scores
 */
function renderScore(passed: number, total: number): string {
  const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
  const perfect = passed === total && total > 0;
  return `${passed}/${total} (${percentage}%)${perfect ? ' ✅' : ''}`;
}

/**
 * Group failures by their reason pattern (mirrors FailureSummary component)
 */
function groupFailuresByReason(report: KernelReport): Map<string, TestRecord[]> {
  const groups = new Map<string, TestRecord[]>();

  for (const test of report.results) {
    if (test.result.status === 'fail') {
      const reason = test.result.reason || 'Unknown error';
      const key = reason.includes('Timeout') ? 'Timeout' : reason;
      const existing = groups.get(key) || [];
      existing.push(test);
      groups.set(key, existing);
    }
  }

  return groups;
}

/**
 * Render failure summary (mirrors FailureSummary component)
 */
export function renderFailureSummaryMarkdown(report: KernelReport): string {
  if (hasStartupError(report)) {
    return [
      '### ⚠️ Kernel Failed During Startup',
      '',
      'The kernel could not complete initialization. No tests were run.',
      '',
      '```',
      report.startup_error,
      '```',
      '',
      'This usually indicates a fundamental protocol compatibility issue.',
    ].join('\n');
  }

  const passed = getPassedCount(report);
  const total = getTotalCount(report);
  const failed = total - passed;

  if (failed === 0) {
    return `### ✅ All Tests Passing\n\n${renderScore(passed, total)}`;
  }

  const failureGroups = groupFailuresByReason(report);
  const sortedGroups = Array.from(failureGroups.entries()).sort(
    (a, b) => b[1].length - a[1].length
  );

  const lines = [
    `### ${failed} Test${failed !== 1 ? 's' : ''} Failing`,
    '',
    `${passed}/${total} passing (${Math.round((passed / total) * 100)}%)`,
    '',
  ];

  for (const [reason, tests] of sortedGroups) {
    lines.push(`- **${reason}** (${tests.length})`);
    const testNames = tests.slice(0, 3).map((t) => t.name);
    if (tests.length > 3) {
      testNames.push(`+${tests.length - 3} more`);
    }
    lines.push(`  - ${testNames.join(', ')}`);
  }

  return lines.join('\n');
}

/**
 * Render tier breakdown (mirrors TierBreakdown component)
 */
export function renderTierBreakdownMarkdown(report: KernelReport): string {
  const lines: string[] = ['### Test Results by Tier', ''];

  for (const tier of TIERS) {
    const results = getTierResults(report, tier);
    if (results.length === 0) continue;

    const [passed, total] = getTierScore(report, tier);

    lines.push(`#### ${TIER_DESCRIPTIONS[tier]} (${passed}/${total})`);
    lines.push('');

    for (const test of results) {
      const emoji = getStatusEmoji(test.result.status);
      lines.push(`${emoji} **${test.name}** - ${test.description}`);

      if (test.result.status === 'fail' && test.result.reason) {
        lines.push(`   _${test.result.reason}_`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Render kernel card (mirrors KernelCard component)
 */
export function renderKernelCardMarkdown(report: KernelReport): string {
  const passed = getPassedCount(report);
  const total = getTotalCount(report);
  const metadata = getKernelMetadata(report.kernel_name);

  const lines: string[] = [
    `## ${report.kernel_name}`,
    '',
  ];

  // Implementation and metadata
  const impl = metadata?.implementation || report.implementation || report.language;
  lines.push(`**${impl}** | ${report.language} | Protocol ${report.protocol_version}`);
  lines.push('');

  if (metadata?.repository) {
    lines.push(`Repository: ${metadata.repository}`);
    lines.push('');
  }

  // Overall score
  lines.push(`**Score: ${renderScore(passed, total)}**`);
  lines.push('');

  // Tier summary
  lines.push('| Tier | Score |');
  lines.push('|------|-------|');
  for (const tier of TIERS) {
    const [tierPassed, tierTotal] = getTierScore(report, tier);
    if (tierTotal === 0) continue;
    const perfect = tierPassed === tierTotal ? ' ✅' : '';
    lines.push(`| ${TIER_DESCRIPTIONS[tier]} | ${tierPassed}/${tierTotal}${perfect} |`);
  }
  lines.push('');

  return lines.join('\n');
}

/**
 * Render full kernel detail page (mirrors kernel/[name]/page.tsx)
 */
export function renderKernelDetailMarkdown(report: KernelReport): string {
  const passed = getPassedCount(report);
  const total = getTotalCount(report);
  const metadata = getKernelMetadata(report.kernel_name);

  const lines: string[] = [
    `# ${report.kernel_name} - Protocol Conformance`,
    '',
  ];

  // Header info
  const impl = metadata?.implementation || report.implementation || report.language;
  lines.push(`**${impl}** (${report.language}) | Protocol ${report.protocol_version}`);
  lines.push('');

  if (metadata?.repository) {
    lines.push(`Repository: ${metadata.repository}`);
    lines.push('');
  }

  if (metadata?.description) {
    lines.push(`> ${metadata.description}`);
    lines.push('');
  }

  lines.push(`**Overall Score: ${renderScore(passed, total)}**`);
  lines.push('');

  // Failure summary
  lines.push(renderFailureSummaryMarkdown(report));
  lines.push('');

  // Tier breakdown (only if kernel started successfully)
  if (!hasStartupError(report)) {
    lines.push(renderTierBreakdownMarkdown(report));
  }

  return lines.join('\n');
}

/**
 * Render summary matrix table (mirrors HomeContent/SummaryTable)
 */
export function renderSummaryMatrixMarkdown(matrix: ConformanceMatrix): string {
  const sortedReports = [...matrix.reports].sort((a, b) => {
    const aScore = getScore(a);
    const bScore = getScore(b);
    return bScore - aScore;
  });

  const lines: string[] = [
    '# Jupyter Kernel Protocol Conformance',
    '',
    `Testing ${matrix.reports.length} kernels against the Jupyter Messaging Protocol.`,
    '',
    '| Kernel | Implementation | Score | Tier 1 | Tier 2 | Tier 3 | Tier 4 |',
    '|--------|---------------|-------|--------|--------|--------|--------|',
  ];

  for (const report of sortedReports) {
    const metadata = getKernelMetadata(report.kernel_name);
    const impl = metadata?.implementation || report.implementation || '-';
    const passed = getPassedCount(report);
    const total = getTotalCount(report);
    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;

    const tierScores = TIERS.map((tier) => {
      const [p, t] = getTierScore(report, tier);
      if (t === 0) return '-';
      return `${p}/${t}`;
    });

    lines.push(
      `| ${report.kernel_name} | ${impl} | ${percentage}% | ${tierScores.join(' | ')} |`
    );
  }

  lines.push('');
  lines.push(`_Generated: ${new Date(matrix.generated_at).toISOString().split('T')[0]}_`);

  return lines.join('\n');
}

/**
 * Render llms.txt overview file
 */
export function renderLlmsTxt(matrix: ConformanceMatrix): string {
  const sortedReports = [...matrix.reports].sort((a, b) => {
    const aScore = getScore(a);
    const bScore = getScore(b);
    return bScore - aScore;
  });

  const lines: string[] = [
    '# Jupyter Kernel Protocol Conformance Testbed',
    '',
    'Automated protocol compliance testing for Jupyter kernels against the',
    'Jupyter Messaging Protocol specification.',
    '',
    'https://runtimed.github.io/kernel-testbed/',
    '',
    `## Tested Kernels (${matrix.reports.length})`,
    '',
    '| Kernel | Implementation | Language | Score |',
    '|--------|---------------|----------|-------|',
  ];

  for (const report of sortedReports) {
    const metadata = getKernelMetadata(report.kernel_name);
    const impl = metadata?.implementation || report.implementation || '-';
    const passed = getPassedCount(report);
    const total = getTotalCount(report);
    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
    const perfect = passed === total && total > 0 ? ' ✅' : '';

    lines.push(`| ${report.kernel_name} | ${impl} | ${report.language} | ${percentage}%${perfect} |`);
  }

  lines.push('');
  lines.push('## Links');
  lines.push('');
  lines.push('- Full results: /kernel-testbed/llms-full.txt');
  lines.push('- Summary matrix: /kernel-testbed/index.md');
  lines.push('- Per-kernel reports: /kernel-testbed/kernel/{name}.md');
  lines.push('');
  lines.push(`_Generated: ${new Date(matrix.generated_at).toISOString().split('T')[0]}_`);

  return lines.join('\n');
}

/**
 * Render llms-full.txt with all kernel reports concatenated
 */
export function renderLlmsFullTxt(matrix: ConformanceMatrix): string {
  const sortedReports = [...matrix.reports].sort((a, b) => {
    const aScore = getScore(a);
    const bScore = getScore(b);
    return bScore - aScore;
  });

  const lines: string[] = [
    '# Jupyter Kernel Protocol Conformance - Full Results',
    '',
    `Testing ${matrix.reports.length} kernels against the Jupyter Messaging Protocol.`,
    '',
    '---',
    '',
  ];

  for (const report of sortedReports) {
    lines.push(renderKernelDetailMarkdown(report));
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  lines.push(`_Generated: ${new Date(matrix.generated_at).toISOString().split('T')[0]}_`);

  return lines.join('\n');
}
