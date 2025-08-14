#!/bin/bash

# TypeScript Error Checker Hook for Claude Code
# Runs after Edit, MultiEdit, and Write operations to catch TypeScript errors early

set -e

# Change to project directory
cd "$CLAUDE_PROJECT_DIR"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Read hook input from stdin
input=$(cat)

# Extract tool information from JSON input
tool_name=$(echo "$input" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get('tool_name', ''))
except:
    print('')
")

# Only run on file modification tools
if [[ ! "$tool_name" =~ ^(Edit|MultiEdit|Write)$ ]]; then
    exit 0
fi

log "Running TypeScript type checking after $tool_name operation..."

# Run TypeScript type checking
if ! pnpm check-types 2>/tmp/ts-errors.txt; then
    log "TypeScript errors detected!"
    
    # Format error output for Claude
    echo "🚨 TypeScript errors detected after $tool_name operation:" >&2
    echo "" >&2
    echo "$(cat /tmp/ts-errors.txt)" >&2
    echo "" >&2
    echo "Please fix these TypeScript errors before proceeding." >&2
    
    # Clean up temp file
    rm -f /tmp/ts-errors.txt
    
    # Exit with code 2 to block and show errors to Claude
    exit 2
fi

log "✅ No TypeScript errors found"

# Clean up temp file
rm -f /tmp/ts-errors.txt

exit 0