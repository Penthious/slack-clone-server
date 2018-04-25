import { Pool } from 'pg';
import chai from './helpers/chai';
import server from '../index';
import { sequelize } from '../Models';

beforeEach(async done => {
  await sequelize.sync({ force: true });
  done();
});

afterEach(async done => {
  done();
});
describe('user resolvers', () => {
  //   test('allUsers', async done => {
  //     const { data } = await chai.request(server).post('/graphql', {
  //       query: `
  //         query {
  //           allUsers {
  //             id
  //             username
  //             email
  //           }
  //         }
  //       `,
  //     });
  //     console.log(data);
  //     expect(data).toMatchObject({
  //       data: {
  //         allUsers: [],
  //       },
  //     });
  //     await done();
  //   });

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
});
