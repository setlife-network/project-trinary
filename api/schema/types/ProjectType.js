const { gql } = require('apollo-server')

module.exports = gql`

    type Project {
        id: Int!
        expected_budget: Int
        is_active: Boolean!
        is_public: Boolean
        name: String!
        github_url: String!
        toggl_url: String
        date: String
        date_last_synced: String
        client_id: Int!
        end_date: String
        toggl_id: String
        expected_budget_timeframe: String
        expected_budget_currency: String
        allocations(contributorId: Int): [Allocation]
        allocatedPayments: [Payment]
        payments: [Payment]
        averageHourlyPaid(fromDate: String, toDate: String): Int
        averageIssueCost(fromDate: String, toDate: String): AverageIssueCost
        client: Client
        admin: Contributor
        contributors: [Contributor]
        githubContributors: [Contributor]
        issuesOpened(fromDate: String, toDate: String): Int
        issues(
            limit: Int,
            offset: Int
        ): [Issue]
        permissions: [Permission]
        githubIssuesOpened(
            fromDate: String,
            toDate:String,
            githubPersonalKey: String
        ): Int
        githubIssuesClosed(
            fromDate: String,
            toDate:String,
            githubPersonalKey: String
        ): Int
        githubPullRequestsClosed(
            fromDate: String,
            toDate: String,
            contributorId: Int
        ): Int
        githubPullRequestsOpened(
            fromDate: String,
            toDate: String,
            contributorId: Int
        ): Int
        githubPullRequestsMerged(
            fromDate: String,
            toDate: String,
            contributorId: Int
        ): Int
        timeEntries(
            fromDate: String
            toDate: String
            contributor_id: Int
        ): [TimeEntry]
        timeSpent(
            fromDate: String
            toDate: String
            contributor_id: Int
        ): TimeSpent
        timeSpentPerContributor(
            fromDate: String,
            toDate: String
        ): [TimeSpent]
        #calculated properties
        totalAllocated(
            fromDate: String,
            toDate: String,
            confirmedOnly: Boolean
        ): Int
        "The total paid from the client"
        totalPaid(
            fromDate: String,
            toDate: String,
            allocationsOnly: Boolean
        ): Int
        totalIncurredPayments: Int # The total incurred not paid from the client
    }

    type AverageIssueCost {
        fromPayments: Int
        fromAllocations: Int
    }

    type TimeSpent {
        contributor: Contributor
        contributor_id: Int
        seconds: Int
    }

    input CreateProjectInput {
        expected_budget: Int
        is_active: Boolean
        is_public: Boolean
        name: String!
        github_url: String!
        toggl_url: String
        client_id: Int
        date: String
        end_date: String
        expected_budget_timeframe: String
    }

    input UpdateProjectInput {
        expected_budget: Int
        is_active: Boolean
        name: String
        github_url: String
        toggl_url: String
        client_id: Int
        toggl_id: String
        date: String
        end_date: String
        date_last_synced:String
        expected_budget_timeframe: String
        expected_budget_currency: String
    }

    type Query {
        getProjectById(id: Int!): Project
        getProjects: [Project]
        getActiveProjects: [Project]
        getActiveProjectsCount(clientId: Int): Int!
        getInactiveProjects: [Project]
        getInactiveProjectsCount(clientId: Int): Int!
    }

    type Mutation {
        createProject(
            createFields: CreateProjectInput!
        ): Project
        deleteProjectById(id: Int!): String
        syncProjectPermissions(project_id: Int!):[Permission]
        syncProjectGithubContributors(
            project_id: Int!,
            github_personal_key: String
        ): [Contributor]
        syncProjectIssues(
            project_id: Int!,
            contributor_id: Int
        ): [Issue]
        syncTogglProject(
            project_id: Int!
            toggl_url: String
        ): Project
        updateProjectById(
            id: Int!
            updateFields: UpdateProjectInput!
        ): Project
    }

`
