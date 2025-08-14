# ESLint Final Formatter Hook for Claude Code (Windows PowerShell version)
# This hook runs ONLY when agents are completely done with their work
# It performs comprehensive ESLint formatting including import sorting
# This prevents premature removal of imports that subsequent agents might need

param()

# Debug mode (set $env:DEBUG_HOOKS=1 to enable logging)
$DEBUG_HOOKS = if ($env:DEBUG_HOOKS) { $env:DEBUG_HOOKS } else { "0" }

function Debug-Log {
    param($Message)
    if ($DEBUG_HOOKS -eq "1") {
        Write-Error "[ESLint Final Format Hook] $Message"
    }
}

# Read JSON input from stdin with timeout
$inputJson = ""
try {
    $inputTask = [System.Threading.Tasks.Task]::Run({
        $input = [System.Console]::In.ReadToEnd()
        return $input
    })
    
    if ($inputTask.Wait(5000)) {
        $inputJson = $inputTask.Result
    } else {
        Debug-Log "Failed to read input from stdin (timeout)"
        exit 0
    }
} catch {
    Debug-Log "Failed to read input from stdin: $_"
    exit 0
}

Debug-Log "Received input: $inputJson"

# Extract hook event name
$hookEvent = ""
try {
    $data = $inputJson | ConvertFrom-Json
    $hookEvent = $data.hook_event_name
    if (-not $hookEvent) { $hookEvent = "" }
} catch {
    Debug-Log "Failed to parse JSON: $_"
    exit 0
}

Debug-Log "Hook event: $hookEvent"

# Only run on Stop or SubagentStop events (when agents are done)
if ($hookEvent -ne "Stop" -and $hookEvent -ne "SubagentStop") {
    Debug-Log "Not a Stop event, skipping final formatting"
    exit 0
}

# Check if this is already a stop hook continuation to prevent recursion
$stopHookActive = $false
try {
    $data = $inputJson | ConvertFrom-Json
    $stopHookActive = $data.stop_hook_active
    if (-not $stopHookActive) { $stopHookActive = $false }
} catch {
    $stopHookActive = $false
}

if ($stopHookActive -eq $true) {
    Debug-Log "Already in a stop hook, avoiding recursion"
    exit 0
}

# Change to project directory with validation
if ($env:CLAUDE_PROJECT_DIR -and (Test-Path $env:CLAUDE_PROJECT_DIR)) {
    Set-Location $env:CLAUDE_PROJECT_DIR
    Debug-Log "Changed to project directory: $env:CLAUDE_PROJECT_DIR"
} else {
    Debug-Log "CLAUDE_PROJECT_DIR not set or invalid, using current directory"
}

# Validate we're in a valid project directory
if (-not (Test-Path "package.json")) {
    Debug-Log "Not in a valid Node.js project directory, skipping ESLint"
    exit 0
}

Debug-Log "Running comprehensive ESLint formatting on all project files..."

# Find all TypeScript/JavaScript files that exist and are readable
$filesToFormat = @()
if (Test-Path "src") {
    $filesToFormat = Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx","*.js","*.jsx","*.mjs","*.cjs" -File | 
                     Select-Object -First 100 | 
                     Where-Object { $_.Exists }
}

if ($filesToFormat.Count -eq 0) {
    Debug-Log "No JavaScript/TypeScript files found to format"
    exit 0
}

# Count files
$fileCount = $filesToFormat.Count
Debug-Log "Found $fileCount files to check for formatting"

# Check if pnpm exists
$pnpmPath = Get-Command pnpm -ErrorAction SilentlyContinue
if (-not $pnpmPath) {
    Debug-Log "pnpm not found, skipping ESLint formatting"
    exit 0
}

# Check if lint:fix script exists by checking package.json
try {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    if (-not ($packageJson.scripts.'lint:fix')) {
        Debug-Log "lint:fix script not found in package.json, skipping ESLint formatting"
        exit 0
    }
} catch {
    Debug-Log "Failed to read package.json: $_"
    exit 0
}

# Run ESLint fix with timeout
try {
    # Create a job to run ESLint with timeout
    $job = Start-Job -ScriptBlock {
        param($workDir)
        Set-Location $workDir
        & pnpm run lint:fix 2>&1
    } -ArgumentList (Get-Location).Path
    
    # Wait for job with timeout (30 seconds)
    $completed = $job | Wait-Job -Timeout 30
    
    if ($completed) {
        $result = Receive-Job -Job $job
        $exitCode = $job.State
        
        if ($exitCode -eq "Completed") {
            Debug-Log "Successfully ran ESLint formatting on entire project"
            Write-Host "✅ ESLint formatting completed (including import sorting)"
        } else {
            Debug-Log "ESLint formatting completed with issues"
            Write-Host "⚠️ ESLint formatting completed (some files may have unresolved issues)"
        }
    } else {
        Stop-Job -Job $job
        Debug-Log "ESLint formatting timed out after 30 seconds"
        Write-Host "⏱️ ESLint formatting timed out (project may be too large)"
    }
    
    Remove-Job -Job $job -Force
} catch {
    Debug-Log "ESLint formatting encountered an error: $_"
    Write-Host "⚠️ ESLint formatting encountered an issue but hook completed successfully"
}

# Always exit successfully to not block Claude
exit 0