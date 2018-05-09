'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _apolloServerExpress = require('apollo-server-express');

var _graphqlTools = require('graphql-tools');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _mergeGraphqlSchemas = require('merge-graphql-schemas');

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _http = require('http');

var _graphql = require('graphql');

var _subscriptionsTransportWs = require('subscriptions-transport-ws');

var _dataloader = require('dataloader');

var _dataloader2 = _interopRequireDefault(_dataloader);

var _Models = require('./Models');

var _Models2 = _interopRequireDefault(_Models);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _auth = require('./auth');

var _fileMiddleware = require('./fileMiddleware');

var _fileMiddleware2 = _interopRequireDefault(_fileMiddleware);

var _batchFunctions = require('./batchFunctions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const typeDefs = (0, _mergeGraphqlSchemas.mergeTypes)((0, _mergeGraphqlSchemas.fileLoader)(_path2.default.join(__dirname, './Schema')));
const resolvers = (0, _mergeGraphqlSchemas.mergeResolvers)((0, _mergeGraphqlSchemas.fileLoader)(_path2.default.join(__dirname, './Resolvers')));

const schema = (0, _graphqlTools.makeExecutableSchema)({
  typeDefs,
  resolvers
});

const app = (0, _express2.default)();
app.use((0, _cors2.default)('*'));

app.use(_auth.addUser);

const endpointURL = '/graphql';
const subscriptionsURL = '/subscriptions';

app.use(endpointURL, _bodyParser2.default.json(), _fileMiddleware2.default, (0, _apolloServerExpress.graphqlExpress)(req => ({
  schema,
  context: {
    models: _Models2.default,
    user: req.user,
    SECRET: _config2.default.SECRET,
    SECRET2: _config2.default.SECRET2,
    channelLoader: new _dataloader2.default(ids => (0, _batchFunctions.channelBatcher)(ids, _Models2.default, req.user)),
    userLoader: new _dataloader2.default(ids => (0, _batchFunctions.userBatcher)(ids, _Models2.default, req.user))
  }
})));
app.use('/graphiql', (0, _apolloServerExpress.graphiqlExpress)({
  endpointURL,
  subscriptionsEndpoint: `ws://${_config2.default.BASE_URL}:${_config2.default.PORT}${subscriptionsURL}`
}));
app.use('/files', _express2.default.static('files'));

const server = (0, _http.createServer)(app);

_Models2.default.sequelize.sync().then(() => {
  server.listen(_config2.default.PORT, () => {
    // eslint-disable-next-line no-new
    new _subscriptionsTransportWs.SubscriptionServer({
      execute: _graphql.execute,
      subscribe: _graphql.subscribe,
      schema,
      onConnect: async ({ token, refreshToken }) => {
        if (token && refreshToken) {
          try {
            const { user } = _jsonwebtoken2.default.verify(token, _config2.default.SECRET);
            return { models: _Models2.default, user };
          } catch (err) {
            const newTokens = await (0, _auth.refreshTokens)(token, refreshToken, _Models2.default, _config2.default.SECRET, _config2.default.SECRET2);
            return { models: _Models2.default, user: newTokens.user };
          }
        }
        return { models: _Models2.default };
      }
    }, {
      server,
      path: subscriptionsURL
    });
  });
});

exports.default = app;