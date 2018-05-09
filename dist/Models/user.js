'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (sequelize, DataTypes) => {
  const User = sequelize.define('users', {
    username: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isAlphanumeric: {
          args: true,
          msg: 'The username can only contain letters and numbers'
        },
        len: {
          args: [3, 25],
          msg: 'The username needs to be between 3 and 25 characters long'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: {
          args: true,
          msg: 'Invalid email'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [5, 100],
          msg: 'Password needs to be between 5 and 100 characters long'
        }
      }
    }
  }, {
    hooks: {
      afterValidate: async user => {
        user.password = await _bcrypt2.default.hash(user.password, 12);
      }
    }
  });

  User.associate = models => {
    // M:M
    User.belongsToMany(models.Team, {
      through: models.Member,
      foreignKey: {
        name: 'userId',
        field: 'user_id'
      }
    });
    User.belongsToMany(models.Channel, {
      through: 'channel_member',
      foreignKey: {
        name: 'userId',
        field: 'user_id'
      }
    });
    User.belongsToMany(models.Channel, {
      through: models.PCMember,
      foreignKey: {
        name: 'userId',
        field: 'user_id'
      }
    });
  };

  return User;
};