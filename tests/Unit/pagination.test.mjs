import assert from 'node:assert/strict';
import { paginationDirection } from '../../resources/js/lib/pagination.ts';

for (const label of [
    'pagination.previous',
    'Previous',
    'previous',
    ' PREVIOUS ',
    '&laquo; Previous',
    '&laquo;',
    '\u00ab',
    '\u00ab Previous',
]) {
    assert.equal(paginationDirection(label), 'previous', label);
}

for (const label of [
    'pagination.next',
    'Next',
    'next',
    ' NEXT ',
    'Next &raquo;',
    '&raquo;',
    '\u00bb',
    'Next \u00bb',
]) {
    assert.equal(paginationDirection(label), 'next', label);
}

for (const label of ['1', '12', '...', '\u2026', '']) {
    assert.equal(paginationDirection(label), null, label);
}

console.log('Pagination direction: PASS');
