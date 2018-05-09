'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const channelBatcher = exports.channelBatcher = async (ids, models, user) => {
  const results = await models.sequelize.query(`
    select distinct on (id) *
    from channels as c
    left outer join pcmembers as pc
    on c.id = pc.channel_id
    where c.team_id in (:teamIds) and (c.public = true or pc.user_id = :userId);
    `, {
    replacements: { teamIds: ids, userId: user.id },
    model: models.Channel,
    raw: true
  });

  const data = {};

  results.forEach(r => {
    if (data[r.team_id]) {
      data[r.team_id].push(r);
    } else {
      data[r.team_id] = [r];
    }
  });

  return ids.map(id => data[id]);
};
const directMessageBatcher = exports.directMessageBatcher = async (ids, models, user) => {
  const results = await models.sequelize.query('select distinct on (u.id) u.id, u.username from users as u join direct_messages as dm on (u.id = dm.sender_id) or (u.id = dm.receiver_id) where (:currentUserId = dm.sender_id or :currentUserId = dm.receiver_id) and dm.team_id = :teamId', {
    replacements: { currentUserId: user.id, teamId: ids[0] },
    model: models.User,
    raw: true
  });

  const data = {};

  results.forEach(r => {
    if (data[r.team_id]) {
      data[r.team_id].push(r);
    } else {
      data[r.team_id] = [r];
    }
  });
  return ids.map(id => data[id]).filter(Boolean);
};
const memberBatcher = exports.memberBatcher = () => {};
const messageBatcher = exports.messageBatcher = () => {};
const pcmemberBatcher = exports.pcmemberBatcher = () => {};
const teamBatcher = exports.teamBatcher = () => {};
const meBatcher = exports.meBatcher = (ids, models) => {
  models.User.findAll({ where: { id: { [models.op.in]: ids } } });
};