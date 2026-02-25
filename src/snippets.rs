//! Language-aware code snippets for testing different kernels.
//!
//! Each kernel speaks a different language, so we need appropriate code
//! snippets to test execution, completion, errors, etc.

/// Code snippets for a specific kernel language.
#[derive(Debug, Clone)]
pub struct LanguageSnippets {
    /// Language name (lowercase, e.g., "python", "r", "rust")
    pub language: String,
    /// Code that prints "hello" to stdout
    pub print_hello: &'static str,
    /// Code that prints "error" to stderr
    pub print_stderr: &'static str,
    /// Simple expression that returns a value (for execute_result)
    pub simple_expr: &'static str,
    /// Expected string output from simple_expr
    pub simple_expr_result: &'static str,
    /// Incomplete code (for is_complete test)
    pub incomplete_code: &'static str,
    /// Complete single statement
    pub complete_code: &'static str,
    /// Code that causes a syntax error
    pub syntax_error: &'static str,
    /// Code that reads input from stdin
    pub input_prompt: &'static str,
    /// Code that sleeps for ~2 seconds (for interrupt test)
    pub sleep_code: &'static str,
    /// Variable name to use for completion test
    pub completion_var: &'static str,
    /// Code to define a variable for completion
    pub completion_setup: &'static str,
    /// Partial variable name to trigger completion
    pub completion_prefix: &'static str,
    /// Code that produces display_data (rich output)
    pub display_data_code: &'static str,
    /// Code that produces display_data with display_id then updates it
    pub update_display_data_code: &'static str,
}

impl LanguageSnippets {
    /// Get snippets for a language by name.
    pub fn for_language(language: &str) -> Self {
        let lang = language.to_lowercase();
        match lang.as_str() {
            "python" | "python3" => Self::python(),
            "r" => Self::r(),
            "rust" => Self::rust(),
            "julia" => Self::julia(),
            "typescript" | "javascript" => Self::typescript(),
            "go" => Self::go(),
            _ => Self::generic(&lang),
        }
    }

    fn python() -> Self {
        Self {
            language: "python".to_string(),
            print_hello: "print('hello')",
            print_stderr: "import sys; print('error', file=sys.stderr)",
            simple_expr: "1 + 1",
            simple_expr_result: "2",
            incomplete_code: "def foo(",
            complete_code: "x = 1",
            syntax_error: "def class",
            input_prompt: "input('Enter: ')",
            sleep_code: "import time; time.sleep(2)",
            completion_var: "test_variable_for_completion",
            completion_setup: "test_variable_for_completion = 42",
            completion_prefix: "test_variable_for_",
            display_data_code: "from IPython.display import display, HTML; display(HTML('<b>bold</b>'))",
            update_display_data_code: "from IPython.display import display, HTML, update_display; dh = display(HTML('<b>initial</b>'), display_id=True); update_display(HTML('<b>updated</b>'), display_id=dh.display_id)",
        }
    }

    fn r() -> Self {
        Self {
            language: "r".to_string(),
            print_hello: "cat('hello\\n')",
            print_stderr: "message('error')",
            simple_expr: "1 + 1",
            simple_expr_result: "[1] 2",
            incomplete_code: "function(",
            complete_code: "x <- 1",
            syntax_error: "function function",
            input_prompt: "readline('Enter: ')",
            sleep_code: "Sys.sleep(2)",
            completion_var: "test_variable_for_completion",
            completion_setup: "test_variable_for_completion <- 42",
            completion_prefix: "test_variable_for_",
            display_data_code: "IRdisplay::display_html('<b>bold</b>')",
            update_display_data_code: "// IRkernel doesn't support update_display_data",
        }
    }

    fn rust() -> Self {
        // evcxr Rust kernel
        Self {
            language: "rust".to_string(),
            print_hello: "println!(\"hello\");",
            print_stderr: "eprintln!(\"error\");",
            simple_expr: "1 + 1",
            simple_expr_result: "2",
            incomplete_code: "fn foo(",
            complete_code: "let x = 1;",
            syntax_error: "fn fn",
            input_prompt: "// Rust kernel doesn't support stdin",
            sleep_code: "std::thread::sleep(std::time::Duration::from_secs(2));",
            completion_var: "test_variable_for_completion",
            completion_setup: "let test_variable_for_completion = 42;",
            completion_prefix: "test_variable_for_",
            display_data_code: "// evcxr doesn't have display_data helpers",
            update_display_data_code: "// evcxr doesn't support update_display_data",
        }
    }

    fn julia() -> Self {
        Self {
            language: "julia".to_string(),
            print_hello: "println(\"hello\")",
            print_stderr: "println(stderr, \"error\")",
            simple_expr: "1 + 1",
            simple_expr_result: "2",
            incomplete_code: "function foo(",
            complete_code: "x = 1",
            syntax_error: "function function",
            input_prompt: "readline()",
            sleep_code: "sleep(2)",
            completion_var: "test_variable_for_completion",
            completion_setup: "test_variable_for_completion = 42",
            completion_prefix: "test_variable_for_",
            display_data_code: "display(\"text/html\", \"<b>bold</b>\")",
            update_display_data_code: "// Julia update_display varies by environment",
        }
    }

    fn typescript() -> Self {
        // Deno jupyter or tslab
        Self {
            language: "typescript".to_string(),
            print_hello: "console.log('hello')",
            print_stderr: "console.error('error')",
            simple_expr: "1 + 1",
            simple_expr_result: "2",
            incomplete_code: "function foo(",
            complete_code: "const x = 1",
            syntax_error: "function function",
            input_prompt: "// TS kernel stdin varies by implementation",
            sleep_code: "await new Promise(r => setTimeout(r, 2000))",
            completion_var: "testVariableForCompletion",
            completion_setup: "const testVariableForCompletion = 42",
            completion_prefix: "testVariableFor",
            display_data_code: "Deno.jupyter.html`<b>bold</b>`",
            update_display_data_code: r#"await Deno.jupyter.broadcast("display_data", { data: { "text/html": "<b>initial</b>" }, metadata: {}, transient: { display_id: "test_update" } }); await Deno.jupyter.broadcast("update_display_data", { data: { "text/html": "<b>updated</b>" }, metadata: {}, transient: { display_id: "test_update" } })"#,
        }
    }

    fn go() -> Self {
        // gonb kernel
        Self {
            language: "go".to_string(),
            print_hello: "fmt.Println(\"hello\")",
            print_stderr: "fmt.Fprintln(os.Stderr, \"error\")",
            simple_expr: "1 + 1",
            simple_expr_result: "2",
            incomplete_code: "func foo(",
            complete_code: "x := 1",
            syntax_error: "func func",
            input_prompt: "// Go kernel stdin support varies",
            sleep_code: "time.Sleep(2 * time.Second)",
            completion_var: "testVariableForCompletion",
            completion_setup: "testVariableForCompletion := 42",
            completion_prefix: "testVariableFor",
            display_data_code: "// gonb display helpers vary",
            update_display_data_code: "// gonb update_display varies",
        }
    }

    /// Generic fallback for unknown languages
    fn generic(language: &str) -> Self {
        Self {
            language: language.to_string(),
            print_hello: "print('hello')",
            print_stderr: "print('error')",
            simple_expr: "1 + 1",
            simple_expr_result: "2",
            incomplete_code: "(",
            complete_code: "1",
            syntax_error: "!@#$%",
            input_prompt: "input()",
            sleep_code: "// sleep not available",
            completion_var: "x",
            completion_setup: "x = 1",
            completion_prefix: "x",
            display_data_code: "1",
            update_display_data_code: "// update_display not available",
        }
    }
}
