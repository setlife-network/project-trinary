import React, { useState } from 'react'
import {
    Box,
    Grid,
    Typography,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DatePicker from 'react-datepicker'
import RangeDatePickerInput from './RangeDatePickerInput'
import moment from 'moment'

const DateInput = (props) => {

    const {
        startDate,
        endDate,
        setStartDate,
        setEndDate,
    } = props

    const [selectedWeek, setSelectedWeek] = useState()
    const [selectedMonth, setSelectedMonth] = useState()
    const [selectedYear, setSelectedYear] = useState()

    const getRangedTimeEntries = (dates) => {
        const [start, end] = dates
        setStartDate(moment(start).utc())
        setEndDate(moment(end).utc())
        setSelectedWeek(0)
        setSelectedMonth(0)
        setSelectedYear(0)
    }

    const getWeekMonthYears = (weeks, months, years) => {
        setSelectedWeek(weeks)
        setSelectedMonth(months)
        setSelectedYear(years)
        let endingDate
        if (weeks) {
            endingDate = moment(startDate).add(weeks, 'weeks')
        } else if (months) {
            endingDate = moment(startDate).add(months, 'months')
        } else if (years) {
            endingDate = moment(startDate).add(years, 'years')
        }
        setEndDate(endingDate.toDate())
    }

    const renderWeeks = () => {
        const weeks = [1, 2, 3, 4]
        return weeks.map(w => (
            <Grid item xs={2}>
                <Button
                    color='primary'
                    variant={`${selectedWeek == w
                        ? 'contained'
                        : 'outlined'
                    }`}
                    onClick={() => getWeekMonthYears(w)}
                >
                    {w}
                </Button>
            </Grid>
        ))
    }

    const renderMonths = () => {
        const months = [2, 4, 6, 8, 10]
        return months.map(m => (
            <Grid item xs={2}>
                <Button
                    color='primary'
                    variant={`${selectedMonth == m
                        ? 'contained'
                        : 'outlined'
                    }`}
                    onClick={() => getWeekMonthYears(0, m, 0)}
                >
                    {m}
                </Button>
            </Grid>
        ))
    }

    const renderYears = () => {
        const years = [1, 2, 3, 4, 5]
        return years.map(y => (
            <Grid item xs={2}>
                <Button
                    color='primary'
                    variant={`${selectedYear == y
                        ? 'contained'
                        : 'outlined'
                    }`}
                    onClick={() => getWeekMonthYears(0, 0, y)}
                >
                    {y}
                </Button>
            </Grid>
        ))
    }

    return (
        <Grid container className='DateInput'>
            <Box
                display={
                    {
                        xs: 'none',
                        sm: 'block'
                    }
                }
            >
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography
                            variant='subtitle1'
                        >
                            {'Date Quick Select'}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid item xs={12}>
                            <Box px={2} py={1}>
                                <Grid
                                    container
                                    spacing={2}
                                >
                                    <Grid item xs={2}>
                                        <Typography variant='subtitle1'>
                                            Weeks
                                        </Typography>
                                    </Grid>
                                    {renderWeeks()}
                                    <Grid item xs={2} />
                                    <Grid item xs={2}>
                                        <Typography variant='subtitle1'>
                                            Months
                                        </Typography>
                                    </Grid>
                                    {renderMonths()}
                                    <Grid item xs={2}>
                                        <Typography variant='subtitle1'>
                                            Years
                                        </Typography>
                                    </Grid>
                                    {renderYears()}
                                </Grid>
                            </Box>
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            </Box>
            <Grid item xs={12} className='RangeDatePicker'>
                <DatePicker
                    selected={Date.parse(startDate.format('MM/DD/YYYY'))}
                    startDate={Date.parse(startDate.format('MM/DD/YYYY'))}
                    endDate={Date.parse(endDate)}
                    shouldCloseOnSelect={startDate && !endDate}
                    selectsRange
                    onChange={(dates) => getRangedTimeEntries(dates)}
                    customInput={
                        <Box
                            px={2}
                            mt={3}
                            borderRadius='borderRadius'
                            bgcolor='primary.light'
                            className='date-picker'
                        >
                            <RangeDatePickerInput
                                startDate={startDate
                                    ? startDate.format('MM/DD/YYYY')
                                    : 'Start date'
                                }
                                endDate={endDate
                                    ? endDate.format('MM/DD/YYYY')
                                    : 'End date'
                                }
                            />
                        </Box>
                    }
                />
            </Grid>
        </Grid>
    )
}

export default DateInput
