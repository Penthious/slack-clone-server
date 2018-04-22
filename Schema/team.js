export default `
  type Team {
    id: Int!
    name: String!
    members: [User!]!
    channels: [Channel!]!
    admin: Boolean!
  }

  type CreateTeamResponse {
    ok: Boolean!
    errors: [Error!]
    team: Team
  }

  type Query {
    allTeams: [Team!]!
    inviteTeams: [Team!]!
    getTeamMembers(teamId: Int!): [User!]!
  }

  type VoidResponse {
    ok: Boolean!
    errors: [Error!]
  }

  type Mutation {
    createTeam(name: String!): CreateTeamResponse!
    addTeamMember(email: String!, teamId: Int!): VoidResponse!
    }
`;
