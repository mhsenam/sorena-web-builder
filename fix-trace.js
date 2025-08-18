// Workaround for Next.js 15 trace file permission issues
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

// Set environment variables
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_ENV = 'development';

// Function to ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Create .next directory if it doesn't exist
const nextDir = path.join(__dirname, '.next');
ensureDir(nextDir);

// Pre-create the trace file with write permissions
const traceFile = path.join(nextDir, 'trace');
try {
  // Create an empty trace file if it doesn't exist
  if (!fs.existsSync(traceFile)) {
    fs.writeFileSync(traceFile, '', { mode: 0o666 });
    console.log('✓ Created trace file with proper permissions');
  } else {
    // Ensure existing file has write permissions
    fs.chmodSync(traceFile, 0o666);
    console.log('✓ Fixed trace file permissions');
  }
} catch (err) {
  console.log('⚠ Could not create/modify trace file, attempting alternative approach...');
  
  // Alternative: Create a dummy trace file that's always writable
  try {
    const handle = fs.openSync(traceFile, 'w');
    fs.closeSync(handle);
  } catch (e) {
    console.log('⚠ Trace file handling failed, continuing anyway...');
  }
}

console.log('🚀 Starting Next.js development server...');
console.log('📁 Working directory:', __dirname);

// Start Next.js
const child = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname,
  env: {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: '1',
    NEXT_TRACE_DISABLED: '1',
  }
});

child.on('error', (error) => {
  console.error('Failed to start:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  child.kill('SIGINT');
});