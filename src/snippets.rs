//! Language-aware code snippets for testing different kernels.
//!
//! Each kernel speaks a different language, so we need appropriate code
//! snippets to test execution, completion, errors, etc.
//!
//! Snippets are loaded from `snippets/snippets.json` at compile time.

use serde::Deserialize;
use std::collections::HashMap;
use std::sync::OnceLock;

/// Raw snippets data loaded from JSON.
#[derive(Debug, Deserialize)]
struct SnippetsData {
    languages: HashMap<String, RawSnippets>,
}

/// Raw snippet fields from JSON (all strings).
#[derive(Debug, Clone, Deserialize)]
struct RawSnippets {
    print_hello: String,
    print_stderr: String,
    simple_expr: String,
    simple_expr_result: String,
    incomplete_code: String,
    complete_code: String,
    syntax_error: String,
    input_prompt: String,
    sleep_code: String,
    completion_var: String,
    completion_setup: String,
    completion_prefix: String,
    display_data_code: String,
    update_display_data_code: String,
    rich_execute_result_code: String,
}

/// Code snippets for a specific kernel language.
#[derive(Debug, Clone)]
pub struct LanguageSnippets {
    /// Language name (lowercase, e.g., "python", "r", "rust")
    pub language: String,
    /// Code that prints "hello" to stdout
    pub print_hello: String,
    /// Code that prints "error" to stderr
    pub print_stderr: String,
    /// Simple expression that returns a value (for execute_result)
    pub simple_expr: String,
    /// Expected string output from simple_expr
    pub simple_expr_result: String,
    /// Incomplete code (for is_complete test)
    pub incomplete_code: String,
    /// Complete single statement
    pub complete_code: String,
    /// Code that causes a syntax error
    pub syntax_error: String,
    /// Code that reads input from stdin
    pub input_prompt: String,
    /// Code that sleeps for ~2 seconds (for interrupt test)
    pub sleep_code: String,
    /// Variable name to use for completion test
    pub completion_var: String,
    /// Code to define a variable for completion
    pub completion_setup: String,
    /// Partial variable name to trigger completion
    pub completion_prefix: String,
    /// Code that produces display_data (rich output)
    pub display_data_code: String,
    /// Code that produces display_data with display_id then updates it
    pub update_display_data_code: String,
    /// Code that produces execute_result with rich MIME types (text/html, image/*, etc.)
    pub rich_execute_result_code: String,
}

impl From<(String, RawSnippets)> for LanguageSnippets {
    fn from((language, raw): (String, RawSnippets)) -> Self {
        Self {
            language,
            print_hello: raw.print_hello,
            print_stderr: raw.print_stderr,
            simple_expr: raw.simple_expr,
            simple_expr_result: raw.simple_expr_result,
            incomplete_code: raw.incomplete_code,
            complete_code: raw.complete_code,
            syntax_error: raw.syntax_error,
            input_prompt: raw.input_prompt,
            sleep_code: raw.sleep_code,
            completion_var: raw.completion_var,
            completion_setup: raw.completion_setup,
            completion_prefix: raw.completion_prefix,
            display_data_code: raw.display_data_code,
            update_display_data_code: raw.update_display_data_code,
            rich_execute_result_code: raw.rich_execute_result_code,
        }
    }
}

/// Embed the JSON file at compile time.
const SNIPPETS_JSON: &str = include_str!("../snippets/snippets.json");

/// Global cache of parsed snippets data.
static SNIPPETS: OnceLock<SnippetsData> = OnceLock::new();

fn get_snippets() -> &'static SnippetsData {
    SNIPPETS.get_or_init(|| {
        serde_json::from_str(SNIPPETS_JSON).expect("Failed to parse snippets.json")
    })
}

impl LanguageSnippets {
    /// Get snippets for a language by name.
    pub fn for_language(language: &str) -> Self {
        let lang = language.to_lowercase();
        let snippets = get_snippets();

        // Map language aliases to canonical names
        let canonical = match lang.as_str() {
            "python" | "python3" => "python",
            "typescript" | "javascript" => "typescript",
            "c++" | "cpp" => "cpp",
            other => other,
        };

        // Try to find the language, fall back to generic
        if let Some(raw) = snippets.languages.get(canonical) {
            (lang, raw.clone()).into()
        } else if let Some(raw) = snippets.languages.get("generic") {
            (lang, raw.clone()).into()
        } else {
            // Ultimate fallback (shouldn't happen if JSON is valid)
            Self::fallback(&lang)
        }
    }

    /// Hardcoded fallback if JSON loading somehow fails.
    fn fallback(language: &str) -> Self {
        Self {
            language: language.to_string(),
            print_hello: "print('hello')".to_string(),
            print_stderr: "print('error')".to_string(),
            simple_expr: "1 + 1".to_string(),
            simple_expr_result: "2".to_string(),
            incomplete_code: "(".to_string(),
            complete_code: "1".to_string(),
            syntax_error: "!@#$%".to_string(),
            input_prompt: "input()".to_string(),
            sleep_code: "// sleep not available".to_string(),
            completion_var: "x".to_string(),
            completion_setup: "x = 1".to_string(),
            completion_prefix: "x".to_string(),
            display_data_code: "1".to_string(),
            update_display_data_code: "// update_display not available".to_string(),
            rich_execute_result_code: "// rich execute_result not available".to_string(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_python_snippets() {
        let snippets = LanguageSnippets::for_language("python");
        assert_eq!(snippets.language, "python");
        assert_eq!(snippets.print_hello, "print('hello')");
        assert_eq!(snippets.simple_expr_result, "2");
    }

    #[test]
    fn test_python3_alias() {
        let snippets = LanguageSnippets::for_language("python3");
        assert_eq!(snippets.language, "python3");
        assert_eq!(snippets.print_hello, "print('hello')");
    }

    #[test]
    fn test_typescript_alias() {
        let snippets = LanguageSnippets::for_language("javascript");
        assert_eq!(snippets.language, "javascript");
        assert_eq!(snippets.print_hello, "console.log('hello')");
    }

    #[test]
    fn test_cpp_alias() {
        let snippets = LanguageSnippets::for_language("c++");
        assert_eq!(snippets.language, "c++");
        assert!(snippets.print_hello.contains("std::cout"));
    }

    #[test]
    fn test_unknown_language_uses_generic() {
        let snippets = LanguageSnippets::for_language("unknown_language_xyz");
        assert_eq!(snippets.language, "unknown_language_xyz");
        // Should get generic snippets
        assert_eq!(snippets.print_hello, "print('hello')");
    }

    #[test]
    fn test_all_languages_load() {
        let languages = [
            "python", "r", "rust", "julia", "typescript", "go", "scala",
            "cpp", "sql", "lua", "haskell", "octave", "ocaml",
        ];
        for lang in languages {
            let snippets = LanguageSnippets::for_language(lang);
            assert!(!snippets.print_hello.is_empty(), "Empty print_hello for {}", lang);
        }
    }
}
