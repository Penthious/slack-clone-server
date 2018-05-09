"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=`
  type Channel {
    id: Int!
    name: String!
    public: Boolean!
    messages: [Message!]!
    users: [User!]!
    dm: Boolean!
  }

  type ChannelResponse {
    ok: Boolean!
    channel: Channel
    errors: [Error!]
  }

  type DMChannelResponse {
    id: Int!
    name: String!
    ok: Boolean!
  }

  type Mutation {
    createChannel(teamId: Int!, name: String!, public: Boolean=false, members: [Int!]): ChannelResponse!
    getOrCreateChannel(members: [Int!]!, teamId: Int!): DMChannelResponse!
  }
`;