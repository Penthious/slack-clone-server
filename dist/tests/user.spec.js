'use strict';

var _chai = require('./helpers/chai');

var _chai2 = _interopRequireDefault(_chai);

var _index = require('../index');

var _index2 = _interopRequireDefault(_index);

var _Models = require('../Models');

var _Models2 = _interopRequireDefault(_Models);

var _auth = require('./helpers/auth');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

beforeEach(async done => {
  await _Models2.default.sequelize.sync({ force: true });
  done();
});

afterEach(async done => {
  done();
});
describe('user resolvers', () => {
  test('allUsers', async done => {
    const [token, refreshToken] = await (0, _auth.tokens)();
    const { body } = await _chai2.default.request(_index2.default).post('/graphql').send({
      query: `
          query {
            allUsers {
              id
              username
              email
            }
          }
        `
    }).set({
      'x-token': token,
      'x-refresh-token': refreshToken
    });
    expect(body).toMatchObject({
      data: {
        allUsers: [{
          email: 'test@test.com',
          id: 1,
          username: 'tester'
        }]
      }
    });
    done();
  });

  test('register', async done => {
    const { body } = await _chai2.default.request(_index2.default).post('/graphql').send({
      query: `
        mutation {
          register(username: "testuser", email: "test@user.com", password: "testuser" ), {
            ok
            errors {
              path
              message
            }
            user {
              username
              email
            }
          }
        }
      `
    });
    expect(body).toMatchObject({
      data: {
        register: {
          ok: true,
          errors: null,
          user: {
            username: 'testuser',
            email: 'test@user.com'
          }
        }
      }
    });
    done();
  });

  test('login', async done => {
    await (0, _auth.createUser)({
      username: 'tester',
      email: 'test@test.com',
      password: 'password'
    });

    const { body } = await _chai2.default.request(_index2.default).post('/graphql').send({
      query: `
          mutation {
            login(email: "test@test.com", password: "password") {
              ok
              token
              refreshToken
              errors {
                path
                message
              }
            }
          }
      `
    });

    expect(body.data.login.token).toBeTruthy();
    expect(body.data.login.refreshToken).toBeTruthy();
    expect(body.data.login.ok).toBe(true);
    expect(body.data.login.errors).toBeNull();
    done();
  });
});