#!/usr/bin/env python3
"""
Security Validation Hook for Claude Code
Validates tool usage for security best practices and prevents dangerous operations
"""

import json
import re
import sys
import os
from pathlib import Path
from typing import Dict, List, Tuple, Any

# Security patterns to validate
SECURITY_PATTERNS = [
    # Dangerous shell patterns
    (
        r"\b(rm\s+-rf\s+[/*]|sudo\s+rm|chmod\s+777|>/etc/)",
        "Dangerous shell command detected",
        "block"
    ),
    # Secret patterns
    (
        r"(?i)(password|secret|key|token|api_key)\s*[:=]\s*['\"][^'\"]+['\"]",
        "Potential secret detected in code",
        "warn"
    ),
    # Path traversal
    (
        r"\.\./.*\.\./",
        "Path traversal pattern detected",
        "block"
    ),
    # Unsafe file operations
    (
        r"\beval\s*\(|\bexec\s*\(|__import__\s*\(",
        "Unsafe code execution detected",
        "block"
    ),
]

# File patterns that should be protected
PROTECTED_FILES = [
    r"\.env$",
    r"\.env\.",
    r"\.git/",
    r"id_rsa$",
    r"\.pem$",
    r"\.key$",
    r"/etc/passwd",
    r"/etc/shadow",
]

# MCP tools that need special validation
MCP_SECURITY_RULES = {
    "mcp__serena__replace_symbol_body": ["validate_code_injection"],
    "mcp__serena__replace_regex": ["validate_regex_safety"],
    "mcp__browser__evaluate_javascript": ["validate_js_code"],
}

class SecurityValidator:
    def __init__(self, input_data: Dict[str, Any]):
        self.input_data = input_data
        self.tool_name = input_data.get("tool_name", "")
        self.tool_input = input_data.get("tool_input", {})
        self.issues: List[Dict[str, str]] = []
        
    def validate(self) -> Dict[str, Any]:
        """Main validation method"""
        # Validate based on tool type
        if self.tool_name == "Bash":
            self._validate_bash_command()
        elif self.tool_name in ["Write", "Edit", "MultiEdit"]:
            self._validate_file_operations()
        elif self.tool_name.startswith("mcp__"):
            self._validate_mcp_tool()
        
        # Return appropriate response
        return self._generate_response()
    
    def _validate_bash_command(self):
        """Validate bash commands for security issues"""
        command = self.tool_input.get("command", "")
        
        # Check against security patterns
        for pattern, message, severity in SECURITY_PATTERNS:
            if re.search(pattern, command):
                self.issues.append({
                    "type": severity,
                    "message": message,
                    "pattern": pattern,
                    "command": command
                })
        
        # Validate file paths in command
        self._validate_file_paths_in_text(command)
    
    def _validate_file_operations(self):
        """Validate file read/write operations"""
        file_path = self.tool_input.get("file_path", "")
        content = self.tool_input.get("content", "") or self.tool_input.get("new_string", "")
        
        # Check protected files
        for pattern in PROTECTED_FILES:
            if re.search(pattern, file_path):
                self.issues.append({
                    "type": "block",
                    "message": f"Attempting to modify protected file: {file_path}",
                    "file_path": file_path
                })
        
        # Check for secrets in content
        if content:
            self._validate_file_paths_in_text(content)
            self._validate_secrets_in_content(content)
    
    def _validate_mcp_tool(self):
        """Validate MCP tool usage"""
        if self.tool_name in MCP_SECURITY_RULES:
            rules = MCP_SECURITY_RULES[self.tool_name]
            for rule in rules:
                getattr(self, rule, lambda: None)()
    
    def _validate_file_paths_in_text(self, text: str):
        """Check for suspicious file paths"""
        for pattern in PROTECTED_FILES:
            if re.search(pattern, text):
                self.issues.append({
                    "type": "warn",
                    "message": f"Reference to protected file pattern detected: {pattern}",
                    "text": text[:100] + "..." if len(text) > 100 else text
                })
    
    def _validate_secrets_in_content(self, content: str):
        """Check for potential secrets in file content"""
        secret_patterns = [
            (r"(?i)(password|pwd)\s*[:=]\s*['\"][^'\"]{3,}['\"]", "Password detected"),
            (r"(?i)(api_?key|secret_?key)\s*[:=]\s*['\"][^'\"]{10,}['\"]", "API key detected"),
            (r"(?i)(token)\s*[:=]\s*['\"][^'\"]{20,}['\"]", "Token detected"),
            (r"-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----", "Private key detected"),
        ]
        
        for pattern, message in secret_patterns:
            if re.search(pattern, content):
                self.issues.append({
                    "type": "block",
                    "message": message,
                    "suggestion": "Use environment variables or secure storage instead"
                })
    
    def validate_code_injection(self):
        """Validate against code injection in symbol replacement"""
        body = self.tool_input.get("body", "")
        if re.search(r"\beval\s*\(|\bexec\s*\(|Function\s*\(", body):
            self.issues.append({
                "type": "block",
                "message": "Code injection pattern detected in symbol body",
                "body_preview": body[:200] + "..." if len(body) > 200 else body
            })
    
    def validate_regex_safety(self):
        """Validate regex patterns for safety"""
        regex = self.tool_input.get("regex", "")
        # Check for ReDoS patterns
        if re.search(r"\*\*|\+\+|\?\?|(\.|.*)\*.*\*", regex):
            self.issues.append({
                "type": "warn",
                "message": "Potentially unsafe regex pattern (ReDoS risk)",
                "regex": regex
            })
    
    def validate_js_code(self):
        """Validate JavaScript code for browser execution"""
        code = self.tool_input.get("code", "")
        dangerous_js = [
            r"document\.cookie",
            r"localStorage\.setItem",
            r"sessionStorage\.setItem",
            r"eval\s*\(",
            r"Function\s*\(",
            r"setTimeout\s*\([^,]*['\"][^'\"]*['\"]",
        ]
        
        for pattern in dangerous_js:
            if re.search(pattern, code):
                self.issues.append({
                    "type": "warn",
                    "message": f"Potentially dangerous JavaScript operation: {pattern}",
                    "code_preview": code[:100] + "..." if len(code) > 100 else code
                })
    
    def _generate_response(self) -> Dict[str, Any]:
        """Generate appropriate response based on issues found"""
        if not self.issues:
            return {"continue": True}
        
        # Check for blocking issues
        blocking_issues = [issue for issue in self.issues if issue["type"] == "block"]
        warning_issues = [issue for issue in self.issues if issue["type"] == "warn"]
        
        if blocking_issues:
            # Block the operation
            messages = [issue["message"] for issue in blocking_issues]
            return {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "deny",
                    "permissionDecisionReason": "Security validation failed: " + "; ".join(messages)
                },
                "continue": True
            }
        
        elif warning_issues:
            # Ask for user confirmation
            messages = [issue["message"] for issue in warning_issues]
            return {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse", 
                    "permissionDecision": "ask",
                    "permissionDecisionReason": "Security warnings: " + "; ".join(messages)
                },
                "continue": True
            }
        
        return {"continue": True}

def main():
    """Main entry point"""
    try:
        # Read input from stdin
        input_data = json.load(sys.stdin)
        
        # Only validate PreToolUse events
        if input_data.get("hook_event_name") != "PreToolUse":
            sys.exit(0)
        
        # Create validator and run validation
        validator = SecurityValidator(input_data)
        response = validator.validate()
        
        # Output response
        if response.get("continue", True):
            if "hookSpecificOutput" in response:
                print(json.dumps(response))
            sys.exit(0)
        else:
            print(json.dumps(response))
            sys.exit(0)
            
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Security validation error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()