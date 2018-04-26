import chai from './helpers/chai';
import server from '../index';
import models from '../Models';
import { createUser, tokens } from './helpers/auth';

beforeEach(async done => {
  await models.sequelize.sync({ force: true });
  done();
});

afterEach(async done => {
  done();
});
describe('user resolvers', () => {
  test('allUsers', async done => {
    const [token, refreshToken] = await tokens();
    const { body } = await chai
      .request(server)
      .post('/graphql')
      .send({
        query: `
          query {
            allUsers {
              id
              username
              email
            }
          }
        `,
      })
      .set({
        'x-token': token,
        'x-refresh-token': refreshToken,
      });
    expect(body).toMatchObject({
      data: {
        allUsers: [
          {
            email: 'test@test.com',
            id: 1,
            username: 'tester',
          },
        ],
      },
    });
    done();
  });

  test('register', async done => {
    console.log('here we go');
    const { body } = await chai
      .request(server)
      .post('/graphql')
      .send({
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
      `,
      });
    expect(body).toMatchObject({
      data: {
        register: {
          ok: true,
          errors: null,
          user: {
            username: 'testuser',
            email: 'test@user.com',
          },
        },
      },
    });
    done();
  });

  test('login', async done => {
    const user = await createUser({
      username: 'tester',
      email: 'test@test.com',
      password: 'password',
    });

    console.log(user, 'aoeuathaoeuntsaoeusntaoehuaoetns');

    const { body } = await chai
      .request(server)
      .post('/graphql')
      .send({
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
      `,
      });

    expect(body.data.login.token).toBeTruthy();
    expect(body.data.login.refreshToken).toBeTruthy();
    expect(body.data.login.ok).toBe(true);
    expect(body.data.login.errors).toBeNull();
    done();
  });
});
