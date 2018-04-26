import { createTokens } from '../../auth';
import config from '../../config';
import models from '../../Models';

export const createUser = async (
  args = {
    username: 'tester',
    email: 'test@test.com',
    password: 'password',
  },
) => models.User.create(args);

export const tokens = async args => {
  const user = await createUser(args);
  let secret2 = `password${config.SECRET2}`;
  if (args) {
    secret2 = args.password + config.SECRET2;
  }
  return createTokens(user, config.SECRET, secret2);
};

export const test = {};
