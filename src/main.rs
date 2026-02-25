//! CLI for running Jupyter kernel conformance tests.

use clap::Parser;
use jupyter_kernel_test::{
    all_tests, render_json, render_markdown, render_matrix_json, render_matrix_markdown,
    render_terminal, run_conformance_suite, ConformanceMatrix, TestCategory,
};
use std::path::PathBuf;
use std::time::Duration;

#[derive(Parser, Debug)]
#[command(name = "jupyter-kernel-test")]
#[command(about = "Jupyter kernel protocol conformance test suite")]
#[command(version)]
struct Args {
    /// Kernel names to test (e.g., python3, ir, rust)
    #[arg(value_name = "KERNEL")]
    kernels: Vec<String>,

    /// List available kernels and exit
    #[arg(long)]
    list_kernels: bool,

    /// Only run specified tier(s) (1-4), can be repeated
    #[arg(long = "tier", value_name = "N")]
    tiers: Vec<u8>,

    /// Output format
    #[arg(long, short, default_value = "terminal")]
    format: OutputFormat,

    /// Write output to file
    #[arg(long, short)]
    output: Option<PathBuf>,

    /// Per-test timeout in milliseconds
    #[arg(long, default_value = "10000")]
    timeout: u64,

    /// Verbose output
    #[arg(long, short)]
    verbose: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, clap::ValueEnum)]
enum OutputFormat {
    Terminal,
    Json,
    Markdown,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let args = Args::parse();

    // List kernels mode
    if args.list_kernels {
        list_kernels().await?;
        return Ok(());
    }

    // Determine which tiers to run
    let tiers: Vec<TestCategory> = if args.tiers.is_empty() {
        vec![
            TestCategory::Tier1Basic,
            TestCategory::Tier2Interactive,
            TestCategory::Tier3RichOutput,
            TestCategory::Tier4Advanced,
        ]
    } else {
        args.tiers
            .iter()
            .filter_map(|&n| match n {
                1 => Some(TestCategory::Tier1Basic),
                2 => Some(TestCategory::Tier2Interactive),
                3 => Some(TestCategory::Tier3RichOutput),
                4 => Some(TestCategory::Tier4Advanced),
                _ => {
                    eprintln!("Warning: invalid tier {}, ignoring", n);
                    None
                }
            })
            .collect()
    };

    if tiers.is_empty() {
        eprintln!("Error: no valid tiers specified");
        std::process::exit(1);
    }

    // Get kernels to test
    let kernel_names = if args.kernels.is_empty() {
        // Default to first available kernel
        let specs = runtimelib::list_kernelspecs().await;
        if specs.is_empty() {
            eprintln!("Error: no kernels found");
            std::process::exit(1);
        }
        vec![specs[0].kernel_name.clone()]
    } else {
        args.kernels.clone()
    };

    let timeout = Duration::from_millis(args.timeout);
    let tests = all_tests();

    // Run tests for each kernel
    let mut reports = Vec::new();

    for kernel_name in &kernel_names {
        if args.verbose {
            eprintln!("Testing kernel: {}", kernel_name);
        }

        let kernelspec = match runtimelib::find_kernelspec(kernel_name).await {
            Ok(spec) => spec,
            Err(e) => {
                eprintln!("Error finding kernel '{}': {}", kernel_name, e);
                continue;
            }
        };

        match run_conformance_suite(kernelspec, &tiers, timeout, &tests).await {
            Ok(report) => {
                if args.verbose {
                    eprintln!(
                        "  Completed: {}/{} passed",
                        report.passed(),
                        report.total()
                    );
                }
                reports.push(report);
            }
            Err(e) => {
                eprintln!("Error testing kernel '{}': {}", kernel_name, e);
            }
        }
    }

    if reports.is_empty() {
        eprintln!("No successful test runs");
        std::process::exit(1);
    }

    // Render output
    let output = match args.format {
        OutputFormat::Terminal => {
            if reports.len() == 1 {
                render_terminal(&reports[0])
            } else {
                let matrix = ConformanceMatrix::new(reports);
                // For terminal, show each report
                matrix
                    .reports
                    .iter()
                    .map(render_terminal)
                    .collect::<Vec<_>>()
                    .join("\n")
            }
        }
        OutputFormat::Json => {
            if reports.len() == 1 {
                render_json(&reports[0])
            } else {
                let matrix = ConformanceMatrix::new(reports);
                render_matrix_json(&matrix)
            }
        }
        OutputFormat::Markdown => {
            if reports.len() == 1 {
                render_markdown(&reports[0])
            } else {
                let matrix = ConformanceMatrix::new(reports);
                render_matrix_markdown(&matrix)
            }
        }
    };

    // Write output
    if let Some(path) = args.output {
        std::fs::write(&path, &output)?;
        eprintln!("Output written to: {}", path.display());
    } else {
        println!("{}", output);
    }

    Ok(())
}

async fn list_kernels() -> anyhow::Result<()> {
    let kernelspecs = runtimelib::list_kernelspecs().await;

    if kernelspecs.is_empty() {
        println!("No kernels found.");
        return Ok(());
    }

    println!("Available kernels:\n");
    println!("{:<20} {:<15} {}", "NAME", "LANGUAGE", "PATH");
    println!("{}", "-".repeat(60));

    for spec in kernelspecs {
        println!(
            "{:<20} {:<15} {}",
            spec.kernel_name,
            spec.kernelspec.language,
            spec.path.display()
        );
    }

    Ok(())
}
