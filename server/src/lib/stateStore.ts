/**
 * In-memory store for OAuth state and nonce (CSRF protection).
 * Used only by w3 SSO login flow.
 */
const store = new Map<string, string>();

export function save(state: string, nonce: string): void {
  store.set(state, nonce);
}

export function validate(state: string): boolean {
  return store.has(state);
}

export function remove(state: string): void {
  store.delete(state);
}
