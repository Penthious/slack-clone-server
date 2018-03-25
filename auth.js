import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import _ from 'lodash';

export const createTokens = async (user, secret, secret2) => {
  console.log(_.pick(user, ['id', 'idAdmin']), _.pick(user, 'id'));
  const { id } = user;
  const createToken = jwt.sign(
    {
      user: { id },
    },
    secret,
    {
      expiresIn: '6h',
    },
  );

  const createRefreshToken = jwt.sign(
    {
      user: { id },
    },
    secret2,
    {
      expiresIn: '7d',
    },
  );

  return [createToken, createRefreshToken];
};

export const refreshTokens = async (token, refreshToken, models, SECRET) => {
  let userId = -1;
  try {
    const { user: { id } } = jwt.decode(refreshToken);
    userId = id;
  } catch (err) {
    return {};
  }

  if (!userId) {
    return {};
  }

  const user = await models.User.findOne({ where: { id: userId }, raw: true });

  if (!user) {
    return {};
  }

  try {
    jwt.verify(refreshToken, user.refreshSecret);
  } catch (err) {
    return {};
  }

  const [newToken, newRefreshToken] = await createTokens(
    user,
    SECRET,
    user.refreshSecret,
  );
  return {
    token: newToken,
    refreshToken: newRefreshToken,
    user,
  };
};

export const tryLogin = async (email, password, models, SECRET, SECRET2) => {
  const user = await models.User.findOne({ where: { email }, raw: true });
  if (!user) {
    // user with provided email not found
    return {
      ok: false,
      errors: [{ path: 'email', message: 'Invalid Creds' }],
    };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    // bad password
    return {
      ok: false,
      errors: [{ path: 'password', message: 'Invalid Creds' }],
    };
  }

  const [token, refreshToken] = await createTokens(
    user,
    SECRET,
    user.password + SECRET2,
  );

  return {
    ok: true,
    token,
    refreshToken,
  };
};
