import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import config from './config';
import Models from './Models';

export const createTokens = async (user, secret, secret2) => {
  console.log(_.pick(user, ['id', 'idAdmin']), _.pick(user, 'id'));
  const { id, username } = user;
  const createToken = jwt.sign(
    {
      user: { id, username },
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

export const refreshTokens = async (
  token,
  refreshToken,
  models,
  SECRET,
  SECRET2,
) => {
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
  const refreshSecret = user.password + SECRET2;
  try {
    jwt.verify(refreshToken, refreshSecret);
  } catch (err) {
    return {};
  }

  const [newToken, newRefreshToken] = await createTokens(
    user,
    SECRET,
    refreshSecret,
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

export const addUser = async (req, res, next) => {
  const token = req.headers['x-token'];

  if (token) {
    try {
      const { user } = jwt.verify(token, config.SECRET);
      req.user = user;
    } catch (err) {
      const refreshToken = req.headers['x-refresh-token'];
      const newTokens = await refreshTokens(
        token,
        refreshToken,
        Models,
        config.SECRET,
        config.SECRET2,
      );
      if (newTokens.token && newTokens.refreshToken) {
        res.set('Aceess-Control-Expose-Headers', 'x-token, x-refresh-token');
        res.set('x-token', newTokens.token);
        res.set('x-refresh-token', newTokens.refreshToken);
      }
      req.user = newTokens.user;
    }
  }
  next();
};
