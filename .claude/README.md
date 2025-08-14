# Claude Code Configuration for how.fm Dashboard

## 🎭 Parallel Agent System

### Available Agents
- 🎨 **frontend-developer** - Next.js 15 & React 19 specialist
- 🔍 **code-reviewer** - Quality assurance & standards enforcer  
- 🧪 **test-automator** - Testing & validation specialist
- 🏢 **api-architect** - Backend integration & API design
- 🌍 **i18n-specialist** - Translation & localization expert
- 🎭 **orchestrator** - Coordination master for parallel execution

### Wave-Based Execution
1. **🔍 Discovery Wave** - Analysis and research (5 agents parallel)
2. **🏗️ Planning Wave** - Architecture and design (5 agents parallel)  
3. **⚡ Implementation Wave** - Coding and building (5 agents parallel)
4. **✅ Validation Wave** - Testing and review (5 agents parallel)

## 🛡️ Security & Optimization Hooks

### Active Hooks
- **Security Validator** - Prevents dangerous operations and protects sensitive files
- **Agent Coordinator** - Manages parallel execution and agent communication
- **MCP Tool Optimizer** - Enforces Serena/Context7 MCP tool priority
- **Prompt Enhancer** - Suggests optimal agents and tools for requests

### Tool Priority
1. **Serena MCP** - Semantic code operations (primary)
2. **Context7 MCP** - Real-time documentation (secondary)  
3. **Standard tools** - Only when MCP tools cannot fulfill needs

## 🔧 Configuration Files

- `settings.json` - Project-wide hook configuration
- `settings.local.json` - Local permissions and overrides
- `agents/` - Specialized AI subagents
- `hooks/` - Automation scripts for quality and coordination

## 🚀 Usage

Agents are automatically invoked based on task context, or use explicitly:
```
"Use the frontend-developer to create a dashboard component"
"Have the orchestrator coordinate a 5-agent parallel implementation"
```

MCP tools are prioritized automatically through hooks for optimal performance.