# W3 SSO Authentication

This module implements IBM W3 SSO using OpenID Connect (OIDC)
Authorization Code flow.

Responsibilities:
- Redirect user to W3 login
- Generate and validate state and nonce
- Handle fallback callback
- Exchange authorization code for tokens
- Extract W3 ID from ID token
