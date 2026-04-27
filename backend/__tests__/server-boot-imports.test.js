const test = require('node:test');
const assert = require('node:assert/strict');

test('legacy marketplace route can be imported at server boot', () => {
  const route = require('../routes/marketplace');
  assert.equal(typeof route, 'function');
});
