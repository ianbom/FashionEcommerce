import assert from 'node:assert/strict';
import { getOrderWorkflow } from '../../resources/js/lib/order-workflow.ts';

const base = { payment_status: 'pending', order_status: 'pending_payment', shipping_status: 'not_created' };

for (const [status, step] of [['pending_payment', 0], ['paid', 1], ['processing', 2], ['ready_to_ship', 3], ['shipped', 4], ['delivered', 5], ['completed', 6]]) {
    const order = { ...base, order_status: status, payment_status: step ? 'paid' : 'pending', shipping_status: step >= 5 ? 'delivered' : 'not_created' };
    assert.equal(getOrderWorkflow(order).currentStep, step);
    assert.equal(getOrderWorkflow(order).completed, status === 'completed');
}

assert.equal(getOrderWorkflow({ ...base, payment_status: 'paid', shipment: { shipping_status: 'confirmed' } }).currentStep, 1);

for (const status of ['failed', 'expired', 'cancelled', 'manual_review', 'refunded', 'partially_refunded']) {
    const result = getOrderWorkflow({ ...base, payment_status: status });
    assert.ok(result.issue);
    assert.equal(result.completed, false);
}

const lost = getOrderWorkflow({ ...base, payment_status: 'paid', order_status: 'shipment_failed', shipping_status: 'lost', shipment: { shipped_at: '2026-10-21T01:00:00Z' } });
assert.equal(lost.currentStep, 4);
assert.ok(lost.issue);
assert.equal(lost.completed, false);
assert.equal(getOrderWorkflow({ ...base, order_status: 'completed' }).completed, false);
assert.equal(getOrderWorkflow({ ...base, payment_status: 'paid', booking_uncertain: true }).completed, false);
assert.ok(getOrderWorkflow({ ...base, payment_status: 'paid', booking_uncertain: true }).issue);
console.log('Order workflow: PASS');
