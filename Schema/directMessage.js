export default `
  type DirectMessage {
    id: Int!
    sender: User!
    receiverId: Int!
    created_at: String!
    text: String!
  }

  type Subscription{
    newDirectMessage(teamId: Int!, userId: Int!): DirectMessage!
  }

  type Query {
    directMessages(teamId: Int!, otherUserId: Int!): [DirectMessage!]!
  }

  type Mutation {
    createDirectMessage(receiverId: Int!, teamId: Int!, text: String!): Boolean!
  }
`;
