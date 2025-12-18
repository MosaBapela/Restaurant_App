export async function timeAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  // eslint-disable-next-line no-console
  console.debug(`[timing] start ${label}`);
  try {
    const result = await fn();
    const ms = Date.now() - start;
    // eslint-disable-next-line no-console
    console.debug(`[timing] end ${label} (${ms}ms)`);
    return result;
  } catch (err) {
    const ms = Date.now() - start;
    // eslint-disable-next-line no-console
    console.debug(`[timing] error ${label} (${ms}ms)`, err);
    throw err;
  }
}
