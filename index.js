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
import { refreshTokens, addUser } from './auth';

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
app.use(
  endpointURL,
  graphiqlExpress({
    endpointURL,
    subscriptionsEndpoint: `ws://localhost:${PORT}${subscriptionsURL}`,
  }),
);
const server = createServer(app);

models.sequelize.sync().then(() => {
  server.listen(PORT, () => {
    new SubscriptionServer(
      {
        execute,
        subscribe,
        schema,
        onConnect: async ({ token, refreshToken }, webSocket) => {
          if (token && refreshToken) {
            let user = null;
            try {
              const payload = jwt.verify(token, config.SECRET);
              user = payload.user;
            } catch (err) {
              const newTokens = await refreshTokens(
                token,
                refreshToken,
                models,
                config.SECRET,
                config.SECRET2,
              );
              user = newTokens.user;
            }
            if (!user) {
              throw new Error('Invalid auth tokens');
            }
            return true;
          }
          throw new Error('Missing auth tokens!');
        },
      },
      {
        server,
        path: subscriptionsURL,
      },
    );
  });
});
