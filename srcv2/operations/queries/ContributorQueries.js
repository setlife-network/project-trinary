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
            totalPaid
            wallet {
                onchain_address
                invoice_macaroon
                lnd_host
                lnd_port
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
    query GithubOrganizationRepos($githubPageNumber: Int!, $accountId: Int!) {
        getGithubRepos(
            githubPageNumber: $githubPageNumber, 
            accountId: $accountId 
        ) 
        {
            id
            name
            githubUrl
            private
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
                active
                date_paid
                status
                proposedBy {
                    id
                    name
                }
                project {
                    id
                    name
                    client {
                        id
                        name
                    }
                }
            }
        }
    }
`

export const GET_CONTRIBUTOR_PROJECTS = gql`
    query ContributorProjects($id: Int!) {
        getContributorById(id: $id) {
            id
            wallet {
                onchain_address
                invoice_macaroon
                lnd_host
                lnd_port
            }
            projects {
                id
                name
                is_active
                expected_budget_currency
                admin {
                    id
                    name
                }
            }
        }
    }
`

export const GET_CONTRIBUTOR_WALLETS = gql`
    query ContributorWallets($id: Int!) {
        getContributorById(id: $id) {
            wallet {
                onchain_address
                invoice_macaroon
                lnd_host
                lnd_port
            }
        }
    }
`

export const GET_CONTRIBUTORS = gql`
    query Contributos {
        getContributors {
            id
            name
            github_handle
          }
    }
`