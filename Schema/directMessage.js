export default `
  type DirectMessage {
    id: Int!
    sender: User!
    receiverId: Int!
  }


  type Query {
    directMessages: [DirectMessage!]!
  }

  type Mutation {
    createDirectMessage(receiverId: Int!, text: String!): Boolean!
  }
`;
