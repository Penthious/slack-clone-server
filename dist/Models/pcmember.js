'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = sequelize => {
  const PCMember = sequelize.define('pcmembers', {});

  return PCMember;
};