//! Types for representing test results and reports.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::time::Duration;

/// Categories of protocol conformance tests, organized by complexity.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum TestCategory {
    /// Basic protocol operations every kernel must support
    #[serde(rename = "tier1_basic")]
    Tier1Basic,
    /// Interactive features like completion and inspection
    #[serde(rename = "tier2_interactive")]
    Tier2Interactive,
    /// Rich output: display_data, execute_result
    #[serde(rename = "tier3_rich_output")]
    Tier3RichOutput,
    /// Advanced features: stdin, comms, interrupt, debug
    #[serde(rename = "tier4_advanced")]
    Tier4Advanced,
}

impl TestCategory {
    pub fn tier_number(&self) -> u8 {
        match self {
            TestCategory::Tier1Basic => 1,
            TestCategory::Tier2Interactive => 2,
            TestCategory::Tier3RichOutput => 3,
            TestCategory::Tier4Advanced => 4,
        }
    }

    pub fn description(&self) -> &'static str {
        match self {
            TestCategory::Tier1Basic => "Basic Protocol",
            TestCategory::Tier2Interactive => "Interactive Features",
            TestCategory::Tier3RichOutput => "Rich Output",
            TestCategory::Tier4Advanced => "Advanced Features",
        }
    }
}

/// Result of a single test execution.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "status", rename_all = "snake_case")]
pub enum TestResult {
    /// Test passed completely
    Pass,
    /// Test failed with a reason
    Fail { reason: String },
    /// Kernel explicitly doesn't support this feature
    Unsupported,
    /// Kernel didn't respond within timeout
    Timeout,
    /// Partial success with notes
    PartialPass { score: f32, notes: String },
}

impl TestResult {
    pub fn is_pass(&self) -> bool {
        matches!(self, TestResult::Pass | TestResult::PartialPass { .. })
    }

    pub fn symbol(&self) -> &'static str {
        match self {
            TestResult::Pass => "PASS",
            TestResult::Fail { .. } => "FAIL",
            TestResult::Unsupported => "SKIP",
            TestResult::Timeout => "TIME",
            TestResult::PartialPass { .. } => "PART",
        }
    }

    pub fn emoji(&self) -> &'static str {
        match self {
            TestResult::Pass => "✅",
            TestResult::Fail { .. } => "❌",
            TestResult::Unsupported => "⏭️",
            TestResult::Timeout => "⏱️",
            TestResult::PartialPass { .. } => "⚠️",
        }
    }
}

/// Record of a single test execution.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestRecord {
    /// Name of the test
    pub name: String,
    /// Category/tier of the test
    pub category: TestCategory,
    /// Result of the test
    pub result: TestResult,
    /// How long the test took
    #[serde(with = "duration_millis")]
    pub duration: Duration,
}

/// Report for a single kernel's conformance test run.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KernelReport {
    /// Name of the kernel (e.g., "python3", "ir", "rust")
    pub kernel_name: String,
    /// Language the kernel executes
    pub language: String,
    /// Implementation name (e.g., "ipykernel", "IRkernel")
    pub implementation: String,
    /// Protocol version reported by kernel
    pub protocol_version: String,
    /// Individual test results
    pub results: Vec<TestRecord>,
    /// When the test run started
    pub timestamp: DateTime<Utc>,
    /// Total duration of test run
    #[serde(with = "duration_millis")]
    pub total_duration: Duration,
}

impl KernelReport {
    /// Count of passed tests
    pub fn passed(&self) -> usize {
        self.results.iter().filter(|r| r.result.is_pass()).count()
    }

    /// Total number of tests run
    pub fn total(&self) -> usize {
        self.results.len()
    }

    /// Score as a fraction
    pub fn score(&self) -> f32 {
        if self.total() == 0 {
            0.0
        } else {
            self.passed() as f32 / self.total() as f32
        }
    }

    /// Get results for a specific tier
    pub fn tier_results(&self, tier: TestCategory) -> Vec<&TestRecord> {
        self.results.iter().filter(|r| r.category == tier).collect()
    }

    /// Tier score as "passed/total"
    pub fn tier_score(&self, tier: TestCategory) -> (usize, usize) {
        let tier_results = self.tier_results(tier);
        let passed = tier_results.iter().filter(|r| r.result.is_pass()).count();
        (passed, tier_results.len())
    }
}

/// Matrix of conformance results across multiple kernels.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConformanceMatrix {
    /// Reports from each kernel tested
    pub reports: Vec<KernelReport>,
    /// When the matrix was generated
    pub generated_at: DateTime<Utc>,
}

impl ConformanceMatrix {
    pub fn new(reports: Vec<KernelReport>) -> Self {
        Self {
            reports,
            generated_at: Utc::now(),
        }
    }

    /// Get all unique test names across all reports
    pub fn all_test_names(&self) -> Vec<&str> {
        let mut names: Vec<&str> = self
            .reports
            .iter()
            .flat_map(|r| r.results.iter().map(|t| t.name.as_str()))
            .collect();
        names.sort();
        names.dedup();
        names
    }
}

/// Serde helper for Duration as milliseconds
mod duration_millis {
    use serde::{Deserialize, Deserializer, Serialize, Serializer};
    use std::time::Duration;

    pub fn serialize<S>(duration: &Duration, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        duration.as_millis().serialize(serializer)
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<Duration, D::Error>
    where
        D: Deserializer<'de>,
    {
        let millis = u64::deserialize(deserializer)?;
        Ok(Duration::from_millis(millis))
    }
}
