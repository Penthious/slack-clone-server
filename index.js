import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import path from 'path';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import cors from 'cors';

import models from './Models';
import config from './config';

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

const endpointURL = '/graphql';

app.use(
  endpointURL,
  bodyParser.json(),
  graphqlExpress({
    schema,
    context: {
      models,
      user: { id: 1 },
      SECRET: config.SECRET,
      SECRET2: config.SECRET2,
    },
  }),
);
app.use('/graphiql', graphiqlExpress({ endpointURL }));

models.sequelize.sync().then(() => {
  app.listen(PORT);
});
