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
import DataLoader from 'dataloader';

import models from './Models';
import config from './config';
import { refreshTokens, addUser } from './auth';
import fileMiddleware from './fileMiddleware';
import { channelBatcher } from './batchFunctions';

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './Schema')));
const resolvers = mergeResolvers(
  fileLoader(path.join(__dirname, './Resolvers')),
);

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const app = express();
app.use(cors('*'));

app.use(addUser);

const endpointURL = '/graphql';
const subscriptionsURL = '/subscriptions';

app.use(
  endpointURL,
  bodyParser.json(),
  fileMiddleware,
  graphqlExpress(req => ({
    schema,
    context: {
      models,
      user: req.user,
      SECRET: config.SECRET,
      SECRET2: config.SECRET2,
      channelLoader: new DataLoader(ids =>
        channelBatcher(ids, models, req.user),
      ),
    },
  })),
);
app.use(
  '/graphiql',
  graphiqlExpress({
    endpointURL,
    subscriptionsEndpoint: `ws://${config.BASE_URL}:${
      config.PORT
    }${subscriptionsURL}`,
  }),
);
app.use('/files', express.static('files'));

const server = createServer(app);

models.sequelize.sync().then(() => {
  server.listen(config.PORT, () => {
    // eslint-disable-next-line no-new
    new SubscriptionServer(
      {
        execute,
        subscribe,
        schema,
        onConnect: async ({ token, refreshToken }) => {
          if (token && refreshToken) {
            try {
              const { user } = jwt.verify(token, config.SECRET);
              return { models, user };
            } catch (err) {
              const newTokens = await refreshTokens(
                token,
                refreshToken,
                models,
                config.SECRET,
                config.SECRET2,
              );
              return { models, user: newTokens.user };
            }
          }
          return { models };
        },
      },
      {
        server,
        path: subscriptionsURL,
      },
    );
  });
});

export default app;
