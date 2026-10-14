import test from 'node:test'; import assert from 'node:assert/strict';
import { calcTotals } from '../src/utils/pricing.js';
test('adds delivery fee under threshold', () => assert.deepEqual(calcTotals([{ unitPrice: 500, qty: 2 }]), { subtotal: 1000, deliveryFee: 60, discount: 0, total: 1060 }));
test('free delivery at 1500', () => assert.equal(calcTotals([{ unitPrice: 1500, qty: 1 }]).deliveryFee, 0));
test('5% discount at 3000', () => assert.equal(calcTotals([{ unitPrice: 1500, qty: 2 }]).total, 2850));
test('empty cart is zero', () => assert.equal(calcTotals([]).total, 0));
