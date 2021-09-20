import { gql } from '@apollo/client';

export const ADD_PROJECT = gql`
    mutation createProject(
        $client_id: Int!,
        $name: String!,
        $github_url: String!,
        $toggl_url: String,
        $date: String!,
        $end_date: String,
        $expected_budget: Int!,
        $expected_budget_timeframe: String!
    ){
        createProject(createFields: {
            client_id: $client_id
            name: $name,
            github_url: $github_url,
            toggl_url: $toggl_url,
            date: $date,
            end_date: $end_date,
            is_active: true,
            expected_budget :$expected_budget,
            expected_budget_timeframe: $expected_budget_timeframe
        }){
            id,
            name
        }
    }
`

export const SYNC_GITHUB_ISSUES = gql`
    mutation syncGithubIssues($project_id: Int!) {
        syncProjectIssues(project_id: $project_id) {
            id
        }
    }
`

export const SYNC_PROJECT_GITHUB_CONTRIBUTORS = gql`
    mutation syncProjectGithubContributors($project_id: Int!, $github_personal_key: String){
        syncProjectGithubContributors(project_id: $project_id, github_personal_key: $github_personal_key) {
            id
            name
            github_id
            github_handle
        }
    }
 `

export const UPDATE_PROJECT = gql`
    mutation updateProjectById(
        $project_id: Int!,
        $date: String!,
        $end_date: String,
        $expected_budget:Int!,
        $name: String!,
        $github_url: String,
        $expected_budget_timeframe: String,
        $toggl_url: String
    ){
        updateProjectById(
            id: $project_id,
            updateFields: {
                name: $name
                github_url: $github_url
                expected_budget_timeframe: $expected_budget_timeframe
                toggl_url: $toggl_url
                date: $date
                end_date: $end_date
                expected_budget: $expected_budget
            }
        ){
            id,
            name,
            date,
            end_date,
            expected_budget,
            expected_budget_timeframe,
            is_active,
            github_url,
            toggl_url
        }
    }
`

export const SYNC_TOGGL_PROJECT = gql`
    mutation syncTogglProject(
        $project_id: Int!,
        $toggl_url: String
    ){
        syncTogglProject(project_id: $project_id, toggl_url: $toggl_url){
            id
        }
    }
`