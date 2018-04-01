import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import path from 'path';
import jwt from 'jsonwebtoken';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import cors from 'cors';
import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';

import models from './Models';
import config from './config';
import { refreshTokens } from './auth';

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './Schema')));
const resolvers = mergeResolvers(
  fileLoader(path.join(__dirname, './Resolvers')),
);

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const PORT = 8080;
const app = express();
app.use(cors('*'));

const addUser = async (req, res, next) => {
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
        models,
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
app.use(addUser);

const endpointURL = '/graphql';
const subscriptionsURL = '/subscriptions';

app.use(
  endpointURL,
  bodyParser.json(),
  graphqlExpress(req => ({
    schema,
    context: {
      models,
      user: req.user,
      SECRET: config.SECRET,
      SECRET2: config.SECRET2,
    },
  })),
);
app.use('/graphiql', graphiqlExpress({ endpointURL }));
const server = createServer(app);

models.sequelize.sync().then(() => {
  server.listen(PORT, () => {
    new SubscriptionServer(
      {
        execute,
        subscribe,
        schema,
      },
      {
        server,
        path: subscriptionsURL,
      },
    );
  });
});
