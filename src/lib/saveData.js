// The visitor asked to save data, or is on a 2G-class connection: nothing is
// fetched on a guess.
export function saveData() {
  const connection = navigator.connection;
  return Boolean(
    connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType)
  );
}
