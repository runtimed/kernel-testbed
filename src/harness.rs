//! Test harness for launching kernels and running conformance tests.

use crate::snippets::LanguageSnippets;
use crate::types::{KernelReport, TestCategory, TestRecord, TestResult};
use chrono::Utc;
use jupyter_protocol::connection_info::{ConnectionInfo, Transport};
use jupyter_protocol::messaging::{
    CommClose, CommOpen, ExecuteRequest, ExecutionState, InputReply, JupyterMessage,
    JupyterMessageContent, KernelInfoReply, KernelInfoRequest, ReplyStatus, ShutdownRequest,
    Status,
};
use runtimelib::{
    create_client_control_connection, create_client_heartbeat_connection,
    create_client_iopub_connection, create_client_shell_connection_with_identity,
    create_client_stdin_connection_with_identity, peer_identity_for_session, peek_ports,
    ClientControlConnection, ClientHeartbeatConnection, ClientIoPubConnection,
    ClientShellConnection, ClientStdinConnection, KernelspecDir,
};
use std::net::{IpAddr, Ipv4Addr};
use std::path::PathBuf;
use std::process::Stdio;
use std::time::{Duration, Instant};
use thiserror::Error;
use tokio::process::Child;
use tokio::time::timeout;

/// Time to wait for IOPub to settle after connecting
const IOPUB_SETTLE_TIME: Duration = Duration::from_millis(100);

#[derive(Error, Debug)]
pub enum HarnessError {
    #[error("Kernel launch failed: {0}")]
    LaunchFailed(String),
    #[error("Connection failed: {0}")]
    ConnectionFailed(String),
    #[error("Timeout waiting for {0}")]
    Timeout(String),
    #[error("Protocol error: {0}")]
    ProtocolError(String),
    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
    #[error("Runtime error: {0}")]
    RuntimeError(#[from] runtimelib::RuntimeError),
}

pub type Result<T> = std::result::Result<T, HarnessError>;

/// A kernel under test with all its connections.
#[allow(dead_code)]
pub struct KernelUnderTest {
    /// The kernel process
    process: Child,
    /// Connection info
    connection_info: ConnectionInfo,
    /// Path to connection file
    connection_path: PathBuf,
    /// Session ID
    session_id: String,
    /// Shell channel
    shell: ClientShellConnection,
    /// IOPub channel
    iopub: ClientIoPubConnection,
    /// Control channel
    control: ClientControlConnection,
    /// Stdin channel
    stdin: ClientStdinConnection,
    /// Heartbeat channel
    heartbeat: ClientHeartbeatConnection,
    /// Kernel info (populated after startup)
    kernel_info: Option<KernelInfoReply>,
    /// Language snippets for this kernel
    snippets: LanguageSnippets,
    /// Per-test timeout
    test_timeout: Duration,
}

impl KernelUnderTest {
    /// Launch a kernel and establish all connections.
    pub async fn launch(
        kernelspec: KernelspecDir,
        test_timeout: Duration,
    ) -> Result<Self> {
        let session_id = uuid::Uuid::new_v4().to_string();
        let ip = IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1));

        // Find available ports
        let ports = peek_ports(ip, 5).await?;

        let connection_info = ConnectionInfo {
            transport: Transport::TCP,
            ip: ip.to_string(),
            stdin_port: ports[0],
            control_port: ports[1],
            hb_port: ports[2],
            shell_port: ports[3],
            iopub_port: ports[4],
            signature_scheme: "hmac-sha256".to_string(),
            key: uuid::Uuid::new_v4().to_string(),
            kernel_name: Some(kernelspec.kernel_name.clone()),
        };

        // Write connection file
        let runtime_dir = runtimelib::dirs::runtime_dir();
        tokio::fs::create_dir_all(&runtime_dir).await?;
        let connection_path = runtime_dir.join(format!("kernel-test-{}.json", session_id));
        let content = serde_json::to_string(&connection_info)
            .map_err(|e| HarnessError::LaunchFailed(e.to_string()))?;
        tokio::fs::write(&connection_path, content).await?;

        // Launch kernel process
        let process = kernelspec
            .command(&connection_path, Some(Stdio::null()), Some(Stdio::null()))?
            .spawn()
            .map_err(|e| HarnessError::LaunchFailed(e.to_string()))?;

        // Give kernel time to start
        tokio::time::sleep(Duration::from_millis(500)).await;

        // Create peer identity for shell/stdin (must share identity)
        let identity = peer_identity_for_session(&session_id)?;

        // Connect all channels
        let shell = create_client_shell_connection_with_identity(
            &connection_info,
            &session_id,
            identity.clone(),
        )
        .await
        .map_err(|e| HarnessError::ConnectionFailed(e.to_string()))?;

        let iopub = create_client_iopub_connection(&connection_info, "", &session_id)
            .await
            .map_err(|e| HarnessError::ConnectionFailed(e.to_string()))?;

        let control = create_client_control_connection(&connection_info, &session_id)
            .await
            .map_err(|e| HarnessError::ConnectionFailed(e.to_string()))?;

        let stdin =
            create_client_stdin_connection_with_identity(&connection_info, &session_id, identity)
                .await
                .map_err(|e| HarnessError::ConnectionFailed(e.to_string()))?;

        let heartbeat = create_client_heartbeat_connection(&connection_info)
            .await
            .map_err(|e| HarnessError::ConnectionFailed(e.to_string()))?;

        // Wait for IOPub to settle
        tokio::time::sleep(IOPUB_SETTLE_TIME).await;

        // Default snippets (will be updated after kernel_info)
        let snippets = LanguageSnippets::for_language("python");

        let mut kernel = Self {
            process,
            connection_info,
            connection_path,
            session_id,
            shell,
            iopub,
            control,
            stdin,
            heartbeat,
            kernel_info: None,
            snippets,
            test_timeout,
        };

        // Get kernel info to determine language
        kernel.fetch_kernel_info().await?;

        Ok(kernel)
    }

    /// Fetch kernel_info and update snippets.
    async fn fetch_kernel_info(&mut self) -> Result<()> {
        let request: JupyterMessage = KernelInfoRequest {}.into();
        self.shell
            .send(request)
            .await
            .map_err(|e| HarnessError::ProtocolError(e.to_string()))?;

        // Read reply with timeout
        let reply = timeout(self.test_timeout, self.shell.read())
            .await
            .map_err(|_| HarnessError::Timeout("kernel_info_reply".to_string()))?
            .map_err(|e| HarnessError::ProtocolError(e.to_string()))?;

        if let JupyterMessageContent::KernelInfoReply(info) = reply.content {
            self.snippets = LanguageSnippets::for_language(&info.language_info.name);
            self.kernel_info = Some(*info);
            Ok(())
        } else {
            Err(HarnessError::ProtocolError(format!(
                "Expected kernel_info_reply, got {:?}",
                reply.content.message_type()
            )))
        }
    }

    /// Get kernel info.
    pub fn kernel_info(&self) -> Option<&KernelInfoReply> {
        self.kernel_info.as_ref()
    }

    /// Get language snippets.
    pub fn snippets(&self) -> &LanguageSnippets {
        &self.snippets
    }

    /// Send a request on shell and wait for reply.
    pub async fn shell_request(
        &mut self,
        content: impl Into<JupyterMessageContent>,
    ) -> Result<JupyterMessage> {
        let request: JupyterMessage = JupyterMessage::new(content, None);
        self.shell
            .send(request)
            .await
            .map_err(|e| HarnessError::ProtocolError(e.to_string()))?;

        timeout(self.test_timeout, self.shell.read())
            .await
            .map_err(|_| HarnessError::Timeout("shell reply".to_string()))?
            .map_err(|e| HarnessError::ProtocolError(e.to_string()))
    }

    /// Send a request on shell and wait for reply, also collecting IOPub messages.
    pub async fn shell_request_with_iopub(
        &mut self,
        content: impl Into<JupyterMessageContent>,
    ) -> Result<(JupyterMessage, Vec<JupyterMessage>)> {
        let request: JupyterMessage = JupyterMessage::new(content, None);
        let msg_id = request.header.msg_id.clone();

        self.shell
            .send(request)
            .await
            .map_err(|e| HarnessError::ProtocolError(e.to_string()))?;

        // Collect IOPub messages until idle
        let mut iopub_messages = Vec::new();
        let start = Instant::now();

        loop {
            if start.elapsed() > self.test_timeout {
                return Err(HarnessError::Timeout("iopub idle".to_string()));
            }

            match timeout(Duration::from_millis(100), self.iopub.read()).await {
                Ok(Ok(msg)) => {
                    if msg.parent_header.as_ref().map(|h| &h.msg_id) == Some(&msg_id) {
                        let is_idle = matches!(
                            &msg.content,
                            JupyterMessageContent::Status(Status { execution_state })
                            if *execution_state == ExecutionState::Idle
                        );
                        iopub_messages.push(msg);
                        if is_idle {
                            break;
                        }
                    }
                }
                Ok(Err(e)) => {
                    return Err(HarnessError::ProtocolError(e.to_string()));
                }
                Err(_) => {
                    // Timeout on this read, continue
                }
            }
        }

        // Read shell reply
        let reply = timeout(self.test_timeout, self.shell.read())
            .await
            .map_err(|_| HarnessError::Timeout("shell reply".to_string()))?
            .map_err(|e| HarnessError::ProtocolError(e.to_string()))?;

        Ok((reply, iopub_messages))
    }

    /// Send a request on control and wait for reply.
    pub async fn control_request(
        &mut self,
        content: impl Into<JupyterMessageContent>,
    ) -> Result<JupyterMessage> {
        let request: JupyterMessage = JupyterMessage::new(content, None);
        self.control
            .send(request)
            .await
            .map_err(|e| HarnessError::ProtocolError(e.to_string()))?;

        timeout(self.test_timeout, self.control.read())
            .await
            .map_err(|_| HarnessError::Timeout("control reply".to_string()))?
            .map_err(|e| HarnessError::ProtocolError(e.to_string()))
    }

    /// Execute code and collect all IOPub messages until idle.
    pub async fn execute_and_collect(
        &mut self,
        code: &str,
    ) -> Result<(JupyterMessage, Vec<JupyterMessage>)> {
        let request = ExecuteRequest::new(code.to_string());
        let msg: JupyterMessage = request.into();
        let msg_id = msg.header.msg_id.clone();

        self.shell
            .send(msg)
            .await
            .map_err(|e| HarnessError::ProtocolError(e.to_string()))?;

        // Collect IOPub messages until we see idle status
        let mut iopub_messages = Vec::new();
        let start = Instant::now();

        loop {
            if start.elapsed() > self.test_timeout {
                return Err(HarnessError::Timeout("iopub idle".to_string()));
            }

            match timeout(Duration::from_millis(100), self.iopub.read()).await {
                Ok(Ok(msg)) => {
                    // Only collect messages for our request
                    if msg.parent_header.as_ref().map(|h| &h.msg_id) == Some(&msg_id) {
                        let is_idle = matches!(
                            &msg.content,
                            JupyterMessageContent::Status(Status { execution_state })
                            if *execution_state == ExecutionState::Idle
                        );
                        iopub_messages.push(msg);
                        if is_idle {
                            break;
                        }
                    }
                }
                Ok(Err(e)) => {
                    return Err(HarnessError::ProtocolError(e.to_string()));
                }
                Err(_) => {
                    // Timeout on this read, continue loop
                }
            }
        }

        // Read the execute_reply
        let reply = timeout(self.test_timeout, self.shell.read())
            .await
            .map_err(|_| HarnessError::Timeout("execute_reply".to_string()))?
            .map_err(|e| HarnessError::ProtocolError(e.to_string()))?;

        Ok((reply, iopub_messages))
    }

    /// Execute code that may request stdin input, providing a mock response.
    ///
    /// Returns the execute_reply, IOPub messages, and whether an input_request was received.
    pub async fn execute_with_stdin(
        &mut self,
        code: &str,
        input_response: &str,
    ) -> Result<(JupyterMessage, Vec<JupyterMessage>, bool)> {
        let mut request = ExecuteRequest::new(code.to_string());
        request.allow_stdin = true;
        let msg: JupyterMessage = request.into();
        let msg_id = msg.header.msg_id.clone();

        self.shell
            .send(msg)
            .await
            .map_err(|e| HarnessError::ProtocolError(e.to_string()))?;

        let mut iopub_messages = Vec::new();
        let mut received_input_request = false;
        let start = Instant::now();

        // Poll both IOPub and stdin until we see idle
        loop {
            if start.elapsed() > self.test_timeout {
                return Err(HarnessError::Timeout("iopub idle (stdin test)".to_string()));
            }

            // Check for stdin input_request
            match timeout(Duration::from_millis(50), self.stdin.read()).await {
                Ok(Ok(stdin_msg)) => {
                    if let JupyterMessageContent::InputRequest(_req) = &stdin_msg.content {
                        received_input_request = true;
                        // Send input_reply with our mock response
                        let reply = InputReply {
                            value: input_response.to_string(),
                            status: ReplyStatus::Ok,
                            error: None,
                        };
                        let reply_msg = JupyterMessage::new(reply, Some(&stdin_msg));
                        self.stdin
                            .send(reply_msg)
                            .await
                            .map_err(|e| HarnessError::ProtocolError(e.to_string()))?;
                    }
                }
                Ok(Err(e)) => {
                    // Log but don't fail on stdin errors
                    eprintln!("stdin read error: {}", e);
                }
                Err(_) => {
                    // Timeout on stdin read, that's fine
                }
            }

            // Check for IOPub messages
            match timeout(Duration::from_millis(50), self.iopub.read()).await {
                Ok(Ok(msg)) => {
                    if msg.parent_header.as_ref().map(|h| &h.msg_id) == Some(&msg_id) {
                        let is_idle = matches!(
                            &msg.content,
                            JupyterMessageContent::Status(Status { execution_state })
                            if *execution_state == ExecutionState::Idle
                        );
                        iopub_messages.push(msg);
                        if is_idle {
                            break;
                        }
                    }
                }
                Ok(Err(e)) => {
                    return Err(HarnessError::ProtocolError(e.to_string()));
                }
                Err(_) => {
                    // Timeout on this read, continue loop
                }
            }
        }

        // Read the execute_reply
        let reply = timeout(self.test_timeout, self.shell.read())
            .await
            .map_err(|_| HarnessError::Timeout("execute_reply (stdin test)".to_string()))?
            .map_err(|e| HarnessError::ProtocolError(e.to_string()))?;

        Ok((reply, iopub_messages, received_input_request))
    }

    /// Test heartbeat.
    pub async fn heartbeat(&mut self) -> Result<()> {
        timeout(self.test_timeout, self.heartbeat.single_heartbeat())
            .await
            .map_err(|_| HarnessError::Timeout("heartbeat".to_string()))?
            .map_err(|e| HarnessError::ProtocolError(e.to_string()))
    }

    /// Access stdin channel for input tests.
    pub fn stdin_mut(&mut self) -> &mut ClientStdinConnection {
        &mut self.stdin
    }

    /// Send comm_open and check if kernel rejects it (returns true if rejected).
    pub async fn send_comm_open(&mut self, msg: CommOpen) -> Result<bool> {
        let comm_id = msg.comm_id.clone();
        let request: JupyterMessage = JupyterMessage::new(msg, None);

        self.shell
            .send(request)
            .await
            .map_err(|e| HarnessError::ProtocolError(e.to_string()))?;

        // Brief wait for potential comm_close rejection on IOPub
        let start = Instant::now();
        while start.elapsed() < Duration::from_millis(500) {
            match timeout(Duration::from_millis(100), self.iopub.read()).await {
                Ok(Ok(msg)) => {
                    if let JupyterMessageContent::CommClose(close) = &msg.content {
                        if close.comm_id == comm_id {
                            return Ok(true); // Rejected
                        }
                    }
                }
                _ => {}
            }
        }

        Ok(false) // Not rejected (accepted or ignored)
    }

    /// Send comm_close to clean up a comm.
    pub async fn send_comm_close(&mut self, msg: CommClose) -> Result<()> {
        let request: JupyterMessage = JupyterMessage::new(msg, None);
        self.shell
            .send(request)
            .await
            .map_err(|e| HarnessError::ProtocolError(e.to_string()))?;

        // Brief wait for processing
        tokio::time::sleep(Duration::from_millis(100)).await;
        Ok(())
    }

    /// Shutdown the kernel cleanly.
    pub async fn shutdown(mut self) -> Result<()> {
        let request = ShutdownRequest { restart: false };
        let _ = self.control_request(request).await;

        // Give kernel time to exit
        tokio::time::sleep(Duration::from_millis(500)).await;

        // Force kill if still running
        let _ = self.process.kill().await;

        // Clean up connection file
        let _ = tokio::fs::remove_file(&self.connection_path).await;

        Ok(())
    }
}

/// Definition of a single conformance test.
pub struct ConformanceTest {
    pub name: &'static str,
    pub category: TestCategory,
    /// Human-readable description of what this test validates
    pub description: &'static str,
    /// The primary protocol message type being tested (e.g., "kernel_info_request")
    pub message_type: &'static str,
    pub run: fn(&mut KernelUnderTest) -> std::pin::Pin<Box<dyn std::future::Future<Output = TestResult> + Send + '_>>,
}

/// Run the full conformance suite against a kernel.
pub async fn run_conformance_suite(
    kernelspec: KernelspecDir,
    tiers: &[TestCategory],
    test_timeout: Duration,
    tests: &[ConformanceTest],
) -> Result<KernelReport> {
    let start = Instant::now();
    let kernel_name = kernelspec.kernel_name.clone();

    let mut kernel = KernelUnderTest::launch(kernelspec, test_timeout).await?;

    let kernel_info = kernel
        .kernel_info()
        .ok_or_else(|| HarnessError::ProtocolError("No kernel info".to_string()))?;

    let language = kernel_info.language_info.name.clone();
    let implementation = kernel_info.implementation.clone();
    let protocol_version = kernel_info.protocol_version.clone();

    let mut results = Vec::new();

    for test in tests {
        // Skip tests not in requested tiers
        if !tiers.contains(&test.category) {
            continue;
        }

        let test_start = Instant::now();
        let result = (test.run)(&mut kernel).await;

        results.push(TestRecord {
            name: test.name.to_string(),
            category: test.category,
            description: test.description.to_string(),
            message_type: test.message_type.to_string(),
            result,
            duration: test_start.elapsed(),
        });
    }

    // Shutdown kernel
    kernel.shutdown().await?;

    Ok(KernelReport {
        kernel_name,
        language,
        implementation,
        protocol_version,
        results,
        timestamp: Utc::now(),
        total_duration: start.elapsed(),
    })
}
