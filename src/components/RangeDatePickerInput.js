import React, { forwardRef } from 'react'
import {
    Box,
    Grid,
    Hidden,
    Icon
} from '@material-ui/core'
import moment from 'moment'

const RangeDatePickerInput = ({
    startDate, endDate
}) => {
    return (
        <Grid container>
            <Grid item xs={6}>
                <Box px={2} py={1}>
                    <Grid container justify='space-between'>
                        <Hidden only='xs'>
                            <Grid item xs={2}>
                                <Icon className='fas fa-calendar-alt' color='primary'/>
                            </Grid>
                        </Hidden>
                        <Grid item xs={12} sm={8} className='date-holder'>
                            {`${
                                startDate
                                    ? startDate
                                    : 'Start date'
                            }`}
                        </Grid>
                    </Grid>
                </Box>
            </Grid>
            <hr p={0} m={0} className='divider'/>
            <Grid item xs={5}>
                <Box py={1} pl={4}>
                    <Grid container justify='space-between'>
                        <Hidden only='xs'>
                            <Grid item xs={2}>
                                <Icon className='far fa-calendar-alt' color='primary'/>
                            </Grid>
                        </Hidden>
                        <Grid item xs={12} sm={8} className='date-holder'>
                            {`${
                                endDate
                                    ? endDate
                                    : 'End date'
                            }`}
                        </Grid>
                    </Grid>
                </Box>
            </Grid>
        </Grid>

    )

}

export default RangeDatePickerInput
