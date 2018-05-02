import { RedisPubSub } from 'graphql-redis-subscriptions';
import config from './config';

export default new RedisPubSub({
  connection: {
    host: config.REDIS_DOMAIN_NAME,
    port: config.REDIS_PORT,
    retry_strategy: options => Math.max(options.attempt * 100, 3000),
  },
});
