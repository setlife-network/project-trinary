const { gql } = require('apollo-server')

module.exports = gql`

    type Project {
        id: Int!
        expectedBudget: Int!
        isActive: Boolean!
        name: String!
        githubUrl: String!
        date: String!
        clientId:Int!
        client: Client
        issues: [Issue]
    }

    type Query {
        getProjectById(id: Int!): Project
        getProjects: [Project]
    }

    type Mutation {
        createProject(
            expected_budget: Int!
            is_active: Boolean!
            name: String!
            github_url: String!
            date: String!
            client_id: Int!
        ): Project
    }

`
