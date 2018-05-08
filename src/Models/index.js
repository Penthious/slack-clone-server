import Sequelize from 'sequelize';
import config from '../config';

const sequelize = new Sequelize(
  process.env.TEST_DB || config.database,
  config.username,
  config.password,
  {
    dialect: 'postgres',
    operatorsAliases: Sequelize.Op,
    host: process.env.DB_HOST || 'localhost',
    define: {
      underscored: true,
    },
  },
);

const Models = {
  Channel: sequelize.import('./channel'),
  DirectMessage: sequelize.import('./directMessage'),
  Member: sequelize.import('./member'),
  Message: sequelize.import('./message'),
  PCMember: sequelize.import('./pcmember'),
  Team: sequelize.import('./team'),
  User: sequelize.import('./user'),
};

Object.keys(Models).forEach(modelName => {
  if ('associate' in Models[modelName]) {
    Models[modelName].associate(Models);
  }
});

Models.sequelize = sequelize;
Models.Sequelize = Sequelize;
Models.op = Sequelize.Op;

export default Models;
