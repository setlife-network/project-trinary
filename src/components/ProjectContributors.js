import React, { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import {
    Box,
    Grid
} from '@material-ui/core/'
import { differenceBy, filter } from 'lodash'

import { GET_PROJECT_CONTRIBUTORS } from '../operations/queries/ProjectQueries'
import { GET_CONTRIBUTORS } from '../operations/queries/ContributorQueries'
import { SYNC_PROJECT_GITHUB_CONTRIBUTORS } from '../operations/mutations/ProjectMutations'
import ContributorTile from './ContributorTile'
import ContributorsEmptyState from './ContributorsEmptyState'
import GithubAccessBlocked from './GithubAccessBlocked'

const ProjectContributors = (props) => {

    const { projectId } = props

    const {
        data: dataProjectContributors,
        loading: loadingProjectContributors,
        error: errorProjectContributors
    } = useQuery(GET_PROJECT_CONTRIBUTORS, {
        variables: {
            id: Number(projectId)
        }
    })

    const {
        data: dataContributors,
        loading: loadingContributors,
        error: errorContributors
    } = useQuery(GET_CONTRIBUTORS)
    
    const [
        getGithubContributors,
        {
            data: dataGithubContributors,
            loading: loadingGithubContributors,
            error: errorGithubContributors
        }
    ] = useMutation(SYNC_PROJECT_GITHUB_CONTRIBUTORS, {
        errorPolicy: 'all'
    })

    useEffect(() => {
        var githubContributors = getGithubContributors({
            variables: { project_id: Number(projectId) }
        })
    }, [])

    if (loadingProjectContributors || loadingContributors || loadingGithubContributors) {
        return (
            <Grid item xs={12}>
                Loading...
            </Grid>
        )
    }
    if (errorGithubContributors) {
        return (
            <GithubAccessBlocked
                message={`You must be a Github collaborator to access this metrics`}
            />
        )
    }
    if (errorProjectContributors || errorContributors) return `Error!`

    const project = dataProjectContributors.getProjectById
    const { allocations } = project
    const activeAllocations = filter(allocations, 'active')
    const activeContributors = activeAllocations.map(a => {
        return a.contributor
    })
    const { getContributors: contributors } = dataContributors
    const contributorsToAdd = differenceBy(contributors, activeContributors, 'id')

    const renderContributors = (active, contributors) => {

        return contributors.map(c => {
            return (
                <Grid item xs={12} sm={6}>
                    <ContributorTile
                        active={active}
                        contributor={c}
                    />
                </Grid>
            )
        })
    }

    return (
        <Grid container className='ProjectContributors'>
            <h1>{`${project.name} Contributors`}</h1>
            <Grid xs={12}/>
            <Grid item xs={12} sm={5}>
                <Box
                    bgcolor='primary.black'
                    color='primary.light'
                    borderRadius='borderRadius'
                    px={5}
                    py={1}
                >
                    {
                        `${activeContributors.length} active ${activeContributors.length == 1
                            ? 'contributor'
                            : 'contributors'
                        }`
                    }
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box my={5}>
                    <Grid container>
                        {
                            activeContributors.length != 0
                                ? renderContributors(true, activeContributors)
                                : <ContributorsEmptyState active/>

                        }
                    </Grid>
                </Box>
                <hr/>
            </Grid>
            <h1>{`Add new contributors to the project`}</h1>
            <Grid item xs={12}>
                <Box>
                    <Grid container>
                        {
                            contributorsToAdd.length != 0
                                ? renderContributors(false, contributorsToAdd)
                                : <ContributorsEmptyState/>
                        }
                    </Grid>
                </Box>
                <Box my={5} py={5}/>
            </Grid>
        </Grid>
    );
}

export default ProjectContributors
