import { gql } from '@apollo/client'

export const CHECK_SESSION = gql`
    query CheckSession{
        checkSession {
            id
            name
            github_id
            github_handle
            github_access_token
            toggl_id
            external_data_url
        }
    }
`

export const GET_CONTRIBUTORS = gql`
    query Contributors {
        getContributors {
            id
            name
            github_id
            github_handle
            toggl_id
            external_data_url
            github_access_token
        }
    }
`

export const GET_CONTRIBUTOR_ALLOCATIONS = gql`
    query ContributorAllocation($id: Int!) {
        getContributorById(id: $id) {
            id
            allocations {
                id
                amount
                contributor {
                    id
                }
                active
                start_date
                end_date
                date_paid
                rate {
                    id
                    active
                    type
                    hourly_rate
                    currency
                    total_expected_hours
                }
                project {
                    id
                    name
                    client {
                        id
                        name
                    }
                }
                payment {
                    amount
                }
            }
        }
    }
`

export const GET_CONTRIBUTOR_INFO = gql`
    query ContributorInfo($id: Int!){
        getContributorById(id: $id){
            id
            name
            github_id
            github_handle
            github_access_token
            totalPaid
            paidByCurrency {
                currency
                amount
            }
        }
    }
`

export const GET_CONTRIBUTOR_RATES = gql`
    query ContributorAllocation($id: Int!) {
        getContributorById(id: $id) {
            id
            github_access_token
            rates {
                id
                active
                type
                hourly_rate
                currency
                total_expected_hours
            }

        }
    }
`

export const GET_CONTRIBUTOR_PROJECTS = gql`
    query ContributorProjects($id: Int!) {
        getContributorById(id: $id) {
            id
            allocations {
                id
                start_date
                end_date
                project {
                    id
                    name
                    is_active
                    client {
                        id
                        name
                    }
                }
            }
        }
    }
`

export const GET_CONTRIBUTOR_ORGANIZATIONS_FROM_GITHUB = gql`
    query GithubOrganizations($id: Int) {
        getGithubOrganizations(contributorId: $id) {
            id
            avatar
            name
        }
    }
`

export const GET_CONTRIBUTOR_REPOS_FROM_GITHUB = gql`
    query GithubOrganizationRepos($organizationName: String!, $githubPageNumber: Int!) {
        getGithubRepos(organizationName: $organizationName, githubPageNumber: $githubPageNumber) {
            id
            name
            githubUrl
        }
    }
`
