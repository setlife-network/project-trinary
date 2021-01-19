import React, { useState } from 'react'
import { useLazyQuery, useQuery } from '@apollo/client'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
    Box,
    Button,
    Grid,
    Typography
} from '@material-ui/core'
import moment from 'moment'

import ContributorTimeTrackedTile from './ContributorTimeTrackedTile'
import { GET_PROJECT_TIME_ENTRIES } from '../operations/queries/ProjectQueries'

const ProjectTimeTracking = (props) => {

    const { projectId } = props

    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)

    const [
        getProjectTimeEntries,
        {
            data: dataRangedTime,
            loading: loadingRangedTime,
            error: errorRangedTime
        }
    ] = useLazyQuery(GET_PROJECT_TIME_ENTRIES)

    const clearDateInput = () => {
        setStartDate(null)
        setEndDate(null)
        getProjectTimeEntries({ variables: {
            id: projectId,
            fromDate: null,
            toDate: null
        } })
    }

    const getRangedTimeEntries = (dates) => {
        const [start, end] = dates
        setStartDate(start)
        setEndDate(end)
        if (end) {
            getProjectTimeEntries({ variables: {
                id: projectId,
                fromDate: moment(startDate).format('YYYY-MM-DD'),
                toDate: moment(end).format('YYYY-MM-DD')
            } })
        }
    }

    const {
        data: dataAllTimeEntries,
        loading: loadingAllTimeEntries,
        error: errorAllTimeEntries
    } = useQuery(GET_PROJECT_TIME_ENTRIES, {
        variables: {
            id: projectId,
            fromDate: null,
            toDate: null
        }
    })
    if (loadingAllTimeEntries || loadingRangedTime) return 'Loading...'
    if (errorAllTimeEntries || errorRangedTime) return 'error!'

    const {
        timeEntries,
        timeSpent,
        timeSpentPerContributor
    } = dataRangedTime
        ? dataRangedTime.getProjectById
        : props

    const projectHoursSpent = timeSpent.seconds
        ? Math.trunc(timeSpent.seconds / 3600)
        : 0

    const contributorTimeEntries = timeSpentPerContributor

    const renderContributorTimeEntries = (timeEntries) => {
        return timeEntries.map(t => {
            return (
                <ContributorTimeTrackedTile timeEntry={t}/>
            )
        })
    }

    return (
        <Grid container className='ProjectTimeTracking' alignItems='flex-end'>
            <Grid item xs={12}>
                <Typography variant='h4' align='left'>
                    <strong>
                        {'Time Tracking'}
                    </strong>
                </Typography>
            </Grid>
            <Grid item xs={12} md={4} align='left'>
                <Box mt={2}>
                    <DatePicker
                        selected={startDate}
                        startDate={startDate}
                        endDate={endDate}
                        shouldCloseOnSelect={startDate && !endDate}
                        selectsRange
                        onChange={(date) => getRangedTimeEntries(date)}
                        customInput={
                            <Box
                                px={2}
                                py={1}
                                boxShadow={3}
                                borderRadius='borderRadius'
                                bgcolor='primary.light'
                            >
                                {`${
                                    startDate
                                        ? moment(startDate).format('MM/DD/YYYY')
                                        : 'Start date'
                                } - ${
                                    endDate
                                        ? moment(endDate).format('MM/DD/YYYY')
                                        : ' End date'
                                }`}
                            </Box>
                        }
                    />
                </Box>
            </Grid>
            <Grid item xs={12} sm={6} align='left'>
                <Box mt={1} px={2}>
                    <Button
                        color='primary'
                        disabled={!startDate && !endDate}
                        onClick={() => clearDateInput()}
                    >
                        {`Clear dates`}
                    </Button>
                </Box>
            </Grid>
            <Grid item xs={12}/>
            <Grid item xs={12} md={4}>
                <Box
                    bgcolor='primary.black'
                    color='primary.light'
                    borderRadius='borderRadius'
                    mt={2}
                    px={5}
                    py={1}
                >
                    {`${projectHoursSpent} h. Total`}
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box my={5} pb={3}>
                    {renderContributorTimeEntries(contributorTimeEntries)}
                </Box>
            </Grid>
        </Grid>
    )
}

export default ProjectTimeTracking