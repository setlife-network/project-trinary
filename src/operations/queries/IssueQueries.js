import { gql } from '@apollo/client';

import { ISSUES_LIMIT } from '../../constants'

export const GET_ISSUES_BY_PROJECT = gql`
    query IssuesFromProject (
        $projectId: Int!,
        $offset: Int,
        $last30DaysOnly: Int
    ) {
        getIssuesByProjectId(
            project_id: $projectId,
            offset: $offset,
            limit: ${ISSUES_LIMIT}
            last_30_days_only: $last30DaysOnly
        ) {
            id
            github_url
            github_number
            name
            date_opened
            date_closed
        }
    }
`
