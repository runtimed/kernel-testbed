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
    /// Code that produces execute_result with rich MIME types (text/html, image/*, etc.)
    pub rich_execute_result_code: &'static str,
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
            "scala" => Self::scala(),
            "c++" | "cpp" => Self::cpp(),
            "sql" => Self::sql(),
            "lua" => Self::lua(),
            "haskell" => Self::haskell(),
            "octave" => Self::octave(),
            "ocaml" => Self::ocaml(),
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
            rich_execute_result_code: "from IPython.display import HTML; HTML('<b>bold</b>')",
        }
    }

    fn r() -> Self {
        Self {
            language: "r".to_string(),
            print_hello: "cat('hello\\n')",
            // Use cat() with stderr() for more explicit stderr output
            print_stderr: "cat('error\\n', file=stderr())",
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
            // Ark produces display_data natively for graphics - no IRdisplay needed
            display_data_code: "plot(1:10)",
            // Ark sends update_display_data when a new plot replaces the previous one
            update_display_data_code: "plot(1:5); Sys.sleep(0.1); plot(6:10)",
            // Ark returns text/html in execute_result for data frames
            rich_execute_result_code: "data.frame(x = 1:3, y = c('a', 'b', 'c'))",
        }
    }

    fn rust() -> Self {
        // evcxr Rust kernel - uses EVCXR_BEGIN_CONTENT/END_CONTENT protocol for rich output
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
            // evcxr sends rich output via execute_result, not display_data
            display_data_code: "// evcxr uses execute_result for rich output, not display_data",
            update_display_data_code: "// evcxr doesn't support update_display_data (no display_id)",
            // evcxr's strength: rich execute_result via evcxr_display trait
            rich_execute_result_code: r#"pub struct Html(pub &'static str);
impl Html {
    pub fn evcxr_display(&self) {
        println!("EVCXR_BEGIN_CONTENT text/html\n{}\nEVCXR_END_CONTENT", self.0);
    }
}
Html("<b>bold</b>")"#,
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
            update_display_data_code: "# Julia update_display varies by environment",
            // Julia can return rich objects that render as HTML
            rich_execute_result_code: "HTML(\"<b>bold</b>\")",
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
            input_prompt: "prompt('Enter: ')",
            sleep_code: "await new Promise(r => setTimeout(r, 2000))",
            completion_var: "testVariableForCompletion",
            completion_setup: "const testVariableForCompletion = 42",
            completion_prefix: "testVariableFor",
            display_data_code: r#"await Deno.jupyter.broadcast("display_data", { data: { "text/html": "<b>bold</b>" }, metadata: {}, transient: {} })"#,
            update_display_data_code: r#"await Deno.jupyter.broadcast("display_data", { data: { "text/html": "<b>initial</b>" }, metadata: {}, transient: { display_id: "test_update" } }); await Deno.jupyter.broadcast("update_display_data", { data: { "text/html": "<b>updated</b>" }, metadata: {}, transient: { display_id: "test_update" } })"#,
            rich_execute_result_code: r#"Deno.jupyter.html("<b>bold</b>")"#,
        }
    }

    fn go() -> Self {
        // gonb kernel - uses gonbui package for rich output
        Self {
            language: "go".to_string(),
            print_hello: "fmt.Println(\"hello\")",
            print_stderr: "fmt.Fprintln(os.Stderr, \"error\")",
            simple_expr: "1 + 1",
            simple_expr_result: "2",
            incomplete_code: "func foo(",
            complete_code: "x := 1",
            syntax_error: "func func",
            input_prompt: r#"import "github.com/janpfeifer/gonb/gonbui"
gonbui.RequestInput("Enter: ", false)"#,
            sleep_code: "time.Sleep(2 * time.Second)",
            completion_var: "testVariableForCompletion",
            completion_setup: "testVariableForCompletion := 42",
            completion_prefix: "testVariableFor",
            display_data_code: r#"import "github.com/janpfeifer/gonb/gonbui"
gonbui.DisplayHtml("<b>bold</b>")"#,
            update_display_data_code: r#"import "github.com/janpfeifer/gonb/gonbui"
id := gonbui.UniqueId()
gonbui.UpdateHtml(id, "<b>initial</b>")
gonbui.UpdateHtml(id, "<b>updated</b>")"#,
            // Go uses display_data for rich output, not execute_result
            rich_execute_result_code: "// Go uses display_data for rich output",
        }
    }

    fn scala() -> Self {
        // Almond Scala kernel
        Self {
            language: "scala".to_string(),
            print_hello: "println(\"hello\")",
            print_stderr: "System.err.println(\"error\")",
            simple_expr: "1 + 1",
            simple_expr_result: "2",
            incomplete_code: "def foo(",
            complete_code: "val x = 1",
            syntax_error: "def def",
            input_prompt: "scala.io.StdIn.readLine()",
            sleep_code: "Thread.sleep(2000)",
            completion_var: "testVariableForCompletion",
            completion_setup: "val testVariableForCompletion = 42",
            completion_prefix: "testVariableFor",
            display_data_code: "kernel.publish.html(\"<b>bold</b>\")",
            update_display_data_code: r#"val id = java.util.UUID.randomUUID().toString; kernel.publish.html("<b>initial</b>", id); kernel.publish.updateHtml("<b>updated</b>", id)"#,
            // Almond can return HTML objects as rich execute_result
            rich_execute_result_code: "Html(\"<b>bold</b>\")",
        }
    }

    fn cpp() -> Self {
        // xeus-cling C++ kernel - uses xcpp::display and mime_bundle_repr
        Self {
            language: "c++".to_string(),
            print_hello: r#"#include <iostream>
std::cout << "hello" << std::endl;"#,
            print_stderr: r#"#include <iostream>
std::cerr << "error" << std::endl;"#,
            simple_expr: "1 + 1",
            simple_expr_result: "2",
            incomplete_code: "int foo(",
            complete_code: "int x = 1;",
            syntax_error: "int int;",
            input_prompt: "// C++ kernel stdin varies",
            sleep_code: r#"#include <thread>
#include <chrono>
std::this_thread::sleep_for(std::chrono::seconds(2));"#,
            completion_var: "test_variable_for_completion",
            completion_setup: "int test_variable_for_completion = 42;",
            completion_prefix: "test_variable_for_",
            display_data_code: r#"#include <string>
#include "xcpp/xdisplay.hpp"

struct html_content {
    std::string content;
};

#include "nlohmann/json.hpp"
nlohmann::json mime_bundle_repr(const html_content& h) {
    auto bundle = nlohmann::json::object();
    bundle["text/html"] = h.content;
    return bundle;
}

html_content h{"<b>bold</b>"};
xcpp::display(h);"#,
            update_display_data_code: "// xeus-cling update_display_data requires display_id handling",
            // C++ uses display_data for rich output
            rich_execute_result_code: "// C++ uses display_data for rich output",
        }
    }

    fn sql() -> Self {
        // xeus-sql kernel - SQL execution with tabular results
        Self {
            language: "sql".to_string(),
            print_hello: "SELECT 'hello' AS message;",
            print_stderr: "-- SQL doesn't have stderr; errors come from invalid queries",
            simple_expr: "SELECT 1 + 1 AS result;",
            simple_expr_result: "2",
            incomplete_code: "SELECT * FROM",
            complete_code: "SELECT 1;",
            syntax_error: "SELEC * FORM table;",
            input_prompt: "-- SQL kernel doesn't support stdin",
            // SQLite has no sleep; this is a workaround using recursive CTE
            sleep_code: "-- SQL sleep varies by database backend",
            completion_var: "test_table",
            completion_setup: "CREATE TABLE IF NOT EXISTS test_table (id INTEGER);",
            completion_prefix: "test_",
            // xeus-sql displays query results as tables natively
            display_data_code: "SELECT 1 AS col1, 2 AS col2, 3 AS col3;",
            update_display_data_code: "-- SQL doesn't support update_display_data",
            // SQL query results come as execute_result with text/html table
            rich_execute_result_code: "SELECT 1 AS col1, 2 AS col2, 3 AS col3;",
        }
    }

    fn lua() -> Self {
        // Lua scripting language
        Self {
            language: "lua".to_string(),
            print_hello: "print('hello')",
            print_stderr: "io.stderr:write('error\\n')",
            simple_expr: "return 1 + 1",
            simple_expr_result: "2",
            incomplete_code: "function foo(",
            complete_code: "x = 1",
            syntax_error: "function function",
            input_prompt: "io.read()",
            sleep_code: "-- Lua sleep requires os.execute or socket",
            completion_var: "test_variable_for_completion",
            completion_setup: "test_variable_for_completion = 42",
            completion_prefix: "test_variable_for_",
            display_data_code: "ilua.display.html('<b>bold</b>')",
            update_display_data_code: "-- Lua doesn't support update_display_data",
            // Lua uses display_data for rich output
            rich_execute_result_code: "// Lua uses display_data for rich output",
        }
    }

    fn haskell() -> Self {
        // Haskell functional language
        Self {
            language: "haskell".to_string(),
            print_hello: "putStrLn \"hello\"",
            print_stderr: "import System.IO; hPutStrLn stderr \"error\"",
            simple_expr: "1 + 1",
            simple_expr_result: "2",
            incomplete_code: "let x =",
            complete_code: "let x = 1",
            syntax_error: "let let",
            input_prompt: "-- Haskell stdin varies by kernel",
            sleep_code: "import Control.Concurrent; threadDelay 2000000",
            completion_var: "testVariableForCompletion",
            completion_setup: "let testVariableForCompletion = 42",
            completion_prefix: "testVariableFor",
            display_data_code: "putStrLn \"no rich display\"",
            update_display_data_code: "-- Haskell doesn't support update_display_data",
            // Haskell doesn't have rich execute_result
            rich_execute_result_code: "// Haskell doesn't support rich execute_result",
        }
    }

    fn octave() -> Self {
        // GNU Octave - MATLAB-compatible language
        Self {
            language: "octave".to_string(),
            print_hello: "disp('hello')",
            print_stderr: "fprintf(2, 'error\\n')",  // fd 2 = stderr in Octave
            simple_expr: "1 + 1",
            simple_expr_result: "ans = 2",  // Octave prefixes with "ans = "
            incomplete_code: "if true",
            complete_code: "x = 1;",
            syntax_error: "1 +",
            input_prompt: "% Octave stdin doesn't support Jupyter input protocol",
            sleep_code: "pause(2)",
            completion_var: "test_variable_for_completion",
            completion_setup: "test_variable_for_completion = 42;",
            completion_prefix: "test_variable_for_",
            display_data_code: "% Octave plot() requires display - skip in headless CI",
            update_display_data_code: "% Octave update_display varies by environment",
            // Octave uses display_data for rich output
            rich_execute_result_code: "// Octave uses display_data for rich output",
        }
    }

    fn ocaml() -> Self {
        // OCaml Jupyter kernel - uses Jupyter_notebook module for rich output
        Self {
            language: "ocaml".to_string(),
            print_hello: r#"print_endline "hello""#,
            print_stderr: r#"prerr_endline "error""#,
            simple_expr: "1 + 1",
            simple_expr_result: "2",
            incomplete_code: "let foo (",
            complete_code: "let x = 1",
            syntax_error: "let let",
            input_prompt: "read_line ()",
            sleep_code: "Unix.sleep 2",
            completion_var: "test_variable_for_completion",
            completion_setup: "let test_variable_for_completion = 42",
            completion_prefix: "test_variable_for_",
            display_data_code: r#"#require "jupyter.notebook";; Jupyter_notebook.display "text/html" "<b>bold</b>""#,
            update_display_data_code: "(* OCaml jupyter doesn't support update_display_data *)",
            // OCaml uses display_data for rich output
            rich_execute_result_code: "(* OCaml uses display_data for rich output *)",
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
            rich_execute_result_code: "// rich execute_result not available",
        }
    }
}
