import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const checkout = readFileSync(
    new URL(
        '../../resources/js/pages/customer/checkout/checkout.tsx',
        import.meta.url,
    ),
    'utf8',
);
const summary = checkout.indexOf('<aside');
const methods = checkout.indexOf('<fieldset');
const paymentButton = checkout.indexOf("'Bayar Sekarang'");

assert.ok(summary >= 0 && methods > summary && paymentButton > methods);
assert.equal((checkout.match(/name="payment_method"/g) ?? []).length, 1);
assert.match(checkout, /grid grid-cols-3/);
assert.match(checkout, /type="radio"/);
assert.match(checkout, /peer-focus-visible:ring-2/);
assert.match(checkout, /disabled=\{placingOrder\}/);
assert.match(checkout, /!paymentMethod/);
assert.match(checkout, /!agreed/);
assert.doesNotMatch(
    checkout,
    /paymentGroups|method\.group|Midtrans Snap|Bayar dengan Midtrans|ongkir Biteship/,
);

for (const method of [
    'bca_va',
    'bni_va',
    'bri_va',
    'echannel',
    'permata_va',
    'other_qris',
    'gopay',
    'shopeepay',
]) {
    const logo = readFileSync(
        new URL(`../../public/images/payments/${method}.png`, import.meta.url),
    );
    assert.equal(logo.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
}

console.log(
    'Checkout payment layout and local logos: PASS (source checks; browser QA required).',
);
