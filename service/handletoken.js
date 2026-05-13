import jsontokens from "jsonwebtoken";

// create token
const secrets = process.env.SECRET_TOKEN;

export const createToken = (payload) => {
  try {
    const token = jsontokens.sign(payload,
      secrets,
    );

    return token;

  } catch (error) {
    console.log(error);
  }
};

// verify token

export const getPayload = (token) => {
  try {
    const payload = jsontokens.verify(token, secrets);
    return payload;
  } catch (error) {
    return error;
  }
};
