// A download size for a label: one decimal in MB, whole KB below that (binary
// units, as file managers show them). Null when the size is unknown.
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return null;
  const kb = Math.max(1, Math.round(bytes / 1024));
  if (kb < 1024) return `${kb} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}
