export default {
  Query: {
    getUser: (parent, { id }, { models }) =>
      console.log(id, models.User) || models.User.findOne({ where: { id } }),
    allUsers: (parent, args, { models }) => models.User.findAll(),
  },
  Mutation: {
    createUser: (parent, args, { User }) => User.create(args),
  },
};
