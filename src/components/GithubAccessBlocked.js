import React, { useEffect, useState } from 'react'
import {
    Box,
    Grid,
    Typography,
    Link
} from '@material-ui/core'
import { useLazyQuery, useQuery } from '@apollo/client';
import { GET_PROJECT } from '../operations/queries/ProjectQueries';

const GithubAccessBlocked = (props) => {

    const githubURL = props.githubURL
    
    const [projectGithubUrl, setProjectGithubUrl] = useState(null)

    const [getProject, {
        data: dataProject,
        loading: loadingProject,
        error: errorProject,
    }] = useLazyQuery(GET_PROJECT, {
        onCompleted: dataProject => {
            setProjectGithubUrl(dataProject.getProjectById.github_url)
        }
    })

    useEffect(() => {
        getProject({
            variables: { id: Number(props.projectId) }
        })
    }, [dataProject])

    return (
        <Grid container className='GithubAccessBlocked'>
            <Grid item xs={12}>
                <Box my={[2, 5]} >
                    <Typography align='center' variant='h6'>
                        {props.message}
                    </Typography>
                    <Typography align='center' variant='h6'>
                        <Link href={projectGithubUrl}>
                            Open in Github
                        </Link>
                    </Typography>
                    <Typography align='center' variant='h6'>
                        Please go to
                        <Link href='https://github.com/settings/connections/applications/477caaee77097be3982d'>
                            &nbsp;this link&nbsp;
                        </Link>
                        so you can request or give access.
                    </Typography>
                </Box>
            </Grid>
        </Grid>
    )
}

export default GithubAccessBlocked
