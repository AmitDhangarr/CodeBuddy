import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.SECRET_TOKEN);

export const createToken = async (payload) => {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(secret);

  return token;
};

// ── Verify token & return payload (throws if invalid) ────────────────────────
export const getPayload = async (token) => {
  const { payload } = await jwtVerify(token, secret);
  return payload;
};