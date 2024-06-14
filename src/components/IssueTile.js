import React, { useState } from 'react'
import {
    Box,
    Grid,
    Avatar,
    Typography,
    Tooltip
} from '@material-ui/core'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import moment from 'moment'

const IssueTile = (props) => {

    const { issue } = props
    const issueIsOpen = issue.date_closed ? false : true

    const renderContributions = (contributions = []) => {
        return contributions.map(i => {
            return (
                <Tooltip title={i.contributor.github_handle}>
                    <Box mr={1}>
                        <Avatar alt='Avatar' src={i.contributor.avatar_url}/>
                    </Box>
                </Tooltip>
            )
        })
    }

    return (
        <Box
            className='IssueTile'
            borderRadius='borderRadius'
            border={1}
            borderColor='secondary.light'
            px={3}
            py={1}
            my={3}
        >
            <Grid container>
                <Grid
                    item
                    xs={12}
                    sm={10}
                    align='left'
                >
                    <Box overflow='hidden' textOverflow='ellipsis'>
                        <Typography variant='h6' noWrap>
                            {issue.name}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={4} lg={2}>
                    <Box
                        bgcolor={`${issueIsOpen ? 'primary.main' : 'primary.light_blue'}`}
                        borderRadius='borderRadius'
                        color={`${issueIsOpen ? 'primary.light' : 'secondary.main'}`}
                        px={2}
                        mt={1}
                    >
                        <Typography>
                            {`${issueIsOpen ? 'Open' : 'Closed'}`}
                        </Typography>
                    </Box>
                </Grid>
                <Grid xs={12}/>
                <Grid item xs={6} mt={1} align='left'>
                    <Typography color='secondary'>
                        {`Issue # ${issue.github_number}`}
                    </Typography>
                </Grid>
                <Grid item xs={6} mt={1} align='right'>
                    <Box>
                        <Typography color='secondary'>
                            {`${moment(issue.date_opened, ['x']).format('MM/DD/YYYY')}`}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={1}>
                        <Grid item>
                            <Box mt={1}>
                                <Typography color='secondary'>
                                    {`Contributors:`}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item>
                            {renderContributions(issue.contributions)}
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} align='left'/>
                <Grid item xs={6}>
                    <Box mt={2}>
                        <a
                            href={`${issue.github_url}`}
                            target='_blank'
                            rel='noreferrer'
                        >
                            <Grid container>
                                <Grid item>
                                    <Typography color='primary'>
                                        {`Issue details `}
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <Typography color='primary'>
                                        <ArrowForwardIcon/>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </a>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}

export default IssueTile
