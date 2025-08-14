#!/usr/bin/env python3
"""
Agent Coordination Hook for Claude Code
Manages parallel agent execution and ensures proper MCP tool usage
"""

import json
import sys
import os
import time
from pathlib import Path
from typing import Dict, List, Any, Optional

# Agent coordination patterns
AGENT_PATTERNS = {
    "frontend-developer": {
        "color": "#3B82F6",
        "emoji": "🎨",
        "preferred_tools": ["mcp__serena__find_symbol", "mcp__context7__get-library-docs"],
        "parallel_compatible": ["api-architect", "i18n-specialist", "test-automator"]
    },
    "code-reviewer": {
        "color": "#EF4444", 
        "emoji": "🔍",
        "preferred_tools": ["mcp__serena__get_symbols_overview", "mcp__serena__find_referencing_symbols"],
        "parallel_compatible": ["test-automator", "frontend-developer", "api-architect"]
    },
    "test-automator": {
        "color": "#10B981",
        "emoji": "🧪", 
        "preferred_tools": ["mcp__serena__find_symbol", "Bash"],
        "parallel_compatible": ["frontend-developer", "code-reviewer", "api-architect"]
    },
    "api-architect": {
        "color": "#8B5CF6",
        "emoji": "🏢",
        "preferred_tools": ["mcp__serena__search_for_pattern", "mcp__context7__resolve-library-id"],
        "parallel_compatible": ["frontend-developer", "i18n-specialist", "test-automator"]
    },
    "i18n-specialist": {
        "color": "#F59E0B",
        "emoji": "🌍",
        "preferred_tools": ["mcp__serena__find_symbol", "Grep"],
        "parallel_compatible": ["frontend-developer", "api-architect", "test-automator"]
    },
    "orchestrator": {
        "color": "#F59E0B",
        "emoji": "🎭",
        "preferred_tools": ["Task", "mcp__serena__think_about_collected_information"],
        "parallel_compatible": ["all"]
    }
}

# MCP tool priority enforcement
TOOL_PRIORITIES = {
    # Serena MCP tools (highest priority)
    "code_analysis": [
        "mcp__serena__find_symbol",
        "mcp__serena__search_for_pattern", 
        "mcp__serena__get_symbols_overview",
        "mcp__serena__find_referencing_symbols"
    ],
    "code_editing": [
        "mcp__serena__replace_symbol_body",
        "mcp__serena__insert_after_symbol",
        "mcp__serena__insert_before_symbol"
    ],
    # Context7 MCP tools (second priority)
    "documentation": [
        "mcp__context7__resolve-library-id",
        "mcp__context7__get-library-docs"
    ],
    # Standard tools (fallback only)
    "fallback": ["Read", "Write", "Edit", "Grep", "Bash"]
}

class AgentCoordinator:
    def __init__(self, input_data: Dict[str, Any]):
        self.input_data = input_data
        self.tool_name = input_data.get("tool_name", "")
        self.tool_input = input_data.get("tool_input", {})
        self.hook_event = input_data.get("hook_event_name", "")
        self.session_id = input_data.get("session_id", "")
        
        # Load agent context if available
        self.agent_context = self._load_agent_context()
        
    def _load_agent_context(self) -> Dict[str, Any]:
        """Load current agent execution context"""
        context_file = Path(f".claude/agent_context_{self.session_id}.json")
        if context_file.exists():
            try:
                with open(context_file) as f:
                    return json.load(f)
            except Exception:
                pass
        return {
            "active_agents": [],
            "current_wave": "discovery",
            "wave_start_time": time.time(),
            "agent_findings": {},
            "mcp_tool_usage": {}
        }
    
    def _save_agent_context(self):
        """Save agent execution context"""
        context_file = Path(f".claude/agent_context_{self.session_id}.json")
        try:
            with open(context_file, 'w') as f:
                json.dump(self.agent_context, f, indent=2)
        except Exception as e:
            print(f"Failed to save agent context: {e}", file=sys.stderr)
    
    def handle_pre_tool_use(self) -> Dict[str, Any]:
        """Handle PreToolUse event for agent coordination"""
        # Check if this is a subagent (Task tool)
        if self.tool_name == "Task":
            return self._handle_subagent_creation()
        
        # Check for MCP tool usage and enforce priorities
        if self.tool_name.startswith("mcp__"):
            return self._handle_mcp_tool_usage()
        
        # Check if standard tools are being used inappropriately
        if self.tool_name in TOOL_PRIORITIES["fallback"]:
            return self._validate_standard_tool_usage()
        
        return {"continue": True}
    
    def _handle_subagent_creation(self) -> Dict[str, Any]:
        """Handle subagent creation and parallel execution"""
        subagent_prompt = self.tool_input.get("prompt", "")
        subagent_type = self.tool_input.get("subagent_type", "general-purpose")
        
        # Extract agent type from prompt if not specified
        agent_type = self._detect_agent_type(subagent_prompt)
        
        if agent_type:
            # Update active agents
            self.agent_context["active_agents"].append({
                "type": agent_type,
                "start_time": time.time(),
                "prompt": subagent_prompt[:200] + "..." if len(subagent_prompt) > 200 else subagent_prompt
            })
            
            # Check if we should suggest parallel execution
            parallel_suggestion = self._suggest_parallel_execution(agent_type)
            
            if parallel_suggestion:
                context_message = f"""
{AGENT_PATTERNS[agent_type]['emoji']} Launching {agent_type} agent...

💡 **Parallel Execution Opportunity:**
Consider running these agents simultaneously for better efficiency:
{parallel_suggestion}

🎯 **Current Wave:** {self.agent_context['current_wave'].title()}
📊 **Active Agents:** {len(self.agent_context['active_agents'])}
"""
                
                return {
                    "hookSpecificOutput": {
                        "hookEventName": "PreToolUse",
                        "permissionDecision": "allow",
                        "permissionDecisionReason": context_message
                    },
                    "continue": True
                }
        
        return {"continue": True}
    
    def _detect_agent_type(self, prompt: str) -> Optional[str]:
        """Detect agent type from prompt content"""
        prompt_lower = prompt.lower()
        
        # Check for explicit agent mentions
        for agent_type in AGENT_PATTERNS.keys():
            if agent_type in prompt_lower:
                return agent_type
        
        # Check for task-based detection
        if any(word in prompt_lower for word in ["component", "react", "ui", "frontend"]):
            return "frontend-developer"
        elif any(word in prompt_lower for word in ["review", "quality", "security", "lint"]):
            return "code-reviewer"
        elif any(word in prompt_lower for word in ["test", "spec", "jest", "cypress"]):
            return "test-automator"
        elif any(word in prompt_lower for word in ["api", "endpoint", "service", "backend"]):
            return "api-architect"
        elif any(word in prompt_lower for word in ["translation", "i18n", "locale", "language"]):
            return "i18n-specialist"
        elif any(word in prompt_lower for word in ["coordinate", "orchestrate", "manage", "parallel"]):  
            return "orchestrator"
        
        return None
    
    def _suggest_parallel_execution(self, agent_type: str) -> str:
        """Suggest compatible agents for parallel execution"""
        if agent_type not in AGENT_PATTERNS:
            return ""
        
        compatible = AGENT_PATTERNS[agent_type]["parallel_compatible"]
        if not compatible or compatible == ["all"]:
            return ""
        
        suggestions = []
        for comp_agent in compatible[:3]:  # Limit to 3 suggestions
            if comp_agent in AGENT_PATTERNS:
                emoji = AGENT_PATTERNS[comp_agent]["emoji"]
                suggestions.append(f"{emoji} {comp_agent}")
        
        return "\n".join(f"• {suggestion}" for suggestion in suggestions)
    
    def _handle_mcp_tool_usage(self) -> Dict[str, Any]:
        """Handle MCP tool usage and track for optimization"""
        # Track MCP tool usage
        tool_category = self._categorize_mcp_tool(self.tool_name)
        
        if tool_category:
            if tool_category not in self.agent_context["mcp_tool_usage"]:
                self.agent_context["mcp_tool_usage"][tool_category] = 0
            self.agent_context["mcp_tool_usage"][tool_category] += 1
        
        # Provide positive reinforcement for MCP tool usage
        if self.tool_name.startswith("mcp__serena__"):
            message = f"✅ Excellent! Using Serena MCP tool: {self.tool_name.replace('mcp__serena__', '')}"
        elif self.tool_name.startswith("mcp__context7__"):
            message = f"📚 Great! Using Context7 MCP tool: {self.tool_name.replace('mcp__context7__', '')}"
        else:
            message = f"🔧 Using MCP tool: {self.tool_name}"
        
        return {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "allow", 
                "permissionDecisionReason": message
            },
            "continue": True
        }
    
    def _categorize_mcp_tool(self, tool_name: str) -> Optional[str]:
        """Categorize MCP tool for usage tracking"""
        for category, tools in TOOL_PRIORITIES.items():
            if tool_name in tools:
                return category
        return None
    
    def _validate_standard_tool_usage(self) -> Dict[str, Any]:
        """Validate that standard tools are only used when MCP tools can't help"""
        tool_name = self.tool_name
        
        # Check if there's a better MCP alternative
        mcp_alternative = self._suggest_mcp_alternative(tool_name)
        
        if mcp_alternative:
            suggestion_message = f"""
⚠️ Consider using MCP tools for better performance:

Instead of: {tool_name}
Try: {mcp_alternative}

MCP tools provide semantic understanding and better integration with the project context.
"""
            
            return {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "ask",
                    "permissionDecisionReason": suggestion_message
                },
                "continue": True
            }
        
        return {"continue": True}
    
    def _suggest_mcp_alternative(self, tool_name: str) -> Optional[str]:
        """Suggest MCP alternatives for standard tools"""
        alternatives = {
            "Read": "mcp__serena__find_symbol (for code) or mcp__serena__search_for_pattern",
            "Grep": "mcp__serena__search_for_pattern",
            "Edit": "mcp__serena__replace_symbol_body",
            "Glob": "mcp__serena__find_file"
        }
        
        return alternatives.get(tool_name)
    
    def handle_post_tool_use(self) -> Dict[str, Any]:
        """Handle PostToolUse event"""
        # Track tool success/failure
        tool_response = self.input_data.get("tool_response", {})
        success = tool_response.get("success", True)
        
        if not success and self.tool_name.startswith("mcp__"):
            return {
                "decision": "block",
                "reason": f"MCP tool {self.tool_name} failed. Please check configuration and try again."
            }
        
        return {"continue": True}
    
    def handle_subagent_stop(self) -> Dict[str, Any]:
        """Handle SubagentStop event"""
        # Update agent context
        if self.agent_context["active_agents"]:
            # Remove completed agent
            self.agent_context["active_agents"] = [
                agent for agent in self.agent_context["active_agents"]
                if time.time() - agent["start_time"] < 300  # Remove agents older than 5 minutes
            ]
        
        # Save updated context
        self._save_agent_context()
        
        # Provide completion summary
        summary = f"""
🎉 Agent completed successfully!

📊 **Session Summary:**
• Active Agents: {len(self.agent_context['active_agents'])}
• MCP Tool Usage: {sum(self.agent_context['mcp_tool_usage'].values())} total calls
• Current Wave: {self.agent_context['current_wave'].title()}

🚀 **Next Steps:** Consider launching complementary agents for comprehensive coverage.
"""
        
        return {
            "hookSpecificOutput": {
                "hookEventName": "SubagentStop",
                "additionalContext": summary
            },
            "continue": True
        }

def main():
    """Main entry point"""
    try:
        input_data = json.load(sys.stdin)
        coordinator = AgentCoordinator(input_data)
        
        hook_event = input_data.get("hook_event_name", "")
        
        response = {"continue": True}
        
        if hook_event == "PreToolUse":
            response = coordinator.handle_pre_tool_use()
        elif hook_event == "PostToolUse":  
            response = coordinator.handle_post_tool_use()
        elif hook_event == "SubagentStop":
            response = coordinator.handle_subagent_stop()
        
        # Save context changes
        coordinator._save_agent_context()
        
        if "hookSpecificOutput" in response or "decision" in response:
            print(json.dumps(response))
        
        sys.exit(0)
        
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Agent coordination error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()