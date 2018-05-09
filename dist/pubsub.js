'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _graphqlRedisSubscriptions = require('graphql-redis-subscriptions');

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = new _graphqlRedisSubscriptions.RedisPubSub({
  connection: {
    host: process.env.REDIS_HOST || _config2.default.REDIS_DOMAIN_NAME,
    port: _config2.default.REDIS_PORT,
    retry_strategy: options => Math.max(options.attempt * 100, 3000)
  }
});