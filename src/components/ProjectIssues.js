import React, { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import {
    Box,
    Button,
    Grid
} from '@material-ui/core'
import moment from 'moment'
import { orderBy } from 'lodash'

import GithubAccessBlocked from './GithubAccessBlocked'
import IssueTile from './IssueTile'
import LoadingProgress from './LoadingProgress'
import ProjectIssuesMetrics from './ProjectIssuesMetrics'

import { GET_PROJECT_METRICS } from '../operations/queries/ProjectQueries'
import { GET_ISSUES_BY_PROJECT } from '../operations/queries/IssueQueries'
import { SYNC_GITHUB_ISSUES } from '../operations/mutations/ProjectMutations'
import { pageName } from '../reactivities/variables'
import { ISSUES_LIMIT } from '../constants'

const ProjectIssues = (props) => {

    const { projectId } = props
    const today30DaysAgo = moment().subtract(30, 'days').format('x')

    const [moreIssuesToLoad, setMoreIssuesToLoad] = useState(true)
    const [last30DayIssuesCount, setLast30DayIssuesCount] = useState(0)

    const {
        data: dataProjectIssues,
        loading: loadingProjectIssues,
        error: errorProjectIssues,
    } = useQuery(GET_PROJECT_METRICS, {
        variables: {
            id: Number(projectId)
        }
    })

    const {
        data: dataIssues,
        loading: loadingIssues,
        error: errorIssues,
        fetchMore: fetchMoreIssues
    } = useQuery(GET_ISSUES_BY_PROJECT, {
        variables: {
            projectId: Number(projectId),
            offset: 0,
            last30DaysOnly: 1
        }
    })

    const [
        getIssues,
        {
            data: dataGitHubIssues,
            loading: loadingGitHubIssues,
            error: errorGitHubIssues
        }
    ] = useMutation(SYNC_GITHUB_ISSUES, {
        variables: {
            project_id: Number(projectId)
        },
        refetchQueries: [
            {
                query: GET_ISSUES_BY_PROJECT,
                variables: {
                    projectId: Number(projectId),
                    offset: 0,
                    last30DaysOnly: 1
                }
            }
        ]
    })

    const loadMoreIssues = async ({ issues }) => {
        const moreIssues = await fetchMoreIssues({
            variables: {
                offset: issues.length
            }
        })
        if (moreIssues.data.getIssuesByProjectId.length < ISSUES_LIMIT) {
            setMoreIssuesToLoad(false)
        }
    }

    const renderIssues = (issues) => {
        return issues.map(i => {
            return (
                <Grid item xs={12}>
                    <IssueTile issue={i}/>
                </Grid>
            )
        })
    }

    if (loadingProjectIssues || loadingIssues) return <LoadingProgress/>
    if (errorProjectIssues || errorIssues) {
        return (
            <GithubAccessBlocked
                message={`You must have access to this repository on GitHub to access these metrics.`}
                projectId={projectId}
            />
        )
    }

    const { getProjectById: project } = dataProjectIssues
    const { getIssuesByProjectId: issues } = dataIssues

    pageName(project.name)

    const sortedIssues = orderBy(issues, ['date_closed'], ['desc'])

    return (
        <Grid container className='ProjectIssues'>
            <h1>{`Issues`}</h1>
            <Grid item xs={12}>
                <ProjectIssuesMetrics
                    githubURL={project.github_url}
                    openedIssues={project.githubIssuesOpened}
                    closedIssues={project.githubIssuesClosed}
                    openPullRequests={project.githubPullRequestsOpened}
                    closedPullRequests={project.githubPullRequestsClosed}
                    mergedPullRequests={project.githubPullRequestsMerged}
                />
            </Grid>
            <Grid item xs={6} sm={4} align='left'>
                <Box mt={3}>
                    <Button
                        variant='outlined'
                        color='primary'
                        onClick={() => getIssues()}
                    >
                        {`Sync last 30 days issues`}
                    </Button>
                </Box>
            </Grid>
            <Grid item xs={12}>
                {loadingGitHubIssues &&
                    <LoadingProgress/>
                }
                <Grid container>
                    {renderIssues(sortedIssues)}
                </Grid>
                {moreIssuesToLoad &&
                    <Button
                        variant='outlined'
                        color='primary'
                        onClick={() => loadMoreIssues({ issues })}
                    >
                        {`Load More`}
                    </Button>
                }
                <Box my={[2, 5]}/>
            </Grid>
        </Grid>
    )
}

export default ProjectIssues
