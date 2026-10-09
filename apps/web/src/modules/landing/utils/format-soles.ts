/** `50 → "S/ 50.00"`, `6.25 → "S/ 6.25"`. Siempre con dos decimales: es un precio. */
export const formatSoles = (amount: number): string => `S/ ${amount.toFixed(2)}`;
