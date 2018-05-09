'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _formatErrors = require('../formatErrors');

var _formatErrors2 = _interopRequireDefault(_formatErrors);

var _permissions = require('../permissions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  Mutation: {
    getOrCreateChannel: _permissions.requiresAuth.createResolver(async (parent, { members, teamId }, { models, user }) => {
      const member = await models.Member.findOne({ where: { teamId, userId: user.id } }, { raw: true });
      if (!member) {
        throw new Error('Not Authorized');
      }

      const allMembers = [...members, user.id];
      const [data, result] = await models.sequelize.query(`
    select c.id, c.name
    from channels as c, pcmembers pc
    where pc.channel_id = c.id and c.dm = true and c.public = false and c.team_id = ${teamId}
    group by c.id, c.name
    having array_agg(pc.user_id) @>
    Array[${allMembers.join(',')}] and count(pc.user_id) = ${allMembers.length};
    `, { raw: true });
      console.log(data, 'data');
      console.log(result, 'result');

      if (data.length) {
        console.log('we are error');
        return _extends({}, data[0], { ok: false });
      }
      const users = await models.User.findAll({
        raw: true,
        where: {
          id: {
            [models.sequelize.Op.in]: members
          }
        }
      });
      console.log(users, 'users');
      const name = users.map(u => u.username).join(', ');
      console.log(name, ' name');

      const channelId = await models.sequelize.transaction(async transaction => {
        const channel = await models.Channel.create({
          name,
          public: false,
          dm: true,
          teamId
        }, { transaction });
        console.log(channel, 'channel');
        const cId = channel.dataValues.id;
        console.log(cId, 'id');
        const pcmembers = allMembers.map(m => ({
          userId: m,
          channelId: cId
        }));
        console.log(pcmembers, 'members');
        await models.PCMember.bulkCreate(pcmembers, { transaction });

        return cId;
      });
      console.log(channelId, 'channelId is here', name);
      return { ok: true, name, id: channelId };
    }),
    createChannel: _permissions.requiresAuth.createResolver(async (parent, args, { models, user }) => {
      try {
        const member = await models.Member.findOne({ where: { teamId: args.teamId, userId: user.id } }, { raw: true });
        if (!member.admin) {
          return {
            ok: false,
            errors: [{
              path: 'name',
              message: 'You have to be the owner of the team to create channels'
            }]
          };
        }

        const response = await models.sequelize.transaction(async transaction => {
          const channel = await models.Channel.create(args, {
            transaction
          });
          if (!args.public) {
            const members = args.members.filter(m => m !== user.id);
            members.push(user.id);

            await models.PCMember.bulkCreate(members.map(m => ({
              userId: m,
              channelId: channel.dataValues.id
            })), { transaction });
          }
          return channel;
        });
        return {
          ok: true,
          channel: response
        };
      } catch (err) {
        console.log(err);
        return {
          ok: false,
          errors: (0, _formatErrors2.default)(err, models)
        };
      }
    })
  }
};