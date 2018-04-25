import bcrypt from 'bcrypt';
import { tryLogin, createTokens } from '../auth';
import formatErrors from '../formatErrors';
import { requiresAuth } from '../permissions';

export default {
  User: {
    teams: (parent, args, { models, user }) =>
      models.sequelize.query(
        'SELECT * FROM teams as team JOIN members as member on team.id = member.team_id WHERE member.user_id = ?',
        {
          replacements: [user.id],
          model: models.Team,
          raw: true,
        },
      ),
  },
  Query: {
    getUser: requiresAuth.createResolver((parent, { userId }, { models }) =>
      models.User.findOne({ where: { id: userId } }),
    ),
    allUsers: requiresAuth.createResolver((parent, args, { models }) =>
      models.User.findAll(),
    ),
    me: requiresAuth.createResolver((parent, args, { models, user }) =>
      models.User.findOne({ where: { id: user.id } }),
    ),
  },
  Mutation: {
    login: (parent, { email, password }, { models, SECRET, SECRET2 }) =>
      tryLogin(email, password, models, SECRET, SECRET2),
    register: async (parent, args, { models, SECRET, SECRET2 }) => {
      console.log(models);
      try {
        const user = await models.User.create(args);
        const [token, refreshToken] = await createTokens(
          user,
          SECRET,
          args.password + SECRET2,
        );

        console.log('token,', token, refreshToken);
        return {
          ok: true,
          user,
          token,
          refreshToken,
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
