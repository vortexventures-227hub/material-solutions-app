const { loadEnvConfig } = require('@next/env');

loadEnvConfig(process.cwd());

const hasTokenAuth = Boolean(process.env.FSM_BACKEND_TOKEN || process.env.FSM_SERVICE_JWT);
const hasLoginAuth = Boolean(process.env.FSM_BACKEND_EMAIL && process.env.FSM_BACKEND_PASSWORD);
const requiredLogin = ['FSM_BACKEND_EMAIL', 'FSM_BACKEND_PASSWORD'];
const optional = ['FSM_BACKEND_TOKEN', 'FSM_SERVICE_JWT', 'FSM_PUBLISH_BRIDGE_TOKEN'];
const backendUrl = (
  process.env.FSM_BACKEND_URL ||
  process.env.FSM_API_BASE ||
  'https://vortex-forklift-api-production.up.railway.app'
).trim().replace(/\\n/g, '').replace(/\/+$/, '');

console.log('Forklift Sales Machine storefront env check');
console.log(`Backend URL: ${backendUrl}`);
console.log('Login auth:', requiredLogin.map((key) => `${key}=${process.env[key] ? 'set' : 'missing'}`).join(', '));
console.log('Optional:', optional.map((key) => `${key}=${process.env[key] ? 'set' : 'missing'}`).join(', '));

if (!hasTokenAuth && !hasLoginAuth) {
  console.error('Missing FSM service auth: set FSM_SERVICE_JWT/FSM_BACKEND_TOKEN or FSM_BACKEND_EMAIL plus FSM_BACKEND_PASSWORD');
  process.exit(1);
}

console.log('FSM storefront env is ready.');
