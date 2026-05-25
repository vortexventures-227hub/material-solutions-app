const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const BACKEND_URL = (
  process.env.FSM_BACKEND_URL ||
  process.env.FSM_API_BASE ||
  'https://vortex-forklift-api-production.up.railway.app'
).trim().replace(/\\n/g, '').replace(/\/+$/, '');

async function assertBackendHealth() {
  const response = await fetch(`${BACKEND_URL}/health`);
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.status !== 'ok' || body?.database !== 'connected') {
    throw new Error(`Backend health failed: HTTP ${response.status}`);
  }
  console.log(`Backend health: OK (${body.responseTime || 'healthy'})`);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || ROOT,
    env: options.env || process.env,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit ${result.status}`);
  }
}

function parseEnvFile(filePath) {
  const env = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value.replace(/\\n/g, '\n').replace(/\\"/g, '"');
  }
  return env;
}

function withProductionStorefrontEnv() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fsm-live-smoke-'));
  const envFile = path.join(tmpDir, 'fsm.env');
  try {
    run('vercel', ['env', 'pull', envFile, '--environment=production', '--yes'], {
      cwd: path.join(ROOT, 'materialsolutionsnj'),
    });
    return parseEnvFile(envFile);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

async function main() {
  console.log('Forklift Sales Machine live smoke suite');
  await assertBackendHealth();

  run('npm', ['run', 'smoke:admin-deploy'], {
    cwd: path.join(ROOT, 'frontend'),
  });

  const storefrontEnv = {
    ...process.env,
    ...withProductionStorefrontEnv(),
  };
  run('npm', ['run', 'smoke:fsm-dry-run'], {
    cwd: path.join(ROOT, 'materialsolutionsnj'),
    env: storefrontEnv,
  });
}

main().catch((error) => {
  console.error(`Live smoke suite failed: ${error.message}`);
  process.exit(1);
});
