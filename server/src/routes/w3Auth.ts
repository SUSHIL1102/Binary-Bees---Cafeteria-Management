/**
 * W3 SSO OIDC routes (separate from mock login).
 * GET /login  -> redirect to w3 authorize
 * GET /callback -> exchange code, find/create Employee, issue app JWT, redirect to frontend with token
 */
import { Router, Request, Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { w3oidc, isW3Configured } from "../config/w3oidc.js";
import * as stateStore from "../lib/stateStore.js";
import { w3SsoLogin } from "../services/authService.js";

export const w3AuthRouter = Router();

const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";

/** Start w3 SSO: redirect user to w3 login */
w3AuthRouter.get("/login", (req: Request, res: Response) => {
  if (!isW3Configured()) {
    res.status(503).json({
      error: "W3 SSO is not configured. Set W3_CLIENT_ID, W3_CLIENT_SECRET, W3_AUTH_URL, W3_TOKEN_URL, W3_REDIRECT_URI.",
    });
    return;
  }

  const state = crypto.randomBytes(16).toString("hex");
  const nonce = crypto.randomBytes(16).toString("hex");
  stateStore.save(state, nonce);

  const redirect =
    `${w3oidc.authUrl}?response_type=code` +
    `&client_id=${encodeURIComponent(w3oidc.clientId)}` +
    `&redirect_uri=${encodeURIComponent(w3oidc.redirectUri)}` +
    `&scope=openid profile email` +
    `&state=${state}` +
    `&nonce=${nonce}`;

  res.redirect(redirect);
});

/** w3 callback handler: exchange code for tokens, get user from id_token, find/create Employee, issue app JWT, redirect to frontend. Exported for use at GET /auth/callback (provisioner-registered URI). */
export async function w3CallbackHandler(req: Request, res: Response): Promise<void> {
  const { code, state } = req.query as { code?: string; state?: string };

  if (!code || !state || !stateStore.validate(state)) {
    res.status(400).json({ error: "Invalid state or code" });
    return;
  }

  stateStore.remove(state);

  try {
    const tokenResponse = await fetch(w3oidc.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: w3oidc.redirectUri,
        client_id: w3oidc.clientId,
        client_secret: w3oidc.clientSecret,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const text = await tokenResponse.text();
      console.error("[w3/callback] token exchange failed:", tokenResponse.status, text);
      res.status(500).json({ error: "Token exchange failed" });
      return;
    }

    const tokenData = (await tokenResponse.json()) as { id_token?: string };
    const idToken = tokenData.id_token;

    if (!idToken) {
      console.error("[w3/callback] no id_token in response");
      res.status(500).json({ error: "No id_token in response" });
      return;
    }

    // Decode ID token (identity from w3 / IBM Verify)
    const decoded = jwt.decode(idToken) as { uid?: string; email?: string; name?: string } | null;
    if (!decoded?.uid) {
      console.error("[w3/callback] id_token missing uid");
      res.status(500).json({ error: "Invalid id_token" });
      return;
    }

    const w3Id = decoded.uid;
    const email = decoded.email ?? "";
    const name = decoded.name ?? decoded.email ?? w3Id;

    const { token, employee } = await w3SsoLogin(w3Id, email, name);

    res.redirect(
      `${CLIENT_URL}/auth/callback?token=${encodeURIComponent(token)}&employee=${encodeURIComponent(JSON.stringify(employee))}`
    );
  } catch (err) {
    console.error("[w3/callback]", err);
    res.status(500).json({ error: "Login failed" });
  }
}

w3AuthRouter.get("/callback", w3CallbackHandler);
