#!/bin/bash
# ESLint Final Formatter Hook for Claude Code
# This hook runs ONLY when agents are completely done with their work
# It performs comprehensive ESLint formatting including import sorting
# This prevents premature removal of imports that subsequent agents might need

set -euo pipefail

# Debug mode (set DEBUG_HOOKS=1 to enable logging)
DEBUG_HOOKS=${DEBUG_HOOKS:-0}

debug_log() {
    if [ "$DEBUG_HOOKS" -eq 1 ]; then
        echo "[ESLint Final Format Hook] $*" >&2
    fi
}

# Read JSON input from stdin with error handling
input_json=""
if ! input_json=$(timeout 5s cat 2>/dev/null); then
    debug_log "Failed to read input from stdin"
    exit 0
fi

debug_log "Received input: $input_json"

# Extract hook event name with better error handling
hook_event=$(echo "$input_json" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get('hook_event_name', ''))
except Exception as e:
    print('', file=sys.stderr)
    sys.exit(0)
" 2>/dev/null || echo "")

debug_log "Hook event: $hook_event"

# Only run on Stop or SubagentStop events (when agents are done)
if [[ "$hook_event" != "Stop" && "$hook_event" != "SubagentStop" ]]; then
    debug_log "Not a Stop event, skipping final formatting"
    exit 0
fi

# Check if this is already a stop hook continuation to prevent recursion
stop_hook_active=$(echo "$input_json" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    active = data.get('stop_hook_active', False)
    print('True' if active else 'False')
except Exception:
    print('False')
" 2>/dev/null || echo "False")

if [[ "$stop_hook_active" == "True" ]]; then
    debug_log "Already in a stop hook, avoiding recursion"
    exit 0
fi

# Change to project directory with validation
if [ -n "${CLAUDE_PROJECT_DIR:-}" ] && [ -d "$CLAUDE_PROJECT_DIR" ]; then
    cd "$CLAUDE_PROJECT_DIR"
    debug_log "Changed to project directory: $CLAUDE_PROJECT_DIR"
else
    debug_log "CLAUDE_PROJECT_DIR not set or invalid, using current directory"
fi

# Validate we're in a valid project directory
if [ ! -f "package.json" ]; then
    debug_log "Not in a valid Node.js project directory, skipping ESLint"
    exit 0
fi

debug_log "Running comprehensive ESLint formatting on all project files..."

# Find all TypeScript/JavaScript files that exist and are readable
FILES_TO_FORMAT=""
if [ -d "src" ]; then
    FILES_TO_FORMAT=$(find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.mjs" -o -name "*.cjs" \) -readable 2>/dev/null | head -100 || true)
fi

if [ -z "$FILES_TO_FORMAT" ]; then
    debug_log "No JavaScript/TypeScript files found to format"
    exit 0
fi

# Count files
FILE_COUNT=$(echo "$FILES_TO_FORMAT" | wc -l)
debug_log "Found $FILE_COUNT files to check for formatting"

# Check if pnpm and lint:fix script exist
if ! command -v pnpm >/dev/null 2>&1; then
    debug_log "pnpm not found, skipping ESLint formatting"
    exit 0
fi

if ! pnpm run lint:fix --help >/dev/null 2>&1; then
    debug_log "lint:fix script not available, skipping ESLint formatting"
    exit 0
fi

# Run ESLint fix with proper signal handling and output redirection
# Use a more robust approach to handle SIGPIPE and other potential issues
{
    # Create a temporary log file for ESLint output
    temp_log=$(mktemp)
    trap "rm -f '$temp_log'" EXIT
    
    # Run ESLint with timeout and capture both stdout and stderr
    if timeout 30s pnpm run lint:fix >"$temp_log" 2>&1; then
        exit_code=0
    else
        exit_code=$?
    fi
    
    # Handle different exit codes appropriately
    case $exit_code in
        0)
            debug_log "Successfully ran ESLint formatting on entire project"
            echo "✅ ESLint formatting completed (including import sorting)"
            ;;
        124)
            debug_log "ESLint formatting timed out after 30 seconds"
            echo "⏱️ ESLint formatting timed out (project may be too large)"
            ;;
        141)
            debug_log "ESLint process received SIGPIPE (broken pipe) - this is normal"
            echo "✅ ESLint formatting completed (with SIGPIPE handling)"
            ;;
        *)
            debug_log "ESLint formatting completed with exit code: $exit_code"
            echo "⚠️ ESLint formatting completed (some files may have unresolved issues)"
            ;;
    esac
    
    # Clean up temp file
    rm -f "$temp_log"
} || {
    debug_log "ESLint formatting encountered an error but continuing"
    echo "⚠️ ESLint formatting encountered an issue but hook completed successfully"
}

# Always exit successfully to not block Claude
exit 0