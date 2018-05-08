import { withFilter } from 'graphql-subscriptions';
import { requiresAuth, requiresTeamAccess } from '../permissions';
import pubsub from '../pubsub';
import config from '../config';

const NEW_CHANNEL_MESSAGE = 'NEW_CHANNEL_MESSAGE';

export default {
  Subscription: {
    newChannelMessage: {
      subscribe: requiresTeamAccess.createResolver(
        withFilter(
          () => pubsub.asyncIterator(NEW_CHANNEL_MESSAGE),
          (payload, args) => payload.channelId === args.channelId,
        ),
      ),
    },
  },
  Message: {
    url: parent =>
      parent.url
        ? `http://${config.BASE_URL}:${config.PORT}/${parent.url}`
        : parent.url,
    user: ({ user, userId }, args, { models }) => {
      if (user) {
        return user;
      }
      return models.User.findOne({ where: { id: userId } }, { raw: true });
    },
  },
  Query: {
    messages: requiresAuth.createResolver(
      async (parent, { channelId, cursor }, { models, user }) => {
        const channel = await models.Channel.findOne({
          raw: true,
          where: { id: channelId },
        });

        if (!channel.public) {
          const member = await models.PCMember.findOne({
            raw: true,
            where: { channelId, userId: user.id },
          });
          if (!member) {
            throw new Error('Not Authorized');
          }
        }

        const options = {
          order: [['created_at', 'DESC']],
          where: { channelId },
          limit: 35,
        };

        if (cursor) {
          options.where.id = {
            [models.op.lt]: cursor,
          };
        }

        return models.Message.findAll(options, { raw: true });
      },
    ),
  },
  Mutation: {
    createMessage: requiresAuth.createResolver(
      async (parent, { file, ...args }, { models, user }) => {
        try {
          const messageData = args;
          if (file) {
            messageData.filetype = file.type;
            messageData.url = file.path;
          }
          const message = await models.Message.create({
            ...args,
            userId: user.id,
          });
          const user_db = await models.User.findOne({ where: { id: user.id } });
          console.log(user_db);
          pubsub.publish(NEW_CHANNEL_MESSAGE, {
            channelId: args.channelId,
            newChannelMessage: {
              ...message.dataValues,
              user: user_db.dataValues,
            },
          });

          return true;
        } catch (err) {
          console.log(err);
          return false;
        }
      },
    ),
  },
};
