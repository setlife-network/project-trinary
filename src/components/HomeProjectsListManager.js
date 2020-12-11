import React from 'react'
import { gql, useQuery } from '@apollo/client';
import { Grid } from '@material-ui/core'
import { orderBy } from 'lodash'

import { GET_POJECTS } from '../operations/queries/ProjectQueries'
import ProjectsList from './ProjectsList'

const HomeProjectsListManager = ({
    history
}) => {

    const { loading, error, data } = useQuery(GET_POJECTS);

    if (loading) {
        return (
            <Grid item xs={12}>
                Loading...
            </Grid>
        )
    }
    if (error) return `Error! ${error.message}`;
    const projects = orderBy(data.getProjects, ['is_active'], ['desc'])

    return (
        <>
            {
                projects.length != 0
                    ? (
                        <ProjectsList
                            history={history}
                            projects={projects}
                        />
                    ) : (
                        <>
                            {
                                //TODO: Empty State
                            }
                        </>
                    )
            }
        </>
    )
}

export default HomeProjectsListManager
