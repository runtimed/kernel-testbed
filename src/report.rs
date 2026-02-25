//! Report rendering for different output formats.

use crate::types::{ConformanceMatrix, KernelReport, TestCategory, TestResult};

/// Render a report to terminal with colors.
pub fn render_terminal(report: &KernelReport) -> String {
    let mut output = String::new();

    // Header
    output.push_str(&format!(
        "\n{} Conformance Report: {} ({})\n",
        "=".repeat(60),
        report.kernel_name,
        report.implementation
    ));
    output.push_str(&format!(
        "Language: {} | Protocol: {} | Duration: {:?}\n",
        report.language, report.protocol_version, report.total_duration
    ));
    output.push_str(&format!("{}\n\n", "=".repeat(60)));

    // Results by tier
    for tier in [
        TestCategory::Tier1Basic,
        TestCategory::Tier2Interactive,
        TestCategory::Tier3RichOutput,
        TestCategory::Tier4Advanced,
    ] {
        let tier_results = report.tier_results(tier);
        if tier_results.is_empty() {
            continue;
        }

        let (passed, total) = report.tier_score(tier);
        output.push_str(&format!(
            "Tier {}: {} ({}/{})\n",
            tier.tier_number(),
            tier.description(),
            passed,
            total
        ));
        output.push_str(&format!("{}\n", "-".repeat(50)));

        for record in tier_results {
            let symbol = record.result.symbol();
            let emoji = record.result.emoji();
            output.push_str(&format!(
                "  {} {} {} ({:?})\n",
                emoji, symbol, record.name, record.duration
            ));

            // Show failure reason
            if let TestResult::Fail { reason, .. } = &record.result {
                output.push_str(&format!("      Reason: {}\n", reason));
            }
            if let TestResult::PartialPass { score, notes } = &record.result {
                output.push_str(&format!("      Score: {:.0}% - {}\n", score * 100.0, notes));
            }
        }
        output.push('\n');
    }

    // Summary
    output.push_str(&format!("{}\n", "=".repeat(60)));
    output.push_str(&format!(
        "Total: {}/{} ({:.0}%)\n",
        report.passed(),
        report.total(),
        report.score() * 100.0
    ));

    output
}

/// Render a report as JSON.
pub fn render_json(report: &KernelReport) -> String {
    serde_json::to_string_pretty(report).unwrap_or_else(|e| format!("{{\"error\": \"{}\"}}", e))
}

/// Render a matrix as JSON.
pub fn render_matrix_json(matrix: &ConformanceMatrix) -> String {
    serde_json::to_string_pretty(matrix).unwrap_or_else(|e| format!("{{\"error\": \"{}\"}}", e))
}

/// Render a single report as markdown.
pub fn render_markdown(report: &KernelReport) -> String {
    let mut output = String::new();

    output.push_str(&format!(
        "# {} Conformance Report\n\n",
        report.kernel_name
    ));
    output.push_str(&format!(
        "- **Implementation**: {}\n",
        report.implementation
    ));
    output.push_str(&format!("- **Language**: {}\n", report.language));
    output.push_str(&format!(
        "- **Protocol Version**: {}\n",
        report.protocol_version
    ));
    output.push_str(&format!(
        "- **Score**: {}/{} ({:.0}%)\n\n",
        report.passed(),
        report.total(),
        report.score() * 100.0
    ));

    // Results table
    output.push_str("| Test | Tier | Result | Duration |\n");
    output.push_str("|------|------|--------|----------|\n");

    for record in &report.results {
        let result_str = match &record.result {
            TestResult::Pass => "PASS".to_string(),
            TestResult::Fail { reason, .. } => format!("FAIL: {}", truncate(reason, 30)),
            TestResult::Unsupported => "SKIP".to_string(),
            TestResult::Timeout => "TIMEOUT".to_string(),
            TestResult::PartialPass { score, .. } => format!("PARTIAL ({:.0}%)", score * 100.0),
        };

        output.push_str(&format!(
            "| {} | {} | {} | {:?} |\n",
            record.name,
            record.category.tier_number(),
            result_str,
            record.duration
        ));
    }

    output
}

/// Render a matrix as a markdown comparison table.
pub fn render_matrix_markdown(matrix: &ConformanceMatrix) -> String {
    if matrix.reports.is_empty() {
        return "No reports in matrix.".to_string();
    }

    let mut output = String::new();

    output.push_str("# Kernel Conformance Matrix\n\n");
    output.push_str(&format!(
        "Generated: {}\n\n",
        matrix.generated_at.format("%Y-%m-%d %H:%M:%S UTC")
    ));

    // Get all test names
    let test_names = matrix.all_test_names();

    // Header row
    output.push_str("| Test |");
    for report in &matrix.reports {
        output.push_str(&format!(" {} |", report.kernel_name));
    }
    output.push('\n');

    // Separator row
    output.push_str("|------|");
    for _ in &matrix.reports {
        output.push_str("------|");
    }
    output.push('\n');

    // Data rows
    for test_name in test_names {
        output.push_str(&format!("| {} |", test_name));
        for report in &matrix.reports {
            let result = report
                .results
                .iter()
                .find(|r| r.name == test_name)
                .map(|r| r.result.emoji())
                .unwrap_or("-");
            output.push_str(&format!(" {} |", result));
        }
        output.push('\n');
    }

    // Summary row
    output.push_str("| **Score** |");
    for report in &matrix.reports {
        output.push_str(&format!(
            " {}/{} |",
            report.passed(),
            report.total()
        ));
    }
    output.push('\n');

    output
}

fn truncate(s: &str, max_len: usize) -> String {
    if s.len() <= max_len {
        s.to_string()
    } else {
        format!("{}...", &s[..max_len - 3])
    }
}
