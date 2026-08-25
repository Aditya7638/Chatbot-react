export function formatMoney(amountCents) {
    return `₹${((amountCents / 100) * 40).toFixed(2)}`;
}