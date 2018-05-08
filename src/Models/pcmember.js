export default sequelize => {
  const PCMember = sequelize.define('pcmembers', {});

  return PCMember;
};
