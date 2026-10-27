export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: unknown };

/**
 * Settles a promise into a value or an error so callers can branch on the
 * outcome without wrapping JSX in try/catch, which would only ever catch the
 * await and never a rendering error.
 */
export async function attempt<T>(promise: Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, data: await promise };
  } catch (error) {
    return { ok: false, error };
  }
}
