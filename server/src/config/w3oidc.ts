/**
 * W3 SSO / OIDC config from env.
 * Used only by w3Auth routes; does not affect mock login.
 */
export const w3oidc = {
  clientId: process.env.W3_CLIENT_ID ?? "",
  clientSecret: process.env.W3_CLIENT_SECRET ?? "",
  authUrl: process.env.W3_AUTH_URL ?? "",
  tokenUrl: process.env.W3_TOKEN_URL ?? "",
  redirectUri: process.env.W3_REDIRECT_URI ?? "",
};

export function isW3Configured(): boolean {
  return !!(w3oidc.clientId && w3oidc.clientSecret && w3oidc.authUrl && w3oidc.tokenUrl && w3oidc.redirectUri);
}
