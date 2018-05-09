'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _sequelize = require('sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const sequelize = new _sequelize2.default(process.env.TEST_DB || _config2.default.database, _config2.default.username, _config2.default.password, {
  dialect: 'postgres',
  operatorsAliases: _sequelize2.default.Op,
  host: process.env.DB_HOST || 'localhost',
  define: {
    underscored: true
  }
});

const Models = {
  Channel: sequelize.import('./channel'),
  DirectMessage: sequelize.import('./directMessage'),
  Member: sequelize.import('./member'),
  Message: sequelize.import('./message'),
  PCMember: sequelize.import('./pcmember'),
  Team: sequelize.import('./team'),
  User: sequelize.import('./user')
};

Object.keys(Models).forEach(modelName => {
  if ('associate' in Models[modelName]) {
    Models[modelName].associate(Models);
  }
});

Models.sequelize = sequelize;
Models.Sequelize = _sequelize2.default;
Models.op = _sequelize2.default.Op;

exports.default = Models;