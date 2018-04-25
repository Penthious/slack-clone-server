import Sequelize from 'sequelize';
import config from '../config';

console.log('==========================');
console.log('==========================');
console.log('==========================');
console.log(process.env.TEST_DB);
export const sequelize = new Sequelize(
  process.env.TEST_DB || config.database,
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
  if ('associate' in Models[modelName]) {
    Models[modelName].associate(Models);
  }
});

Models.sequelize = sequelize;
Models.Sequelize = Sequelize;

export default Models;
