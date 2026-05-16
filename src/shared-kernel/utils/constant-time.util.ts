const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Garantiza tiempo minimo de ejecucion. Mitiga timing leaks que permitirian
 * enumerar cuentas / distinguir paths de fallo en endpoints de auth.
 *
 * Aplica espera tanto en exito como en throw. Si la operacion ya supero
 * `minMs`, no agrega delay (variabilidad natural enmascara la diferencia).
 */
export async function withMinDuration<T>(
  fn: () => Promise<T>,
  minMs: number,
): Promise<T> {
  const start = Date.now();
  try {
    return await fn();
  } finally {
    const elapsed = Date.now() - start;
    if (elapsed < minMs) {
      await sleep(minMs - elapsed);
    }
  }
}
