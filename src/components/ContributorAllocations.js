import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import {
    Box,
    Button,
    Grid,
    Typography,
    Menu,
    MenuItem
} from '@material-ui/core'
import SortIcon from '@material-ui/icons/Sort'
import { isEmpty, filter, orderBy } from 'lodash'

import AllocationAddForm from './AllocationAddForm'
import AllocationTile from './AllocationTile'
import EmptyState from './EmptyState'
import LoadingProgress from './LoadingProgress'
import {
    GET_CONTRIBUTOR_ALLOCATIONS,
    GET_CONTRIBUTOR_INFO
} from '../operations/queries/ContributorQueries'
import { white } from '../styles/colors.scss'

const ContributorAllocations = (props) => {

    const {
        contributorId
    } = props

    const [openAddAllocationDialog, setOpenAddAllocationDialog] = useState(false)
    const [anchorEl, setanchorEl] = useState(null)
    const [sortAllocated, setSortAllocated] = useState()
    const [sortProposed, setSortProposed] = useState()
    const [selectedSort, setSelectedSort] = useState()
    
    const {
        data: dataContributorAllocations,
        loading: loadingContributorAllocations,
        error: errorContributorAllocations
    } = useQuery(GET_CONTRIBUTOR_ALLOCATIONS, {
        variables: {
            id: Number(contributorId)
        }
    })
    const {
        data: dataContributor,
        loading: loadingContributor,
        error: errorContributor
    } = useQuery(GET_CONTRIBUTOR_INFO, {
        variables: {
            id: Number(contributorId)
        }
    })

    const handleAddAllocationClose = (value) => {
        setOpenAddAllocationDialog(false)
    }
    const handleProposeButton = () => {
        setOpenAddAllocationDialog(true)
    }

    const renderAllocations = ({ allocations }) => {
        return allocations.map(a => {
            return (
                <Grid item xs={12} sm={6} lg={4}>
                    <AllocationTile allocation={a}/>
                </Grid>
            )
        })
    }

    if (loadingContributorAllocations || loadingContributor) return <LoadingProgress/>
    if (errorContributorAllocations || errorContributor) return 'Error!'

    const { getContributorById: contributorAllocations } = dataContributorAllocations
    const { getContributorById: contributor } = dataContributor

    const allocatedAllocations = filter(contributorAllocations.allocations, 'payment')
    const proposedAllocations = filter(contributorAllocations.allocations, { 'payment': null })

    const handleSortButton = (event) => {
        setanchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setanchorEl(null);
    }

    const sortByNewestStartDate = () => {
        setSortAllocated(orderBy(allocatedAllocations, ['start_date'], ['desc']))
        setSortProposed(orderBy(proposedAllocations, ['start_date'], ['desc']))
        setSelectedSort('Start Date (Newest first)')
        handleClose()
    }

    const sortByOldestStartDate = () => {
        setSortAllocated(orderBy(allocatedAllocations, ['start_date'], ['asc']))
        setSortProposed(orderBy(proposedAllocations, ['start_date'], ['asc']))
        setSelectedSort('Start Date (Oldest first)')

        handleClose()
    }

    const sortByProjectName = () => {
        setSortAllocated(orderBy(allocatedAllocations, item => item.project.name.toLowerCase(), ['asc']))
        setSortProposed(orderBy(proposedAllocations, item => item.project.name.toLowerCase(), ['asc']))
        setSelectedSort('Project Name')
        handleClose()

    }

    const sortByClientName = () => {
        setSortAllocated(orderBy(allocatedAllocations, item => item.project.client.name.toLowerCase(), ['asc']))
        setSortProposed(orderBy(proposedAllocations, item => item.project.client.name.toLowerCase(), ['asc']))
        setSelectedSort('Client Name')
        handleClose()

    }

    const sortByPayment = () => {
        setSortAllocated(orderBy(allocatedAllocations, ['amount'], ['desc']))
        setSortProposed(orderBy(proposedAllocations, ['amount'], ['desc']))
        setSelectedSort('Payment')
        handleClose()
    }

    const clearSort = () => {
        setSortAllocated(allocatedAllocations)
        setSortProposed(proposedAllocations)
        setSelectedSort(null)
        handleClose()
    }

    return (
        <Box my={[2, 5]} mx={3} className='ContributorAllocations'>
            <Grid container spacing={4}>
                <Grid item xs='auto'>
                    <Typography variant='h5' color='primary'>
                        <strong>
                            {`Allocations`}
                        </strong>
                    </Typography>
                </Grid>
                <Grid item xs='auto'>
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={() => handleProposeButton()}
                    >
                        <Box color={`${white}`}>
                            <Typography>
                                {`Propose`}
                            </Typography>
                        </Box>
                    </Button>
                </Grid>
                <Grid item xs='auto'>
                    <Button aria-controls='simple-menu' aria-haspopup='true' onClick={handleSortButton}>
                        <SortIcon/>
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={sortByNewestStartDate}>Start Date (newest first)</MenuItem>
                        <MenuItem onClick={sortByOldestStartDate}>Start Date (older first)</MenuItem>
                        <MenuItem onClick={sortByProjectName}>Project</MenuItem>
                        <MenuItem onClick={sortByClientName}>Client</MenuItem>
                        <MenuItem onClick={sortByPayment}>Payment</MenuItem>
                        <MenuItem onClick={clearSort}>Clear Sort</MenuItem>
                    </Menu>
                </Grid>
                {selectedSort
                    ? (
                        <Grid item xs='12'>
                            <Typography variant='subtitle1' color='primary'>
                                {'Sorting by ' + selectedSort}
                            </Typography>
                        </Grid>
                    ) : null
                }
                <Grid item xs={12}>
                    <Typography variant='h6' color='secondary'>
                        {`Allocated`}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={5}>
                        {!isEmpty(allocatedAllocations)
                            ? (
                                isEmpty(sortAllocated)
                                    ? renderAllocations({ allocations: allocatedAllocations })
                                    : renderAllocations({ allocations: sortAllocated })
                            ) : (
                                <EmptyState
                                    description='This contributor has no allocations at the moment'
                                    iconClassName='fas fa-money-check'
                                />
                            )
                        }
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant='h6' color='secondary'>
                        {`Proposed`}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={5}>
                        {!isEmpty(proposedAllocations)
                            ? (
                                isEmpty(sortProposed)
                                    ? renderAllocations({ allocations: proposedAllocations })
                                    : renderAllocations({ allocations: sortProposed })
                            ) : (
                                <EmptyState
                                    description='This contributor has no proposed allocations'
                                    iconClassName='fas fa-money-check'
                                />
                            )
                        }
                    </Grid>
                </Grid>
            </Grid>
            <AllocationAddForm
                open={openAddAllocationDialog}
                onClose={handleAddAllocationClose}
                contributor={contributor}
            />
        </Box>
    )
}

export default ContributorAllocations
