'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.test = exports.tokens = exports.createUser = undefined;

var _auth = require('../../auth');

var _config = require('../../config');

var _config2 = _interopRequireDefault(_config);

var _Models = require('../../Models');

var _Models2 = _interopRequireDefault(_Models);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const createUser = exports.createUser = async (args = {
  username: 'tester',
  email: 'test@test.com',
  password: 'password'
}) => _Models2.default.User.create(args);

const tokens = exports.tokens = async args => {
  const user = await createUser(args);
  let secret2 = `password${_config2.default.SECRET2}`;
  if (args) {
    secret2 = args.password + _config2.default.SECRET2;
  }
  return (0, _auth.createTokens)(user, _config2.default.SECRET, secret2);
};

const test = exports.test = {};