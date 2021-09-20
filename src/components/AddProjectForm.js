import React, { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { useHistory } from 'react-router-dom'
import Alert from '@material-ui/lab/Alert'
import {
    Avatar,
    Box,
    Button,
    Grid,
    Snackbar,
    Typography
} from '@material-ui/core'
import {
    split
} from 'lodash'

import AddGithubProjectManually from './AddGithubProjectManually'
import AddProjectDetails from './AddProjectDetails'
import AddProjectFromGithub from './AddProjectFromGithub'
import LoadingProgress from './LoadingProgress'

import { sessionUser } from '../reactivities/variables'
import {
    verifyGithubURL,
    verifyTogglURL
} from '../scripts/selectors'
import { EXPECTED_BUDGET_TIMEFRAME_OPTIONS } from '../constants'
import { GET_CLIENT_INFO } from '../operations/queries/ClientQueries'
import { ADD_PROJECT, SYNC_TOGGL_PROJECT } from '../operations/mutations/ProjectMutations'
import { CREATE_PERMISSION } from '../operations/mutations/PermissionMutations'

const AddProjectForm = (props) => {

    const {
        clientId
    } = props

    const history = useHistory()

    const {
        error: errorClient,
        data: dataClient,
        loading: loadingClient
    } = useQuery(GET_CLIENT_INFO, {
        variables: {
            id: Number(clientId)
        }
    })

    const [
        addProject,
        {
            data,
            loading,
            error
        }] = useMutation(ADD_PROJECT, {
        errorPolicy: 'all'
    })

    const [
        createPermission,
        {
            data: dataNewPermission,
            loading: loadingNewPermission,
            error: errorNewPermission
        }] = useMutation(CREATE_PERMISSION, {
        errorPolicy: 'all'
    })

    const [
        syncTogglProject,
        {
            data: dataTogglSync,
            loading: loadingTogglSync,
            error: errorTogglSync,
        }] = useMutation(SYNC_TOGGL_PROJECT)

    const [budgetTimeframe, setBudgetTimeframe] = useState(null)
    const [createProjectError, setCreateProjectError] = useState(null)
    const [disableAdd, setDisableAdd] = useState(true)
    const [displayError, setDisplayError] = useState(false)
    const [projectBudget, setProjectBudget] = useState(0)
    const [projectDate, setProjectDate] = useState(null)
    const [projectEndDate, setProjectEndDate] = useState(null)
    const [projectGithubURL, setProjectGithubURL] = useState(null)
    const [projectGithubManual, setProjectGithubManual] = useState(null)
    const [projectName, setProjectName] = useState('')
    const [projectToggl, setProjectToggl] = useState(null)

    useEffect(() => {
        if (!projectName || !projectGithubURL || !projectDate || !projectBudget || budgetTimeframe == null) {
            setDisableAdd(true)
        } else {
            setDisableAdd(false)
        }
    })

    useEffect(() => {
        //if there's not a linked github repo from the selector use the one inserted manually if exists
        if (projectGithubManual && !projectGithubURL) {
            setProjectGithubURL(projectGithubManual)
        }
    }, [projectGithubURL, projectGithubManual])

    useEffect(() => {
        const githubLinkInformation = split(projectGithubURL, '/')
        setProjectName(githubLinkInformation[githubLinkInformation.length - 1])
    }, [projectGithubURL])

    const createProject = async () => {
        if (!verifyGithubURL(projectGithubURL)) {
            setCreateProjectError('The Github URL is invalid')
            setDisplayError(true)
            return
        }
        if (projectToggl) {
            if (!verifyTogglURL(projectToggl)) {
                setCreateProjectError('The Toggl URL is invalid')
                setDisplayError(true)
                return
            }
        }
        const newProjectVariables = {
            client_id: Number(clientId),
            name: projectName,
            github_url: projectGithubURL,
            date: projectDate,
            end_date: projectEndDate,
            expected_budget: Number(projectBudget),
            expected_budget_timeframe: EXPECTED_BUDGET_TIMEFRAME_OPTIONS[budgetTimeframe].value
        }
        if (projectToggl) {
            newProjectVariables.toggl_url = projectToggl
        }
        const newProject = await addProject({ variables: newProjectVariables })
        if (loading) return <LoadingProgress/>
        if (newProject.errors) {
            setCreateProjectError(`${Object.keys(newProject.errors[0].extensions.exception.fields)[0]} already exists`)
            setDisplayError(true)
        } else {
            const newPermission = await createPermission({
                variables: {
                    contributor_id: sessionUser().id,
                    project_id: newProject.data.createProject.id,
                    type: 'owner'
                } })
            if (projectToggl) {
                await syncTogglProject({
                    variables: {
                        project_id: newProject.data.createProject.id,
                        toggl_url: newProjectVariables.toggl_url
                    }
                })
                if (loadingTogglSync) return <LoadingProgress/>
            }
            history.push(`/projects/${newProject.data.createProject.id}`)
        }
    }

    const handleAlertClose = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }
        setDisplayError(false)
    }
    if (errorClient) return `An error ocurred: ${errorClient}`
    if (loadingClient) return <LoadingProgress/>

    const { getClientById: client } = dataClient

    return (
        <Grid
            container
            alignItems='center'
            className='AddProjectForm'
        >
            <Grid item>
                <Box mr={2} mb={2}>
                    <Avatar>
                        {`1`}
                    </Avatar>
                </Box>
            </Grid>
            <Grid item>
                <Typography variant='h6'>
                    {`Link the Github Project`}
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Box item mb={3}>
                    <AddProjectFromGithub
                        setProjectGithubURL={setProjectGithubURL}
                    />
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box item mb={3}>
                    <AddGithubProjectManually
                        setProjectGithubManual={setProjectGithubManual}
                    />
                </Box>
            </Grid>
            <Grid item>
                <Box mr={3} mb={2}>
                    <Avatar>
                        {`2`}
                    </Avatar>
                </Box>
            </Grid>
            <Grid item>
                <Typography variant='h6'>
                    {`Add additional information`}
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Box item mt={5}>
                    <AddProjectDetails
                        budgetTimeframe={budgetTimeframe}
                        client={client}
                        projectBudget={projectBudget}
                        projectDate={projectDate}
                        projectEndDate={projectEndDate}
                        projectName={projectName}
                        setBudgetTimeframe={setBudgetTimeframe}
                        setProjectDate={setProjectDate}
                        setProjectEndDate={setProjectEndDate}
                        setProjectName={setProjectName}
                        setProjectToggl={setProjectToggl}
                        setProjectBudget={setProjectBudget}
                    />
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box mt={5} pt={5}>
                    <Button
                        variant='contained'
                        color='primary'
                        disabled={disableAdd}
                        onClick={createProject}
                    >
                        <Box px={5}>
                            {`Add Project`}
                        </Box>
                    </Button>
                </Box>
            </Grid>
            <Snackbar
                open={displayError}
                autoHideDuration={4000}
                onClose={handleAlertClose}
            >
                <Alert severity='error'>
                    {`${createProjectError}`}
                </Alert>
            </Snackbar>
        </Grid>
    )
}

export default AddProjectForm
