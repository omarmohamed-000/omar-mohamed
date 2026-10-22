import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateOrderReadiness,
  generateOrderId,
  getOrderTrackingStatus
} from './order-logic';

test('generateOrderId formats correctly with YZR prefix', () => {
  const id = generateOrderId(5421);
  assert.equal(id, 'YZR-5421');
  const randomId = generateOrderId();
  assert.match(randomId, /^YZR-\d{4}$/);
});

test('validateOrderReadiness detects missing fields and gives 0 score on empty', () => {
  const result = validateOrderReadiness({});
  assert.equal(result.isValid, false);
  assert.ok(result.missingFields.includes('category'));
  assert.ok(result.missingFields.includes('size'));
  assert.ok(result.missingFields.includes('color'));
  assert.ok(result.missingFields.includes('artwork'));
  assert.equal(result.readinessScore, 0);
});

test('validateOrderReadiness succeeds when size, color, category and artwork are provided', () => {
  const result = validateOrderReadiness({
    category: 'tshirts',
    size: 'L',
    color: '#094d45',
    customText: 'يوزرسيف 2026',
    hasDesignFile: false,
    quantity: 2
  });
  assert.equal(result.isValid, true);
  assert.equal(result.missingFields.length, 0);
  assert.equal(result.readinessScore, 100);
});

test('validateOrderReadiness recognizes uploaded design file as valid artwork', () => {
  const result = validateOrderReadiness({
    category: 'tshirts',
    size: 'XL',
    color: '#000000',
    hasDesignFile: true
  });
  assert.equal(result.isValid, true);
  assert.equal(result.readinessScore, 100);
});

test('validateOrderReadiness skips size requirement for non-wearables like mugs or stickers', () => {
  const result = validateOrderReadiness({
    category: 'mugs',
    color: '#FFFFFF',
    customText: 'لوجو الشركة',
    hasDesignFile: false
  });
  assert.equal(result.isValid, true);
  assert.equal(result.missingFields.length, 0);
});

test('getOrderTrackingStatus returns valid stages for tracking order ID', () => {
  const tracking = getOrderTrackingStatus('YZR-4921');
  assert.equal(tracking.found, true);
  assert.equal(tracking.orderId, 'YZR-4921');
  assert.equal(tracking.steps.length, 4);
  assert.ok(tracking.steps.some(s => s.isCurrent));
});

test('getOrderTrackingStatus handles empty order ID gracefully', () => {
  const tracking = getOrderTrackingStatus('');
  assert.equal(tracking.found, false);
});
