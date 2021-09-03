import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import Alert from '@material-ui/lab/Alert'
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Snackbar,
    TextField
} from '@material-ui/core/'
import { findIndex, split } from 'lodash'
import CurrencyTextField from '@unicef/material-ui-currency-textfield'
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers'
import accounting from 'accounting-js'
import moment from 'moment'
import MomentUtils from '@date-io/moment'

import LoadingProgress from './LoadingProgress'
import {
    selectCurrencyInformation,
    verifyGithubURL,
    verifyTogglURL
} from '../scripts/selectors'
import { UPDATE_PROJECT } from '../operations/mutations/ProjectMutations'
import { EXPECTED_BUDGET_TIMEFRAME_OPTIONS, MAX_INT } from '../constants'

const ProjectEditDialog = (props) => {

    const {
        project,
        onClose,
        open
    } = props

    const currentDate = moment.utc(project.date, 'x').format('YYYY-MM-DD')
    const endDate = project.end_date ? moment(project.end_date, 'x').format('YYYY-MM-DD') : null
    const currencyInformation = selectCurrencyInformation({
        currency: project.client.currency
    })

    const [updateProject, { data, loading, error }] = useMutation(UPDATE_PROJECT, { errorPolicy: 'all' })

    const [budgetTimeframe, setBudgetTimeframe] = useState(null)
    const [disableEdit, setDisableEdit] = useState(true)
    const [displayError, setDisplayError] = useState(false)
    const [editProjectError, setEditProjectError] = useState('')
    const [expectedBudget, setExpectedBudget] = useState(project.expected_budget)
    const [githubURL, setGithubURL] = useState(project.github_url)
    const [projectDate, setProjectDate] = useState(null)
    const [projectEndDate, setProjectEndDate] = useState(null)
    const [projectName, setProjectName] = useState(project.name)
    const [togglURL, setTogglURL] = useState(project.toggl_url)

    const handleAlertClose = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }
        setDisplayError(false)
    }
    const handleBudgetChange = (input) => {
        const amount = Number(input.replace(/\D/g, ''))
        setExpectedBudget(amount)
    }
    const handleDateChange = (date) => {
        setProjectDate(moment(date['_d']).format('YYYY-MM-DD'))
    }
    const handleEndDateChange = (date) => {
        setProjectEndDate(moment(date['_d']).format('YYYY-MM-DD'))
    }
    const handleTimeframeChange = (timeframe) => {
        setBudgetTimeframe(timeframe)
    }
    const onEditProject = async () => {
        if (!verifyGithubURL(githubURL)) {
            setEditProjectError('The Github URL is invalid')
            setDisplayError(true)
            return
        }
        if (togglURL) {
            if (!verifyTogglURL(togglURL)) {
                setEditProjectError('The Toggl URL is invalid')
                setDisplayError(true)
                return
            }
        }
        const projectInfoToEdit = {
            project_id: project.id,
            date: projectDate,
            end_date: projectEndDate,
            expected_budget: Number(expectedBudget),
            expected_budget_timeframe: (
                budgetTimeframe != null
                    ? EXPECTED_BUDGET_TIMEFRAME_OPTIONS[budgetTimeframe].value
                    : null
            ),
            github_url: githubURL,
            name: projectName,
            toggl_url: togglURL
        }
        const projectEdited = await updateProject({ variables: projectInfoToEdit })
        if (loading) return <LoadingProgress/>
        else if (projectEdited.errors) {
            setEditProjectError(`${Object.keys(projectEdited.errors[0].extensions.exception.fields)[0]}  already exists`)
            setDisplayError(true)
        } else {
            onClose()
        }
    }

    useEffect(() => {
        if (
            expectedBudget == project.expected_budget &&
            githubURL == project.github_url &&
            projectName == project.name &&
            togglURL == project.toggl_url &&
            ((budgetTimeframe != null
                ? EXPECTED_BUDGET_TIMEFRAME_OPTIONS[budgetTimeframe].label
                : null
            ) == project.expected_budget_timeframe) &&
            projectDate == currentDate &&
            endDate == projectEndDate
        ) {
            setDisableEdit(true)
        } else if (!expectedBudget || !githubURL || !projectName) {
            setDisableEdit(true)
        } else {
            setDisableEdit(false)
        }
    })

    useEffect(() => {
        setProjectDate(currentDate)
        if (endDate) {
            setProjectEndDate(endDate)
        }
        if (project.expected_budget_timeframe) {
            setBudgetTimeframe(
                findIndex(EXPECTED_BUDGET_TIMEFRAME_OPTIONS, ['label', project.expected_budget_timeframe])
            )
        }
    }, [open])

    const renderTimeframeOptions = ({ timeframes }) => {
        return timeframes.map((timeframe, i) => {
            return (
                <MenuItem value={i}>
                    {`${timeframe.label}`}
                </MenuItem>
            )
        })
    }

    return (
        <Dialog
            className='ProjectEditDialog'
            onClose={onClose}
            open={open}
        >
            <Box mx={5} my={3}>
                <DialogTitle>
                    {`Edit Project`}
                </DialogTitle>
                <FormControl>
                    <Grid
                        container
                        justify='space-between'
                        alignItems='center'
                    >
                        <Grid item xs={12} lg={12}>
                            <Box my={2} px={1}>
                                <TextField
                                    label='Project name'
                                    variant='outlined'
                                    defaultValue={project.name}
                                    fullWidth
                                    required
                                    onChange={(event) => setProjectName(event.target.value)}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                            <Box my={2} px={1}>
                                <CurrencyTextField
                                    fullWidth
                                    label='Expected Budget'
                                    variant='outlined'
                                    currencySymbol={`${currencyInformation['symbol']}`}
                                    minimumValue='0'
                                    maximumValue={`${MAX_INT / 100}`}
                                    outputFormat='string'
                                    decimalCharacter={`${currencyInformation['decimal']}`}
                                    digitGroupSeparator={`${currencyInformation['thousand']}`}
                                    defaultValue={project.expected_budget / 100}
                                    onChange={(event) => handleBudgetChange(event.target.value)}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box my={2} px={1}>
                                <FormControl fullWidth>
                                    <InputLabel>
                                        {`Expected budget timeframe`}
                                    </InputLabel>
                                    <Select
                                        fullWidth
                                        label={`Expected budget timeframe`}
                                        value={budgetTimeframe}
                                        onChange={(event) => (handleTimeframeChange(event.target.value))}
                                    >
                                        {renderTimeframeOptions({ timeframes: EXPECTED_BUDGET_TIMEFRAME_OPTIONS })}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                            <Box my={2} px={1}>
                                <TextField
                                    label='Github URL'
                                    variant='outlined'
                                    type='url'
                                    defaultValue={project.github_url}
                                    fullWidth
                                    onChange={(event) => setGithubURL(event.target.value)}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                            <Box my={2} px={1}>
                                <TextField
                                    label='Toggl URL'
                                    variant='outlined'
                                    type='url'
                                    defaultValue={project.toggl_url}
                                    fullWidth
                                    onChange={(event) => setTogglURL(event.target.value)}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box px={1}>
                                <MuiPickersUtilsProvider utils={MomentUtils}>
                                    <KeyboardDatePicker
                                        fullWidth
                                        disableToolbar
                                        variant='inline'
                                        format='MM/DD/YYYY'
                                        margin='normal'
                                        id='date-picker-inline'
                                        label='Project start date'
                                        value={projectDate}
                                        onChange={handleDateChange}
                                        KeyboardButtonProps={{
                                            'aria-label': 'change date',
                                        }}
                                    />
                                </MuiPickersUtilsProvider>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box px={1}>
                                <MuiPickersUtilsProvider utils={MomentUtils}>
                                    <KeyboardDatePicker
                                        fullWidth
                                        disableToolbar
                                        variant='inline'
                                        format='MM/DD/YYYY'
                                        margin='normal'
                                        id='date-picker-inline'
                                        label='Project end date'
                                        value={projectEndDate}
                                        onChange={handleEndDateChange}
                                    />
                                </MuiPickersUtilsProvider>
                            </Box>
                        </Grid>
                        <Grid item xs={12} lg={7}>
                            <Box mt={5} pl={1}>
                                <Button
                                    variant='contained'
                                    color='primary'
                                    disabled={disableEdit}
                                    onClick={onEditProject}
                                >
                                    {`Save Project`}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                    <Snackbar
                        open={displayError}
                        autoHideDuration={3600}
                        onClose={handleAlertClose}
                    >
                        <Alert severity='error'>
                            {`${editProjectError}`}
                        </Alert>
                    </Snackbar>
                </FormControl>
            </Box>
        </Dialog>
    )
}

export default ProjectEditDialog
