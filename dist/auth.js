'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addUser = exports.tryLogin = exports.refreshTokens = exports.createTokens = undefined;

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _Models = require('./Models');

var _Models2 = _interopRequireDefault(_Models);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const createTokens = exports.createTokens = async (user, secret, secret2) => {
  const { id, username } = user;
  const createToken = _jsonwebtoken2.default.sign({
    user: { id, username }
  }, secret, {
    expiresIn: '6h'
  });

  const createRefreshToken = _jsonwebtoken2.default.sign({
    user: { id }
  }, secret2, {
    expiresIn: '7d'
  });

  return [createToken, createRefreshToken];
};

const refreshTokens = exports.refreshTokens = async (token, refreshToken, models, SECRET, SECRET2) => {
  let userId = -1;
  try {
    const { user: { id } } = _jsonwebtoken2.default.decode(refreshToken);
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
    _jsonwebtoken2.default.verify(refreshToken, refreshSecret);
  } catch (err) {
    return {};
  }

  const [newToken, newRefreshToken] = await createTokens(user, SECRET, refreshSecret);
  return {
    token: newToken,
    refreshToken: newRefreshToken,
    user
  };
};

const tryLogin = exports.tryLogin = async (email, password, models, SECRET, SECRET2) => {
  const user = await models.User.findOne({ where: { email }, raw: true });
  if (!user) {
    // user with provided email not found
    return {
      ok: false,
      errors: [{ path: 'email', message: 'Invalid Creds' }]
    };
  }

  const valid = await _bcrypt2.default.compare(password, user.password);
  if (!valid) {
    // bad password
    return {
      ok: false,
      errors: [{ path: 'password', message: 'Invalid Creds' }]
    };
  }

  const [token, refreshToken] = await createTokens(user, SECRET, user.password + SECRET2);

  return {
    ok: true,
    token,
    refreshToken
  };
};

const addUser = exports.addUser = async (req, res, next) => {
  const token = req.headers['x-token'];

  if (token) {
    try {
      const { user } = _jsonwebtoken2.default.verify(token, _config2.default.SECRET);
      req.user = user;
    } catch (err) {
      const refreshToken = req.headers['x-refresh-token'];
      const newTokens = await refreshTokens(token, refreshToken, _Models2.default, _config2.default.SECRET, _config2.default.SECRET2);
      if (newTokens.token && newTokens.refreshToken) {
        res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token');
        res.set('x-token', newTokens.token);
        res.set('x-refresh-token', newTokens.refreshToken);
      }
      req.user = newTokens.user;
    }
  }
  next();
};