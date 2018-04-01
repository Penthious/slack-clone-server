import bcrypt from 'bcrypt';
export default (sequelize, DataTypes) => {
  const Member = sequelize.define('members', {});

  return Member;
};
