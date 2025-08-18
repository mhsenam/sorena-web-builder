// Custom dev server runner that completely bypasses OneDrive issues
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Set all environment variables to disable tracing
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NEXT_TRACE_DISABLED = '1';
process.env.TRACE_TARGET = 'none';
process.env.NODE_ENV = 'development';
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

// Create temp directory for .next build
const tempDir = path.join(os.tmpdir(), 'nextjs-builds', 'sorena-web-builder');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
  console.log(`✓ Created temp build directory: ${tempDir}`);
}

console.log('🚀 Starting Next.js with OneDrive-safe configuration...');
console.log(`📁 Build directory: ${tempDir}`);
console.log('⚙️  Tracing disabled, telemetry disabled');

// Start Next.js dev server
const nextProcess = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
  }
});

nextProcess.on('error', (err) => {
  console.error('Failed to start Next.js:', err);
  process.exit(1);
});

nextProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Next.js exited with code ${code}`);
  }
  process.exit(code);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  nextProcess.kill('SIGINT');
  process.exit(0);
});