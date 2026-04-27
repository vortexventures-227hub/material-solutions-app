const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

test('legacy marketplace route can be imported at server boot', () => {
  const route = require('../routes/marketplace');
  assert.equal(typeof route, 'function');
});

test('server entrypoint can boot without missing module errors', () => {
  const result = spawnSync(
    process.execPath,
    ['-e', "require('./server'); setTimeout(() => process.exit(0), 100)"],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: { ...process.env, PORT: '0' },
    },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
});
