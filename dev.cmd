@echo off
REM Batch script to run Next.js dev server with OneDrive compatibility

REM Set environment variables
set NEXT_TELEMETRY_DISABLED=1
set NEXT_TRACE_DISABLED=1
set TRACE_TARGET=none
set NODE_OPTIONS=--max-old-space-size=4096

REM Create .next directory if it doesn't exist
if not exist .next mkdir .next

REM Hide .next directory from OneDrive
attrib +h .next

echo Starting Next.js development server...
echo Environment configured for OneDrive compatibility

REM Run the dev server
call npm run dev