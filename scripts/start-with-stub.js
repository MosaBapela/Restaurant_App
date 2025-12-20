/*
  start-with-stub.js
  - Spawns Expo and the local payment stub as detached background processes.
  - Cross-platform (Windows/Unix) shell command execution.
  - Writes PIDs to .tmp/pids.json for easy debugging.
*/
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function spawnDetached(command, args, opts) {
  const child = spawn(command, args, Object.assign({ detached: true, stdio: 'ignore' }, opts));
  child.unref();
  return child;
}

function spawnShellCommand(cmd, opts) {
  if (process.platform === 'win32') {
    return spawnDetached('cmd.exe', ['/c', cmd], opts);
  }
  return spawnDetached('sh', ['-c', cmd], opts);
}

function ensureTmpDir() {
  const dir = path.resolve(__dirname, '..', '.tmp');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

(async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const tmp = ensureTmpDir();
  const pidsFile = path.join(tmp, 'pids.json');
  const results = {};

  try {
    // Expo start command (sets EXPO_ROUTER_APP_ROOT then starts expo)
    const expoCmd = process.platform === 'win32'
      ? 'set "EXPO_ROUTER_APP_ROOT=app/src/screens" && expo start'
      : 'EXPO_ROUTER_APP_ROOT=app/src/screens expo start';

    const expoProc = spawnShellCommand(expoCmd, { cwd: projectRoot, env: process.env });
    results.expo = { pid: expoProc.pid };

    // Payment stub
    const stubCmd = process.platform === 'win32'
      ? 'node ./serverless/payment_stub/index.js'
      : 'node ./serverless/payment_stub/index.js';

    const stubProc = spawnShellCommand(stubCmd, { cwd: projectRoot, env: process.env });
    results.stub = { pid: stubProc.pid };

    fs.writeFileSync(pidsFile, JSON.stringify(results, null, 2));

    console.log('Started background processes:');
    console.log(`- Expo (PID ${results.expo.pid})`);
    console.log(`- Payment stub (PID ${results.stub.pid})`);
    console.log(`PID file: ${pidsFile}`);
    console.log('Note: logs are detached. To view logs, run `tail -f` on platform-specific logs or start them manually.');
  } catch (err) {
    console.error('Failed to start background processes', err);
    process.exit(1);
  }
})();
