# kernel-testbed

Jupyter kernel protocol conformance test suite.

## Overview

This tool tests Jupyter kernels against the messaging protocol specification, producing scorecards showing which protocol features each kernel supports.

## Installation

```bash
cargo install --path .
```

## Usage

```bash
# List available kernels
jupyter-kernel-test --list-kernels

# Test a specific kernel
jupyter-kernel-test python3

# Test only specific tiers
jupyter-kernel-test python3 --tier 1 --tier 2

# Output as JSON
jupyter-kernel-test python3 --format json

# Output as Markdown
jupyter-kernel-test python3 --format markdown

# Save results to file
jupyter-kernel-test python3 --format json --output report.json
```

## Test Tiers

Tests are organized into 4 tiers:

**Tier 1 - Basic Protocol (9 tests)**
- Heartbeat, kernel_info, execute, status lifecycle, shutdown

**Tier 2 - Interactive Features (7 tests)**
- Completion, inspection, is_complete, history, comm_info, error handling

**Tier 3 - Rich Output (2 tests)**
- display_data, execute_result

**Tier 4 - Advanced Features (5 tests)**
- stdin, comms lifecycle, interrupt, execution count, parent_header correlation

## Example Output

```
============================================================
Conformance Report: python3 (ipython)
Language: python | Protocol: 5.3
============================================================

Tier 1: Basic Protocol (9/9)
--------------------------------------------------
  ✅ PASS heartbeat_responds
  ✅ PASS kernel_info_reply_valid
  ✅ PASS execute_stdout
  ...

Total: 20/23 (87%)
```

## License

BSD-3-Clause
