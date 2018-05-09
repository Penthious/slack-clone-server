'use strict';var _chai=require('./helpers/chai'),_chai2=_interopRequireDefault(_chai),_index=require('../index'),_index2=_interopRequireDefault(_index),_Models=require('../Models'),_Models2=_interopRequireDefault(_Models),_auth=require('./helpers/auth');function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}beforeEach(async a=>{await _Models2.default.sequelize.sync({force:!0}),a()}),afterEach(async a=>{a()}),describe('user resolvers',()=>{test('allUsers',async a=>{const[b,c]=await(0,_auth.tokens)(),{body:d}=await _chai2.default.request(_index2.default).post('/graphql').send({query:`
          query {
            allUsers {
              id
              username
              email
            }
          }
        `}).set({"x-token":b,"x-refresh-token":c});expect(d).toMatchObject({data:{allUsers:[{email:'test@test.com',id:1,username:'tester'}]}}),a()}),test('register',async a=>{const{body:b}=await _chai2.default.request(_index2.default).post('/graphql').send({query:`
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
      `});expect(b).toMatchObject({data:{register:{ok:!0,errors:null,user:{username:'testuser',email:'test@user.com'}}}}),a()}),test('login',async a=>{await(0,_auth.createUser)({username:'tester',email:'test@test.com',password:'password'});const{body:b}=await _chai2.default.request(_index2.default).post('/graphql').send({query:`
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
      `});expect(b.data.login.token).toBeTruthy(),expect(b.data.login.refreshToken).toBeTruthy(),expect(b.data.login.ok).toBe(!0),expect(b.data.login.errors).toBeNull(),a()})});