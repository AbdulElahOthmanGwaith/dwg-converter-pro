const assert = require('node:assert/strict');
const { escapeHtml } = require('../security-utils.js');

assert.equal(
    escapeHtml('<img src=x onerror=alert(1)>'),
    '&lt;img src=x onerror=alert(1)&gt;'
);
assert.equal(
    escapeHtml('" onmouseover="alert(1)'),
    '&quot; onmouseover=&quot;alert(1)'
);
assert.equal(escapeHtml(null), '');

console.log('DWG converter security regression tests passed');
