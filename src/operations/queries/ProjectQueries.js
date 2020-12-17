import { gql } from '@apollo/client';

export const GET_POJECTS = gql`
    query Projects {
        getProjects {
            id
            name
            is_active
            expected_budget
            github_url
            toggl_url
            client_id
            toggl_id
            date
            client {
                id
                name
            }
        }
    }
`;

export const GET_ACTIVE_PROJECTS_COUNT = gql`
    query Clients($clientId: Int) {
        getActiveProjectsCount(clientId: $clientId)
    }
`;

export const GET_PROJECT = gql`
    query Project($id: Int!){
        getProjectById(id: $id){
            id
            name
            is_active
            expected_budget
            github_url
            toggl_url
            date
            totalPaid
            client {
                id,
                name
            },
            allocatedPayments {
                id
            },
            issues {
                id
            },
            contributors {
                id
            },
            allocations {
                id
            },
            timeSpent(
                fromDate: "2020-01-01",
                toDate: "2020-12-31"
            ) {
                seconds
            }
        }
    }
`
