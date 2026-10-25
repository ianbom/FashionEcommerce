import assert from 'node:assert/strict';
import { httpUrl } from '../../resources/js/lib/http-url.ts';

for (const value of [null, 3, {}, '', '/storage/label.pdf', '//tracking.test', 'javascript:alert(1)', 'data:text/html,test', ' https://tracking.test', 'https://tracking.test ']) {
    assert.equal(httpUrl(value), null);
}

assert.equal(httpUrl('https://tracking.test/order?id=1'), 'https://tracking.test/order?id=1');
assert.equal(httpUrl('http://tracking.test'), 'http://tracking.test/');
assert.equal(httpUrl('HTTPS://tracking.test'), 'https://tracking.test/');
console.log('HTTP URL validation: PASS');
