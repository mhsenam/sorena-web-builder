# TypeScript Error Checker Hook for Claude Code (Windows PowerShell version)
# Runs after Edit, MultiEdit, and Write operations to catch TypeScript errors early

param()

# Change to project directory
if ($env:CLAUDE_PROJECT_DIR) {
    Set-Location $env:CLAUDE_PROJECT_DIR
}

# Function to log with timestamp
function Write-Log {
    param($Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Output "[$timestamp] $Message"
}

# Read hook input from stdin
try {
    $input = [System.Console]::In.ReadToEnd()
} catch {
    Write-Log "Failed to read input"
    exit 0
}

# Extract tool information from JSON input
$toolName = ""
try {
    $data = $input | ConvertFrom-Json
    $toolName = $data.tool_name
    if (-not $toolName) { $toolName = "" }
} catch {
    $toolName = ""
}

# Only run on file modification tools
if ($toolName -notmatch "^(Edit|MultiEdit|Write)$") {
    exit 0
}

Write-Log "Running TypeScript type checking after $toolName operation..."

# Create temp file for errors
$tempFile = [System.IO.Path]::GetTempFileName()

# Run TypeScript type checking
try {
    $process = Start-Process -FilePath "pnpm" -ArgumentList "check-types" -NoNewWindow -Wait -PassThru -RedirectStandardError $tempFile
    
    if ($process.ExitCode -ne 0) {
        Write-Log "TypeScript errors detected!"
        
        # Read error content
        $errorContent = Get-Content $tempFile -Raw
        
        # Format error output for Claude
        Write-Error "🚨 TypeScript errors detected after $toolName operation:"
        Write-Error ""
        Write-Error $errorContent
        Write-Error ""
        Write-Error "Please fix these TypeScript errors before proceeding."
        
        # Clean up temp file
        Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
        
        # Exit with code 2 to block and show errors to Claude
        exit 2
    }
} catch {
    Write-Log "Failed to run type checking: $_"
    Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
    exit 0
}

Write-Log "✅ No TypeScript errors found"

# Clean up temp file
Remove-Item $tempFile -Force -ErrorAction SilentlyContinue

exit 0