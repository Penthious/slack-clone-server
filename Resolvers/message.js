import { requiresAuth } from '../permissions';
import { PubSub, withFilter } from 'graphql-subscriptions';

const pubsub = new PubSub();
const NEW_CHANNEL_MESSAGE = 'NEW_CHANNEL_MESSAGE';

export default {
  Subscription: {
    newChannelMessage: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(NEW_CHANNEL_MESSAGE),
        (payload, { channelId }) => payload.channelId === channelId,
      ),
    },
  },
  Message: {
    user: ({ user, userId }, args, { models }) => {
      if (user) {
        return user;
      }
      return models.User.findOne({ where: { id: userId } }, { raw: true });
    },
  },
  Query: {
    messages: requiresAuth.createResolver(
      async (parent, { channelId }, { models, user }) =>
        await models.Message.findAll(
          { order: [['created_at', 'ASC']], where: { channelId } },
          { raw: true },
        ),
    ),
  },
  Mutation: {
    createMessage: requiresAuth.createResolver(
      async (parent, args, { models, user }) => {
        try {
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
