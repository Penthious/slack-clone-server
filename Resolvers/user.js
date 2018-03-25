import bcrypt from 'bcrypt';
import { tryLogin } from '../auth';

const formatErrors = (e, models) => {
  if (e instanceof models.sequelize.ValidationError) {
    return e.errors.map(error => {
      const { path, message } = error;
      return { path, message };
    });
  }
  return [{ path: 'Unknown', message: 'Something went wrong' }];
};
export default {
  Query: {
    getUser: (parent, { id }, { models }) =>
      console.log(id, models.User) || models.User.findOne({ where: { id } }),
    allUsers: (parent, args, { models }) => models.User.findAll(),
  },
  Mutation: {
    login: (parent, { email, password }, { models, SECRET, SECRET2 }) =>
      tryLogin(email, password, models, SECRET, SECRET2),
    register: async (parent, { password, ...args }, { models }) => {
      try {
        if (password.length < 5 || password.length > 100) {
          return {
            ok: false,
            errors: [
              {
                path: 'password',
                message:
                  'Password needs to be between 5 and 100 characters long',
              },
            ],
          };
        }
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await models.User.create({
          ...args,
          password: hashedPassword,
        });

        return {
          ok: true,
          user,
        };
      } catch (err) {
        return {
          ok: false,
          errors: formatErrors(err, models),
        };
      }
    },
  },
};
