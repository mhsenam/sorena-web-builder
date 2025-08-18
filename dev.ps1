# PowerShell script to run Next.js dev server with OneDrive compatibility

# Set environment variables
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:NEXT_TRACE_DISABLED = "1"
$env:TRACE_TARGET = "none"
$env:NODE_OPTIONS = "--max-old-space-size=4096"

# Create .next directory with proper permissions if it doesn't exist
if (!(Test-Path .next)) {
    New-Item -ItemType Directory -Path .next -Force | Out-Null
}

# Set .next directory attributes to prevent OneDrive sync issues
$nextDir = Get-Item .next -Force
$nextDir.Attributes = 'Directory, Hidden'

Write-Host "Starting Next.js development server..." -ForegroundColor Green
Write-Host "Environment configured for OneDrive compatibility" -ForegroundColor Yellow

# Run the dev server
npm run dev