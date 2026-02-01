const crypto = require("crypto");
const axios = require("axios");
const w3 = require("../config/w3oidc");
const stateStore = require("./stateStore");
const jwt = require("jsonwebtoken");
const APP_SECRET = process.env.APP_JWT_SECRET || "secretkey";
function login(req, res) {
  const state = crypto.randomBytes(16).toString("hex");
  const nonce = crypto.randomBytes(16).toString("hex");

  stateStore.save(state, nonce);

  const redirect =
    `${w3.authUrl}?response_type=code` +
    `&client_id=${w3.clientId}` +
    `&redirect_uri=${encodeURIComponent(w3.redirectUri)}` +
    `&scope=openid profile email` +
    `&state=${state}` +
    `&nonce=${nonce}`;

  res.redirect(redirect);
}

async function callback(req, res) {
  const { code, state } = req.query;

  if (!code || !state || !stateStore.validate(state)) {
    return res.status(400).json({ error: "Invalid state or code" });
  }

  stateStore.remove(state);

  try {
    const tokenResponse = await axios.post(
      w3.tokenUrl,
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: w3.redirectUri,
        client_id: w3.clientId,
        client_secret: w3.clientSecret
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const { id_token } = tokenResponse.data;

    // 🔐 Decode ID token (identity from IBM Verify)
    const decoded = jwt.decode(id_token);

    const user = {
      w3id: decoded.uid,          // employee id
      email: decoded.email,
      name: decoded.name
    };

    // 🪙 ISSUE APP JWT (THIS IS THE IMPORTANT PART)
    const appToken = jwt.sign(
      user,
      APP_SECRET,
      { expiresIn: "1h" }
    );

    // ✅ Return only app token
    res.json({
      message: "Login successful",
      token: appToken,
      user
    });

    // console.log("Callback reached, redirecting to frontend");
    // res.redirect("http://localhost:3000");

    //Redirect to frontend with token

//     res.redirect(
//   `http://localhost:3000?token=${appToken}&user=${encodeURIComponent(
//     JSON.stringify(user)
//   )}`
// );


  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Token exchange failed" });
  }
}



module.exports = { login, callback };
