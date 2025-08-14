#!/usr/bin/env python3
"""
Prompt Enhancer Hook for Claude Code
Enhances user prompts with agent coordination and MCP tool usage guidance
"""

import json
import sys
import re
from typing import Dict, Any, List, Optional

# Agent task patterns for automatic delegation
AGENT_TASK_PATTERNS = {
    "frontend-developer": [
        r"(?i)\b(component|react|ui|frontend|tailwind|css|responsive|layout)\b",
        r"(?i)\b(next\.?js|app router|server component|client component)\b",
        r"(?i)\b(hook|state|zustand|form|validation)\b"
    ],
    "code-reviewer": [
        r"(?i)\b(review|quality|security|lint|standards|best practices)\b",
        r"(?i)\b(refactor|optimize|clean|improve)\b",
        r"(?i)\b(check|validate|audit|analyze)\b"
    ],
    "test-automator": [
        r"(?i)\b(test|spec|jest|cypress|testing|unit test|integration)\b",
        r"(?i)\b(mock|stub|coverage|tdd|bdd)\b",
        r"(?i)\b(expect|assert|should|describe|it)\b"
    ],
    "api-architect": [
        r"(?i)\b(api|endpoint|service|backend|rest|graphql)\b",
        r"(?i)\b(tanstack|query|mutation|fetch|axios|http)\b",
        r"(?i)\b(database|model|schema|dto|crud)\b"
    ],
    "i18n-specialist": [
        r"(?i)\b(translation|i18n|locale|language|internationalization)\b",
        r"(?i)\b(translate|localize|region|country|language)\b",
        r"(?i)\b(string|text|message|label)\b"
    ],
    "orchestrator": [
        r"(?i)\b(coordinate|orchestrate|manage|parallel|workflow)\b",
        r"(?i)\b(multiple|several|batch|group|team)\b",
        r"(?i)\b(plan|strategy|roadmap|architecture)\b"
    ]
}

# MCP tool usage hints
MCP_USAGE_HINTS = {
    "code_search": [
        r"(?i)\b(find|search|locate|look for)\b.*\b(function|class|method|component)\b",
        r"(?i)\b(where is|show me|get|fetch)\b.*\b(code|implementation)\b"
    ],
    "documentation": [
        r"(?i)\b(docs|documentation|how to|guide|tutorial)\b",
        r"(?i)\b(react|next|tailwind|typescript|javascript)\b.*\b(docs|documentation)\b"
    ],
    "code_editing": [
        r"(?i)\b(edit|modify|change|update|replace)\b.*\b(function|class|method)\b",
        r"(?i)\b(add|insert|remove|delete)\b.*\b(code|line|block)\b"
    ]
}

class PromptEnhancer:
    def __init__(self, input_data: Dict[str, Any]):
        self.input_data = input_data
        self.prompt = input_data.get("prompt", "")
        self.session_id = input_data.get("session_id", "")
        
    def enhance_prompt(self) -> Dict[str, Any]:
        """Main prompt enhancement logic"""
        if not self.prompt.strip():
            return {"continue": True}
        
        # Detect potential agent needs
        suggested_agents = self._detect_agent_needs()
        
        # Detect MCP tool opportunities
        mcp_suggestions = self._detect_mcp_opportunities()
        
        # Check for parallel execution opportunities
        parallel_suggestion = self._suggest_parallel_execution()
        
        # Build enhancement context
        enhancement_context = self._build_enhancement_context(
            suggested_agents, mcp_suggestions, parallel_suggestion
        )
        
        if enhancement_context:
            return {
                "hookSpecificOutput": {
                    "hookEventName": "UserPromptSubmit",
                    "additionalContext": enhancement_context
                },
                "continue": True
            }
        
        return {"continue": True}
    
    def _detect_agent_needs(self) -> List[str]:
        """Detect which agents might be needed for this prompt"""
        suggested_agents = []
        
        for agent_type, patterns in AGENT_TASK_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, self.prompt):
                    suggested_agents.append(agent_type)
                    break  # Avoid duplicates
        
        return suggested_agents
    
    def _detect_mcp_opportunities(self) -> List[str]:
        """Detect opportunities to use MCP tools"""
        opportunities = []
        
        for category, patterns in MCP_USAGE_HINTS.items():
            for pattern in patterns:
                if re.search(pattern, self.prompt):
                    opportunities.append(category)
                    break
        
        return opportunities
    
    def _suggest_parallel_execution(self) -> Optional[str]:
        """Suggest parallel execution if multiple tasks detected"""
        task_indicators = [
            r"(?i)\b(and|also|then|after|plus|additionally)\b",
            r"(?i)\b(multiple|several|both|all)\b",
            r"(?i)\b(feature|component|page|section)\b.*\b(and|with|plus)\b"
        ]
        
        for pattern in task_indicators:
            if re.search(pattern, self.prompt):
                return "parallel_suggested"
        
        return None
    
    def _build_enhancement_context(
        self, 
        suggested_agents: List[str], 
        mcp_suggestions: List[str],
        parallel_suggestion: Optional[str]
    ) -> str:
        """Build the enhancement context to add to the prompt"""
        if not (suggested_agents or mcp_suggestions or parallel_suggestion):
            return ""
        
        context_parts = []
        
        # Add agent suggestions
        if suggested_agents:
            agent_info = []
            for agent in suggested_agents[:3]:  # Limit to 3 agents
                emoji = self._get_agent_emoji(agent)
                agent_info.append(f"{emoji} **{agent}**")
            
            context_parts.append(f"""
🎭 **Suggested Agent Delegation:**
Consider using these specialized agents for optimal results:
{chr(10).join(f'• {info}' for info in agent_info)}
""")
        
        # Add MCP tool suggestions
        if mcp_suggestions:
            mcp_tools = self._get_mcp_tool_recommendations(mcp_suggestions)
            if mcp_tools:
                context_parts.append(f"""
🚀 **MCP Tool Recommendations:**
For better performance and accuracy, prioritize these tools:
{chr(10).join(f'• {tool}' for tool in mcp_tools)}
""")
        
        # Add parallel execution suggestion
        if parallel_suggestion and len(suggested_agents) > 1:
            context_parts.append(f"""
⚡ **Parallel Execution Opportunity:**
This task can benefit from running multiple agents simultaneously:
• Launch agents in waves for maximum efficiency
• Use the orchestrator to coordinate between agents
• Share findings between agents to avoid duplicate work
""")
        
        # Add general MCP usage reminder
        context_parts.append(f"""
🔧 **Tool Priority Reminder:**
1. **Serena MCP** - Use for all code operations (semantic understanding)
2. **Context7 MCP** - Use for real-time documentation
3. Standard tools - Only when MCP tools cannot fulfill the need
""")
        
        return "\n".join(context_parts)
    
    def _get_agent_emoji(self, agent_type: str) -> str:
        """Get emoji for agent type"""
        emojis = {
            "frontend-developer": "🎨",
            "code-reviewer": "🔍", 
            "test-automator": "🧪",
            "api-architect": "🏢",
            "i18n-specialist": "🌍",
            "orchestrator": "🎭"
        }
        return emojis.get(agent_type, "🤖")
    
    def _get_mcp_tool_recommendations(self, categories: List[str]) -> List[str]:
        """Get specific MCP tool recommendations based on categories"""
        recommendations = {
            "code_search": [
                "`mcp__serena__find_symbol` - Find functions/classes by name",
                "`mcp__serena__search_for_pattern` - Search code patterns"
            ],
            "documentation": [
                "`mcp__context7__get-library-docs` - Get latest library docs",
                "`mcp__context7__resolve-library-id` - Find correct library"
            ],
            "code_editing": [
                "`mcp__serena__replace_symbol_body` - Edit functions/classes",
                "`mcp__serena__get_symbols_overview` - Understand code structure"
            ]
        }
        
        tools = []
        for category in categories:
            if category in recommendations:
                tools.extend(recommendations[category])
        
        return list(set(tools))  # Remove duplicates

def main():
    """Main entry point"""
    try:
        input_data = json.load(sys.stdin)
        
        # Only enhance UserPromptSubmit events
        if input_data.get("hook_event_name") != "UserPromptSubmit":
            sys.exit(0)
        
        enhancer = PromptEnhancer(input_data)
        response = enhancer.enhance_prompt()
        
        if "hookSpecificOutput" in response:
            print(json.dumps(response))
        
        sys.exit(0)
        
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Prompt enhancement error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()