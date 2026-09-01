import { it, expect, describe } from 'vitest';
import { formatMoney } from './money';

describe('formatMoney', () => {
    it('formats 400 cents as ₹160.00', () => {
        expect(formatMoney(400)).toBe('₹160.00');
    });

    it('displays 2 decimals', () => {
        expect(formatMoney(480)).toBe('₹192.00');
        expect(formatMoney(100)).toBe('₹40.00');
    });
});