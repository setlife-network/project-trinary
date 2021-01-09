import { gql } from '@apollo/client'

export const CHECK_SESSION = gql`
    query CheckSession{
        checkSession {
            id,
            name
        }
    }
`

export const GET_CONTRIBUTORS = gql`
    query Contributors {
        getContributors{
            id
            name
            github_id
            github_handle
            toggl_id
            external_data_url
        }
    }
`
