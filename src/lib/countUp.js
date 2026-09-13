// Splits an editor-typed stat like "$12k" or "1,200" into the parts a count-up
// can animate; returns null when there is no number to count (emoji, "∞").
const STAT = /^(\D*?)(\d(?:[\d,]*\d)?(?:\.\d+)?)(.*)$/s;

export function parseStat(value) {
  if (typeof value !== 'string') return null;
  const match = value.match(STAT);
  if (!match) return null;
  const [, prefix, digits, suffix] = match;
  const [, fraction = ''] = digits.split('.');
  return {
    prefix,
    number: Number(digits.replace(/,/g, '')),
    suffix,
    decimals: fraction.length,
    grouping: digits.includes(',')
  };
}

export function formatStat(n, { prefix, suffix, decimals, grouping }) {
  const formatted = new Intl.NumberFormat('en', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouping
  }).format(n);
  return `${prefix}${formatted}${suffix}`;
}
