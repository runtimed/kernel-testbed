/**
 * TypeScript types matching the Rust types in src/types.rs
 */

/** Classification of why a test failed, to help identify root cause */
export type FailureKind =
  | 'timeout'
  | 'protocol_error'
  | 'unexpected_message_type'
  | 'unexpected_content'
  | 'kernel_error'
  | 'harness_error';

/** Human-readable hints for failure kinds */
export const FAILURE_HINTS: Record<FailureKind, string> = {
  timeout: 'Kernel may be slow to start or not responding. Try increasing timeout.',
  protocol_error: 'Message parsing failed. Check runtimed protocol crate for compatibility.',
  unexpected_message_type: 'Kernel sent wrong message type. Check kernel implementation.',
  unexpected_content: 'Response format differs from spec. Check kernel implementation.',
  kernel_error: 'Kernel reported an error. Check kernel logs for details.',
  harness_error: 'Test harness issue. Check test setup and dependencies.',
};

/** Likely source of the failure */
export const FAILURE_SOURCES: Record<FailureKind, string> = {
  timeout: 'kernel',
  protocol_error: 'runtimed',
  unexpected_message_type: 'kernel',
  unexpected_content: 'kernel',
  kernel_error: 'kernel',
  harness_error: 'testbed',
};

/** Categories of protocol conformance tests */
export type TestCategory =
  | 'tier1_basic'
  | 'tier2_interactive'
  | 'tier3_rich_output'
  | 'tier4_advanced';

/** Human-readable tier descriptions */
export const TIER_DESCRIPTIONS: Record<TestCategory, string> = {
  tier1_basic: 'Basic Protocol',
  tier2_interactive: 'Interactive Features',
  tier3_rich_output: 'Rich Output',
  tier4_advanced: 'Advanced Features',
};

/** Tier numbers for sorting */
export const TIER_NUMBERS: Record<TestCategory, number> = {
  tier1_basic: 1,
  tier2_interactive: 2,
  tier3_rich_output: 3,
  tier4_advanced: 4,
};

/** Status of a test result */
export type TestStatus = 'pass' | 'fail' | 'unsupported' | 'timeout' | 'partial_pass';

/** Result of a single test execution (tagged union) */
export type TestResult =
  | { status: 'pass' }
  | { status: 'fail'; reason: string; kind?: FailureKind }
  | { status: 'unsupported' }
  | { status: 'timeout' }
  | { status: 'partial_pass'; score: number; notes: string };

/** Get the status emoji for a test result */
export function getStatusEmoji(status: TestStatus): string {
  switch (status) {
    case 'pass':
      return '✅';
    case 'fail':
      return '❌';
    case 'unsupported':
      return '⏭️';
    case 'timeout':
      return '⏱️';
    case 'partial_pass':
      return '⚠️';
  }
}

/** Record of a single test execution */
export interface TestRecord {
  /** Name of the test */
  name: string;
  /** Category/tier of the test */
  category: TestCategory;
  /** Human-readable description */
  description: string;
  /** The primary protocol message type being tested */
  message_type: string;
  /** Result of the test */
  result: TestResult;
  /** How long the test took in milliseconds */
  duration: number;
}

/** Report for a single kernel's conformance test run */
export interface KernelReport {
  /** Name of the kernel (e.g., "python3", "rust") */
  kernel_name: string;
  /** Language the kernel executes */
  language: string;
  /** Implementation name (e.g., "ipykernel") */
  implementation: string;
  /** Protocol version reported by kernel */
  protocol_version: string;
  /** Individual test results */
  results: TestRecord[];
  /** When the test run started (ISO 8601) */
  timestamp: string;
  /** Total duration of test run in milliseconds */
  total_duration: number;
}

/** Matrix of conformance results across multiple kernels */
export interface ConformanceMatrix {
  /** Reports from each kernel tested */
  reports: KernelReport[];
  /** When the matrix was generated (ISO 8601) */
  generated_at: string;
  /** Git commit SHA (added by CI) */
  commit_sha?: string;
}

/** Helper functions for working with reports */

export function getPassedCount(report: KernelReport): number {
  return report.results.filter((r) => r.result.status === 'pass' || r.result.status === 'partial_pass').length;
}

export function getTotalCount(report: KernelReport): number {
  return report.results.length;
}

export function getScore(report: KernelReport): number {
  const total = getTotalCount(report);
  if (total === 0) return 0;
  return getPassedCount(report) / total;
}

export function getTierResults(report: KernelReport, tier: TestCategory): TestRecord[] {
  return report.results.filter((r) => r.category === tier);
}

export function getTierScore(report: KernelReport, tier: TestCategory): [number, number] {
  const results = getTierResults(report, tier);
  const passed = results.filter((r) => r.result.status === 'pass' || r.result.status === 'partial_pass').length;
  return [passed, results.length];
}

export function getAllTestNames(matrix: ConformanceMatrix): string[] {
  const names = new Set<string>();
  for (const report of matrix.reports) {
    for (const test of report.results) {
      names.add(test.name);
    }
  }
  return Array.from(names).sort();
}
