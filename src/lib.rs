//! Jupyter kernel protocol conformance test suite.
//!
//! This crate provides a comprehensive test suite for validating Jupyter kernel
//! implementations against the messaging protocol specification.
//!
//! # Usage
//!
//! ```bash
//! # List available kernels
//! jupyter-kernel-test --list-kernels
//!
//! # Test a specific kernel
//! jupyter-kernel-test python3
//!
//! # Test only specific tiers
//! jupyter-kernel-test python3 --tier 1 --tier 2
//!
//! # Output as JSON
//! jupyter-kernel-test python3 --format json
//! ```

pub mod harness;
pub mod report;
pub mod snippets;
pub mod tests;
pub mod types;

pub use harness::{run_conformance_suite, ConformanceTest, KernelUnderTest};
pub use report::{render_json, render_markdown, render_matrix_json, render_matrix_markdown, render_terminal};
pub use snippets::LanguageSnippets;
pub use tests::all_tests;
pub use types::{ConformanceMatrix, KernelReport, TestCategory, TestRecord, TestResult};
