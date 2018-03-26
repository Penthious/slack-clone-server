export default (e, models) => {
  if (e instanceof models.sequelize.ValidationError) {
    return e.errors.map(error => {
      const { path, message } = error;
      return { path, message };
    });
  }
  return [{ path: 'Unknown', message: 'Something went wrong' }];
};
