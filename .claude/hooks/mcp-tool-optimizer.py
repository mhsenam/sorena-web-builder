#!/usr/bin/env python3
"""
MCP Tool Optimizer Hook for Claude Code
Enforces MCP tool priority and provides optimization suggestions
"""

import json
import sys
import time
from pathlib import Path
from typing import Dict, Any, List, Optional

# MCP tool recommendations based on task type
MCP_RECOMMENDATIONS = {
    "code_search": {
        "primary": "mcp__serena__find_symbol",
        "alternatives": ["mcp__serena__search_for_pattern", "mcp__serena__get_symbols_overview"],
        "avoid": ["Grep", "Read"]
    },
    "code_understanding": {
        "primary": "mcp__serena__get_symbols_overview", 
        "alternatives": ["mcp__serena__find_referencing_symbols"],
        "avoid": ["LS", "Read"]
    },
    "code_editing": {
        "primary": "mcp__serena__replace_symbol_body",
        "alternatives": ["mcp__serena__insert_after_symbol", "mcp__serena__insert_before_symbol"],
        "avoid": ["Edit", "MultiEdit"]
    },
    "documentation": {
        "primary": "mcp__context7__get-library-docs",
        "alternatives": ["mcp__context7__resolve-library-id"],
        "avoid": ["WebFetch", "WebSearch"]
    },
    "file_operations": {
        "primary": "mcp__serena__find_file",
        "alternatives": ["mcp__serena__list_dir"],
        "avoid": ["Glob", "LS"]
    }
}

# Tool usage patterns that indicate inefficient workflows
INEFFICIENT_PATTERNS = [
    {
        "pattern": ["Read", "Grep", "Read"],
        "suggestion": "Use mcp__serena__search_for_pattern for more efficient code search",
        "efficiency_gain": "3x faster"
    },
    {
        "pattern": ["LS", "Read", "Edit"],
        "suggestion": "Use mcp__serena__get_symbols_overview then mcp__serena__replace_symbol_body",
        "efficiency_gain": "Better semantic understanding"
    },
    {
        "pattern": ["WebFetch", "WebFetch"],
        "suggestion": "Use mcp__context7__get-library-docs for technical documentation",
        "efficiency_gain": "Always up-to-date docs"
    }
]

class MCPOptimizer:
    def __init__(self, input_data: Dict[str, Any]):
        self.input_data = input_data
        self.tool_name = input_data.get("tool_name", "")
        self.tool_input = input_data.get("tool_input", {})
        self.hook_event = input_data.get("hook_event_name", "")
        self.session_id = input_data.get("session_id", "")
        
        # Load tool usage history
        self.usage_history = self._load_usage_history()
        
    def _load_usage_history(self) -> List[Dict[str, Any]]:
        """Load recent tool usage history"""
        history_file = Path(f".claude/tool_history_{self.session_id}.json")
        if history_file.exists():
            try:
                with open(history_file) as f:
                    data = json.load(f)
                    # Keep only recent history (last 20 tools)
                    return data[-20:] if len(data) > 20 else data
            except Exception:
                pass
        return []
    
    def _save_usage_history(self):
        """Save tool usage history"""
        history_file = Path(f".claude/tool_history_{self.session_id}.json")
        try:
            with open(history_file, 'w') as f:
                json.dump(self.usage_history, f, indent=2)
        except Exception as e:
            print(f"Failed to save tool history: {e}", file=sys.stderr)
    
    def optimize_tool_usage(self) -> Dict[str, Any]:
        """Main optimization logic"""
        if self.hook_event == "PreToolUse":
            return self._handle_pre_tool_use()
        elif self.hook_event == "PostToolUse":
            return self._handle_post_tool_use()
        elif self.hook_event == "SessionStart":
            return self._handle_session_start()
        
        return {"continue": True}
    
    def _handle_pre_tool_use(self) -> Dict[str, Any]:
        """Handle PreToolUse optimization"""
        # Record tool usage
        self.usage_history.append({
            "tool_name": self.tool_name,
            "timestamp": time.time(),
            "input_summary": self._summarize_tool_input()
        })
        
        # Check for MCP tool opportunities
        if not self.tool_name.startswith("mcp__"):
            mcp_suggestion = self._suggest_mcp_alternative()
            if mcp_suggestion:
                return mcp_suggestion
        
        # Check for inefficient patterns
        pattern_suggestion = self._check_inefficient_patterns()
        if pattern_suggestion:
            return pattern_suggestion
        
        # Provide positive reinforcement for MCP usage
        if self.tool_name.startswith("mcp__"):
            return self._provide_mcp_encouragement()
        
        return {"continue": True}
    
    def _summarize_tool_input(self) -> str:
        """Create a summary of tool input for history tracking"""
        if self.tool_name == "Bash":
            return f"command: {self.tool_input.get('command', '')[:50]}..."
        elif self.tool_name in ["Read", "Write", "Edit"]:
            return f"file: {self.tool_input.get('file_path', '')}"
        elif self.tool_name == "Grep":
            return f"pattern: {self.tool_input.get('pattern', '')}"
        elif self.tool_name.startswith("mcp__serena__"):
            return f"serena: {self.tool_name.replace('mcp__serena__', '')}"
        elif self.tool_name.startswith("mcp__context7__"):
            return f"context7: {self.tool_name.replace('mcp__context7__', '')}"
        else:
            return f"{self.tool_name}: {str(self.tool_input)[:30]}..."
    
    def _suggest_mcp_alternative(self) -> Optional[Dict[str, Any]]:
        """Suggest MCP alternatives for standard tools"""
        task_type = self._detect_task_type()
        if not task_type or task_type not in MCP_RECOMMENDATIONS:
            return None
        
        rec = MCP_RECOMMENDATIONS[task_type]
        
        if self.tool_name in rec["avoid"]:
            suggestion_message = f"""
🚀 **MCP Tool Optimization Suggestion**

Instead of using `{self.tool_name}`, consider using MCP tools for better performance:

**Recommended:** `{rec["primary"]}`
**Alternatives:** {', '.join(f"`{alt}`" for alt in rec["alternatives"])}

**Benefits:**
• Semantic code understanding
• Better integration with project context  
• Faster execution with cached results
• More accurate results

Would you like to use the recommended MCP tool instead?
"""
            
            return {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "ask",
                    "permissionDecisionReason": suggestion_message
                },
                "continue": True
            }
        
        return None
    
    def _detect_task_type(self) -> Optional[str]:
        """Detect the type of task being performed"""
        tool_input_str = str(self.tool_input).lower()
        
        if self.tool_name in ["Grep", "Read"] and any(term in tool_input_str for term in ["function", "class", "import", "export"]):
            return "code_search"
        elif self.tool_name in ["LS", "Read"] and "src/" in tool_input_str:
            return "code_understanding"
        elif self.tool_name in ["Edit", "MultiEdit", "Write"] and any(ext in tool_input_str for ext in [".ts", ".tsx", ".js", ".jsx"]):
            return "code_editing"
        elif self.tool_name in ["WebFetch", "WebSearch"] and any(domain in tool_input_str for domain in ["docs", "github", "stackoverflow"]):
            return "documentation"
        elif self.tool_name in ["Glob", "LS"] and ("*" in tool_input_str or "find" in tool_input_str):
            return "file_operations"
        
        return None
    
    def _check_inefficient_patterns(self) -> Optional[Dict[str, Any]]:
        """Check for inefficient tool usage patterns"""
        if len(self.usage_history) < 2:
            return None
        
        # Get recent tool sequence
        recent_tools = [entry["tool_name"] for entry in self.usage_history[-3:]]
        
        for pattern_info in INEFFICIENT_PATTERNS:
            pattern = pattern_info["pattern"]
            if len(recent_tools) >= len(pattern):
                if recent_tools[-len(pattern):] == pattern:
                    suggestion_message = f"""
⚡ **Workflow Optimization Detected**

Pattern detected: {' → '.join(pattern)}

**Suggestion:** {pattern_info['suggestion']}
**Efficiency gain:** {pattern_info['efficiency_gain']}

This will provide better results with fewer steps.
"""
                    
                    return {
                        "hookSpecificOutput": {
                            "hookEventName": "PreToolUse",
                            "permissionDecision": "ask",
                            "permissionDecisionReason": suggestion_message
                        },
                        "continue": True
                    }
        
        return None
    
    def _provide_mcp_encouragement(self) -> Dict[str, Any]:
        """Provide positive feedback for MCP tool usage"""
        messages = {
            "mcp__serena__find_symbol": "🎯 Excellent! Using semantic symbol search for precise results.",
            "mcp__serena__search_for_pattern": "🔍 Great! Pattern search with semantic understanding.",
            "mcp__serena__get_symbols_overview": "📊 Perfect! Getting comprehensive code structure overview.",
            "mcp__serena__replace_symbol_body": "✏️ Ideal! Precise symbol-level editing.",
            "mcp__context7__get-library-docs": "📚 Fantastic! Getting latest documentation.",
            "mcp__context7__resolve-library-id": "🔗 Smart! Resolving library for accurate docs."
        }
        
        message = messages.get(self.tool_name, f"✅ Great choice using MCP tool: {self.tool_name}")
        
        return {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse", 
                "permissionDecision": "allow",
                "permissionDecisionReason": message
            },
            "continue": True
        }
    
    def _handle_post_tool_use(self) -> Dict[str, Any]:
        """Handle post-tool usage optimization"""
        # Update usage history with results
        if self.usage_history:
            self.usage_history[-1]["completed"] = True
            self.usage_history[-1]["success"] = self.input_data.get("tool_response", {}).get("success", True)
        
        # Save updated history
        self._save_usage_history()
        
        return {"continue": True}
    
    def _handle_session_start(self) -> Dict[str, Any]:
        """Handle session start with MCP optimization tips"""
        context_message = """
🚀 **MCP Tool Optimization Active**

For best performance, Claude Code will prioritize:
1. **Serena MCP** - Semantic code operations
2. **Context7 MCP** - Real-time documentation  
3. Standard tools only when MCP can't help

This ensures faster, more accurate results with better project understanding.
"""
        
        return {
            "hookSpecificOutput": {
                "hookEventName": "SessionStart",
                "additionalContext": context_message
            },
            "continue": True
        }

def main():
    """Main entry point"""
    try:
        input_data = json.load(sys.stdin)
        optimizer = MCPOptimizer(input_data)
        
        response = optimizer.optimize_tool_usage()
        
        if "hookSpecificOutput" in response or "decision" in response:
            print(json.dumps(response))
        
        sys.exit(0)
        
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"MCP optimization error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()