//! Protocol conformance tests organized by tier.

use crate::harness::{ConformanceTest, KernelUnderTest};
use crate::types::{TestCategory, TestResult};
use jupyter_protocol::messaging::{
    CommInfoRequest, CompleteRequest, ExecutionState, HistoryRequest, InspectRequest,
    InterruptRequest, IsCompleteReplyStatus, IsCompleteRequest, JupyterMessageContent, ReplyStatus,
    ShutdownRequest, Status, StreamContent,
};
use std::future::Future;
use std::pin::Pin;

/// Type alias for test functions.
pub type TestFn = for<'a> fn(
    &'a mut KernelUnderTest,
) -> Pin<Box<dyn Future<Output = TestResult> + Send + 'a>>;

// =============================================================================
// TIER 1: BASIC PROTOCOL
// =============================================================================

fn test_heartbeat_responds(
    kernel: &mut KernelUnderTest,
) -> Pin<Box<dyn Future<Output = TestResult> + Send + '_>> {
    Box::pin(async move {
        match kernel.heartbeat().await {
            Ok(()) => TestResult::Pass,
            Err(e) => TestResult::Fail {
                reason: e.to_string(),
            },
        }
    })
}

fn test_kernel_info_reply_valid(
    kernel: &mut KernelUnderTest,
) -> Pin<Box<dyn Future<Output = TestResult> + Send + '_>> {
    Box::pin(async move {
        match kernel.kernel_info() {
            Some(info) => {
                if info.status == ReplyStatus::Ok {
                    TestResult::Pass
                } else {
                    TestResult::Fail {
                        reason: format!("kernel_info status: {:?}", info.status),
                    }
                }
            }
            None => TestResult::Fail {
                reason: "No kernel_info received".to_string(),
            },
        }
    })
}

fn test_kernel_info_has_language_info(
    kernel: &mut KernelUnderTest,
) -> Pin<Box<dyn Future<Output = TestResult> + Send + '_>> {
    Box::pin(async move {
        match kernel.kernel_info() {
            Some(info) => {
                if !info.language_info.name.is_empty() {
                    TestResult::Pass
                } else {
                    TestResult::Fail {
                        reason: "language_info.name is empty".to_string(),
                    }
                }
            }
            None => TestResult::Fail {
                reason: "No kernel_info received".to_string(),
            },
        }
    })
}

fn test_kernel_info_has_protocol_version(
    kernel: &mut KernelUnderTest,
) -> Pin<Box<dyn Future<Output = TestResult> + Send + '_>> {
    Box::pin(async move {
        match kernel.kernel_info() {
            Some(info) => {
                if !info.protocol_version.is_empty() {
                    TestResult::Pass
                } else {
                    TestResult::Fail {
                        reason: "protocol_version is empty".to_string(),
                    }
                }
            }
            None => TestResult::Fail {
                reason: "No kernel_info received".to_string(),
            },
        }
    })
}

fn test_execute_stdout(
    kernel: &mut KernelUnderTest,
) -> Pin<Box<dyn Future<Output = TestResult> + Send + '_>> {
    Box::pin(async move {
        let code = kernel.snippets().print_hello.to_string();
        match kernel.execute_and_collect(&code).await {
            Ok((_, iopub)) => {
                let has_stdout = iopub.iter().any(|msg| {
                    matches!(
                        &msg.content,
                        JupyterMessageContent::StreamContent(StreamContent {
                            name: jupyter_protocol::messaging::Stdio::Stdout,
                            text,
                        }) if text.contains("hello")
                    )
                });
                if has_stdout {
                    TestResult::Pass
                } else {
                    TestResult::Fail {
                        reason: "No stdout containing 'hello'".to_string(),
                    }
                }
            }
            Err(e) => TestResult::Fail {
                reason: e.to_string(),
            },
        }
    })
}

fn test_execute_reply_ok(
    kernel: &mut KernelUnderTest,
) -> Pin<Box<dyn Future<Output = TestResult> + Send + '_>> {
    Box::pin(async move {
        let code = kernel.snippets().complete_code.to_string();
        match kernel.execute_and_collect(&code).await {
            Ok((reply, _)) => {
                if let JupyterMessageContent::ExecuteReply(er) = reply.content {
                    if er.status == ReplyStatus::Ok {
                        TestResult::Pass
                    } else {
                        TestResult::Fail {
                            reason: format!("execute_reply status: {:?}", er.status),
                        }
                    }
                } else {
                    TestResult::Fail {
                        reason: format!(
                            "Expected execute_reply, got {:?}",
                            reply.content.message_type()
                        ),
                    }
                }
            }
            Err(e) => TestResult::Fail {
                reason: e.to_string(),
            },
        }
    })
}

fn test_status_busy_idle_lifecycle(
    kernel: &mut KernelUnderTest,
) -> Pin<Box<dyn Future<Output = TestResult> + Send + '_>> {
    Box::pin(async move {
        let code = kernel.snippets().complete_code.to_string();
        match kernel.execute_and_collect(&code).await {
            Ok((_, iopub)) => {
                let statuses: Vec<_> = iopub
                    .iter()
                    .filter_map(|msg| {
                        if let JupyterMessageContent::Status(Status { execution_state }) =
                            &msg.content
                        {
                            Some(execution_state.clone())
                        } else {
                            None
                        }
                    })
                    .collect();

                let has_busy = statuses.iter().any(|s| *s == ExecutionState::Busy);
                let has_idle = statuses.iter().any(|s| *s == ExecutionState::Idle);

                if has_busy && has_idle {
                    let busy_idx = statuses.iter().position(|s| *s == ExecutionState::Busy);
                    let idle_idx = statuses.iter().position(|s| *s == ExecutionState::Idle);
                    if busy_idx < idle_idx {
                        TestResult::Pass
                    } else {
                        TestResult::Fail {
                            reason: "idle came before busy".to_string(),
                        }
                    }
                } else {
                    TestResult::Fail {
                        reason: format!("Missing status: busy={}, idle={}", has_busy, has_idle),
                    }
                }
            }
            Err(e) => TestResult::Fail {
                reason: e.to_string(),
            },
        }
    })
}

fn test_execute_input_broadcast(
    kernel: &mut KernelUnderTest,
) -> Pin<Box<dyn Future<Output = TestResult> + Send + '_>> {
    Box::pin(async move {
        let code = kernel.snippets().complete_code.to_string();
        match kernel.execute_and_collect(&code).await {
            Ok((_, iopub)) => {
                let has_execute_input = iopub
                    .iter()
                    .any(|msg| matches!(&msg.content, JupyterMessageContent::ExecuteInput(_)));
                if has_execute_input {
                    TestResult::Pass
                } else {
                    TestResult::Fail {
                        reason: "No execute_input broadcast".to_string(),
                    }
                }
            }
            Err(e) => TestResult::Fail {
                reason: e.to_string(),
            },
        }
    })
}

fn test_shutdown_reply(
    kernel: &mut KernelUnderTest,
) -> Pin<Box<dyn Future<Output = TestResult> + Send + '_>> {
    Box::pin(async move {
        let request = ShutdownRequest { restart: false };
        match kernel.control_request(request).await {
            Ok(reply) => {
                if let JupyterMessageContent::ShutdownReply(sr) = reply.content {
                    if sr.status == ReplyStatus::Ok {
                        TestResult::Pass
                    } else {
                        TestResult::Fail {
                            reason: format!("shutdown_reply status: {:?}", sr.status),
                        }
                    }
                } else {
                    TestResult::Fail {
                        reason: format!(
                            "Expected shutdown_reply, got {:?}",
                            reply.content.message_type()
                        ),
                    }
                }
            }
            Err(e) => TestResult::Fail {
                reason: e.to_string(),
            },
        }
    })
}

// =============================================================================
// TIER 2: INTERACTIVE FEATURES
// =============================================================================

fn test_complete_request(
    kernel: &mut KernelUnderTest,
) -> Pin<Box<dyn Future<Output = TestResult> + Send + '_>> {
    Box::pin(async move {
        let setup = kernel.snippets().completion_setup.to_string();
        let _ = kernel.execute_and_collect(&setup).await;

        let prefix = kernel.snippets().completion_prefix.to_string();
        let request = CompleteRequest {
            code: prefix.clone(),
            cursor_pos: prefix.len(),
        };

        match kernel.shell_request(request).await {
            Ok(reply) => {
                if let JupyterMessageContent::CompleteReply(cr) = reply.content {
                    if cr.status == ReplyStatus::Ok {
                        TestResult::Pass
                    } else if cr.status == ReplyStatus::Error {
                        TestResult::Fail {
                            reason: format!("complete_reply error: {:?}", cr.error),
                        }
                    } else {
                        TestResult::Pass
                    }
                } else {
                    TestResult::Fail {
                        reason: format!(
                            "Expected complete_reply, got {:?}",
                            reply.content.message_type()
                        ),
                    }
                }
            }
            Err(e) => TestResult::Fail {
                reason: e.to_string(),
            },
        }
    })
}

fn test_inspect_request(
    kernel: &mut KernelUnderTest,
) -> Pin<Box<dyn Future<Output = TestResult> + Send + '_>> {
    Box::pin(async move {
        let setup = kernel.snippets().completion_setup.to_string();
        let _ = kernel.execute_and_collect(&setup).await;

        let var = kernel.snippets().completion_var.to_string();
        let request = InspectRequest {
            code: var.clone(),
            cursor_pos: var.len(),
            detail_level: Some(0),
        };

        match kernel.shell_request(request).await {
            Ok(reply) => {
                if let JupyterMessageContent::InspectReply(ir) = reply.content {
                    if ir.status == ReplyStatus::Ok {
                        TestResult::Pass
                    } else {
                        TestResult::Fail {
                            reason: format!("inspect_reply status: {:?}", ir.status),
                        }
                    }
                } else {
                    TestResult::Fail {
                        reason: format!(
                            "Expected inspect_reply, got {:?}",
                            reply.content.message_type()
                        ),
                    }
                }
            }
            Err(e) => TestResult::Fail {
                reason: e.to_string(),
            },
        }
    })
}

fn test_is_complete_complete(
    kernel: &mut KernelUnderTest,
) -> Pin<Box<dyn Future<Output = TestResult> + Send + '_>> {
    Box::pin(async move {
        let code = kernel.snippets().complete_code.to_string();
        let request = IsCompleteRequest { code };

        match kernel.shell_request(request).await {
            Ok(reply) => {
                if let JupyterMessageContent::IsCompleteReply(icr) = reply.content {
                    if icr.status == IsCompleteReplyStatus::Complete {
                        TestResult::Pass
                    } else {
                        TestResult::PartialPass {
                            score: 0.5,
                            notes: format!("Expected 'complete', got {:?}", icr.status),
                        }
                    }
                } else {
                    TestResult::Fail {
                        reason: format!(
                            "Expected is_complete_reply, got {:?}",
                            reply.content.message_type()
                        ),
                    }
                }
            }
            Err(e) => TestResult::Fail {
                reason: e.to_string(),
            },
        }
    })
}

fn test_is_complete_incomplete(
    kernel: &mut KernelUnderTest,
) -> Pin<Box<dyn Future<Output = TestResult> + Send + '_>> {
    Box::pin(async move {
        let code = kernel.snippets().incomplete_code.to_string();
        let request = IsCompleteRequest { code };

        match kernel.shell_request(request).await {
            Ok(reply) => {
                if let JupyterMessageContent::IsCompleteReply(icr) = reply.content {
                    if icr.status == IsCompleteReplyStatus::Incomplete {
                        TestResult::Pass
                    } else {
                        TestResult::PartialPass {
                            score: 0.5,
                            notes: format!("Expected 'incomplete', got {:?}", icr.status),
                        }
                    }
                } else {
                    TestResult::Fail {
                        reason: format!(
                            "Expected is_complete_reply, got {:?}",
                            reply.content.message_type()
                        ),
                    }
                }
            }
            Err(e) => TestResult::Fail {
                reason: e.to_string(),
            },
        }
    })
}

fn test_history_request(
    kernel: &mut KernelUnderTest,
) -> Pin<Box<dyn Future<Output = TestResult> + Send + '_>> {
    Box::pin(async move {
        let code = kernel.snippets().complete_code.to_string();
        let _ = kernel.execute_and_collect(&code).await;

        let request = HistoryRequest::Tail {
            n: 10,
            output: false,
            raw: true,
        };

        match kernel.shell_request(request).await {
            Ok(reply) => {
                if let JupyterMessageContent::HistoryReply(hr) = reply.content {
                    if hr.status == ReplyStatus::Ok {
                        TestResult::Pass
                    } else {
                        TestResult::Fail {
                            reason: format!("history_reply status: {:?}", hr.status),
                        }
                    }
                } else {
                    TestResult::Fail {
                        reason: format!(
                            "Expected history_reply, got {:?}",
                            reply.content.message_type()
                        ),
                    }
                }
            }
            Err(e) => TestResult::Fail {
                reason: e.to_string(),
            },
        }
    })
}

fn test_comm_info_request(
    kernel: &mut KernelUnderTest,
) -> Pin<Box<dyn Future<Output = TestResult> + Send + '_>> {
    Box::pin(async move {
        let request = CommInfoRequest { target_name: None };

        match kernel.shell_request(request).await {
            Ok(reply) => {
                if let JupyterMessageContent::CommInfoReply(cir) = reply.content {
                    if cir.status == ReplyStatus::Ok {
                        TestResult::Pass
                    } else {
                        TestResult::Fail {
                            reason: format!("comm_info_reply status: {:?}", cir.status),
                        }
                    }
                } else {
                    TestResult::Fail {
                        reason: format!(
                            "Expected comm_info_reply, got {:?}",
                            reply.content.message_type()
                        ),
                    }
                }
            }
            Err(e) => TestResult::Fail {
                reason: e.to_string(),
            },
        }
    })
}

fn test_error_handling(
    kernel: &mut KernelUnderTest,
) -> Pin<Box<dyn Future<Output = TestResult> + Send + '_>> {
    Box::pin(async move {
        let code = kernel.snippets().syntax_error.to_string();
        match kernel.execute_and_collect(&code).await {
            Ok((reply, iopub)) => {
                let reply_has_error = if let JupyterMessageContent::ExecuteReply(er) = &reply.content
                {
                    er.status == ReplyStatus::Error
                } else {
                    false
                };

                let iopub_has_error = iopub
                    .iter()
                    .any(|msg| matches!(&msg.content, JupyterMessageContent::ErrorOutput(_)));

                if reply_has_error || iopub_has_error {
                    TestResult::Pass
                } else {
                    TestResult::Fail {
                        reason: "No error in reply or iopub".to_string(),
                    }
                }
            }
            Err(e) => TestResult::Fail {
                reason: e.to_string(),
            },
        }
    })
}

// =============================================================================
// TIER 3: RICH OUTPUT
// =============================================================================

fn test_display_data(
    kernel: &mut KernelUnderTest,
) -> Pin<Box<dyn Future<Output = TestResult> + Send + '_>> {
    Box::pin(async move {
        let code = kernel.snippets().display_data_code.to_string();
        match kernel.execute_and_collect(&code).await {
            Ok((_, iopub)) => {
                let has_display = iopub
                    .iter()
                    .any(|msg| matches!(&msg.content, JupyterMessageContent::DisplayData(_)));

                if has_display {
                    TestResult::Pass
                } else {
                    TestResult::Unsupported
                }
            }
            Err(e) => TestResult::Fail {
                reason: e.to_string(),
            },
        }
    })
}

fn test_execute_result(
    kernel: &mut KernelUnderTest,
) -> Pin<Box<dyn Future<Output = TestResult> + Send + '_>> {
    Box::pin(async move {
        let code = kernel.snippets().simple_expr.to_string();
        match kernel.execute_and_collect(&code).await {
            Ok((_, iopub)) => {
                let has_result = iopub
                    .iter()
                    .any(|msg| matches!(&msg.content, JupyterMessageContent::ExecuteResult(_)));

                if has_result {
                    TestResult::Pass
                } else {
                    TestResult::Fail {
                        reason: "No execute_result on iopub".to_string(),
                    }
                }
            }
            Err(e) => TestResult::Fail {
                reason: e.to_string(),
            },
        }
    })
}

// =============================================================================
// TIER 4: ADVANCED FEATURES
// =============================================================================

fn test_stdin_input_request(
    _kernel: &mut KernelUnderTest,
) -> Pin<Box<dyn Future<Output = TestResult> + Send + '_>> {
    Box::pin(async move { TestResult::Unsupported })
}

fn test_comms_lifecycle(
    _kernel: &mut KernelUnderTest,
) -> Pin<Box<dyn Future<Output = TestResult> + Send + '_>> {
    Box::pin(async move { TestResult::Unsupported })
}

fn test_interrupt_request(
    kernel: &mut KernelUnderTest,
) -> Pin<Box<dyn Future<Output = TestResult> + Send + '_>> {
    Box::pin(async move {
        let request = InterruptRequest {};
        match kernel.control_request(request).await {
            Ok(reply) => {
                if let JupyterMessageContent::InterruptReply(ir) = reply.content {
                    if ir.status == ReplyStatus::Ok {
                        TestResult::Pass
                    } else {
                        TestResult::Fail {
                            reason: format!("interrupt_reply status: {:?}", ir.status),
                        }
                    }
                } else {
                    TestResult::Fail {
                        reason: format!(
                            "Expected interrupt_reply, got {:?}",
                            reply.content.message_type()
                        ),
                    }
                }
            }
            Err(e) => TestResult::Fail {
                reason: e.to_string(),
            },
        }
    })
}

fn test_execution_count_increments(
    kernel: &mut KernelUnderTest,
) -> Pin<Box<dyn Future<Output = TestResult> + Send + '_>> {
    Box::pin(async move {
        let code = kernel.snippets().complete_code.to_string();

        let first = kernel.execute_and_collect(&code).await;
        let second = kernel.execute_and_collect(&code).await;

        match (first, second) {
            (Ok((reply1, _)), Ok((reply2, _))) => {
                let count1 = if let JupyterMessageContent::ExecuteReply(er) = &reply1.content {
                    er.execution_count.value()
                } else {
                    0
                };
                let count2 = if let JupyterMessageContent::ExecuteReply(er) = &reply2.content {
                    er.execution_count.value()
                } else {
                    0
                };

                if count2 > count1 {
                    TestResult::Pass
                } else {
                    TestResult::Fail {
                        reason: format!("Counts didn't increment: {} -> {}", count1, count2),
                    }
                }
            }
            (Err(e), _) | (_, Err(e)) => TestResult::Fail {
                reason: e.to_string(),
            },
        }
    })
}

fn test_parent_header_correlation(
    kernel: &mut KernelUnderTest,
) -> Pin<Box<dyn Future<Output = TestResult> + Send + '_>> {
    Box::pin(async move {
        let code = kernel.snippets().print_hello.to_string();
        match kernel.execute_and_collect(&code).await {
            Ok((reply, iopub)) => {
                let all_correlated = iopub.iter().all(|msg| msg.parent_header.is_some());
                let reply_correlated = reply.parent_header.is_some();

                if all_correlated && reply_correlated {
                    TestResult::Pass
                } else {
                    TestResult::Fail {
                        reason: format!(
                            "Missing parent_header: iopub={}, reply={}",
                            all_correlated, reply_correlated
                        ),
                    }
                }
            }
            Err(e) => TestResult::Fail {
                reason: e.to_string(),
            },
        }
    })
}

// =============================================================================
// TEST REGISTRY
// =============================================================================

/// Get all conformance tests.
pub fn all_tests() -> Vec<ConformanceTest> {
    vec![
        // Tier 1: Basic Protocol
        ConformanceTest {
            name: "heartbeat_responds",
            category: TestCategory::Tier1Basic,
            run: test_heartbeat_responds,
        },
        ConformanceTest {
            name: "kernel_info_reply_valid",
            category: TestCategory::Tier1Basic,
            run: test_kernel_info_reply_valid,
        },
        ConformanceTest {
            name: "kernel_info_has_language_info",
            category: TestCategory::Tier1Basic,
            run: test_kernel_info_has_language_info,
        },
        ConformanceTest {
            name: "kernel_info_has_protocol_version",
            category: TestCategory::Tier1Basic,
            run: test_kernel_info_has_protocol_version,
        },
        ConformanceTest {
            name: "execute_stdout",
            category: TestCategory::Tier1Basic,
            run: test_execute_stdout,
        },
        ConformanceTest {
            name: "execute_reply_ok",
            category: TestCategory::Tier1Basic,
            run: test_execute_reply_ok,
        },
        ConformanceTest {
            name: "status_busy_idle_lifecycle",
            category: TestCategory::Tier1Basic,
            run: test_status_busy_idle_lifecycle,
        },
        ConformanceTest {
            name: "execute_input_broadcast",
            category: TestCategory::Tier1Basic,
            run: test_execute_input_broadcast,
        },
        // Tier 2: Interactive Features
        ConformanceTest {
            name: "complete_request",
            category: TestCategory::Tier2Interactive,
            run: test_complete_request,
        },
        ConformanceTest {
            name: "inspect_request",
            category: TestCategory::Tier2Interactive,
            run: test_inspect_request,
        },
        ConformanceTest {
            name: "is_complete_complete",
            category: TestCategory::Tier2Interactive,
            run: test_is_complete_complete,
        },
        ConformanceTest {
            name: "is_complete_incomplete",
            category: TestCategory::Tier2Interactive,
            run: test_is_complete_incomplete,
        },
        ConformanceTest {
            name: "history_request",
            category: TestCategory::Tier2Interactive,
            run: test_history_request,
        },
        ConformanceTest {
            name: "comm_info_request",
            category: TestCategory::Tier2Interactive,
            run: test_comm_info_request,
        },
        ConformanceTest {
            name: "error_handling",
            category: TestCategory::Tier2Interactive,
            run: test_error_handling,
        },
        // Tier 3: Rich Output
        ConformanceTest {
            name: "display_data",
            category: TestCategory::Tier3RichOutput,
            run: test_display_data,
        },
        ConformanceTest {
            name: "execute_result",
            category: TestCategory::Tier3RichOutput,
            run: test_execute_result,
        },
        // Tier 4: Advanced Features
        ConformanceTest {
            name: "stdin_input_request",
            category: TestCategory::Tier4Advanced,
            run: test_stdin_input_request,
        },
        ConformanceTest {
            name: "comms_lifecycle",
            category: TestCategory::Tier4Advanced,
            run: test_comms_lifecycle,
        },
        ConformanceTest {
            name: "interrupt_request",
            category: TestCategory::Tier4Advanced,
            run: test_interrupt_request,
        },
        ConformanceTest {
            name: "execution_count_increments",
            category: TestCategory::Tier4Advanced,
            run: test_execution_count_increments,
        },
        ConformanceTest {
            name: "parent_header_correlation",
            category: TestCategory::Tier4Advanced,
            run: test_parent_header_correlation,
        },
        // Shutdown should be last
        ConformanceTest {
            name: "shutdown_reply",
            category: TestCategory::Tier1Basic,
            run: test_shutdown_reply,
        },
    ]
}
