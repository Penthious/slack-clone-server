import Sequelize from 'sequelize';
import config from '../config';

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    dialect: 'postgres',
    operatorsAliases: Sequelize.Op,
    define: {
      underscored: true,
    },
  },
);

const Models = {
  Channel: sequelize.import('./channel'),
  Member: sequelize.import('./member'),
  Message: sequelize.import('./message'),
  Team: sequelize.import('./team'),
  User: sequelize.import('./user'),
  DirectMessage: sequelize.import('./directMessage'),
};

Object.keys(Models).forEach(modelName => {
  console.log(modelName);
  if ('associate' in Models[modelName]) {
    Models[modelName].associate(Models);
  }
  console.log(modelName, Models[modelName]);
});

Models.sequelize = sequelize;
Models.Sequelize = Sequelize;

export default Models;
