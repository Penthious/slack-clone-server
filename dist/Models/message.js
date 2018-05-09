'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = (sequelize, DataTypes) => {
  const Message = sequelize.define('messages', {
    text: DataTypes.STRING,
    url: DataTypes.STRING,
    filetype: DataTypes.STRING
  }, {
    indexes: [{
      fields: ['id']
    }]
  });

  Message.associate = models => {
    // 1:M
    Message.belongsTo(models.Channel, {
      foreignKey: {
        name: 'channelId',
        field: 'channel_id'
      }
    });
    Message.belongsTo(models.User, {
      foreignKey: {
        name: 'userId',
        field: 'user_id'
      }
    });
  };

  return Message;
};