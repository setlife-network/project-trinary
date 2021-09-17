import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Fab,
    Grid,
    Typography
} from '@material-ui/core/'
import AddIcon from '@material-ui/icons/Add'
import moment from 'moment'
import { filter, sortBy } from 'lodash'
import { useHistory } from 'react-router-dom'

import AllocationOverview from './AllocationOverview'
import { GET_ALLOCATIONS } from '../operations/queries/AllocationQueries'
import {
    formatAmount,
    selectActiveAndUpcomingAllocations,
    selectCurrencyInformation,
    getExpectedHours
} from '../scripts/selectors'

const ContributorTile = (props) => {

    const {
        active,
        contributor,
        onAddButton,
        project
    } = props
    const history = useHistory()

    const [openAllocationOverview, setOpenAllocationOverview] = useState(false)
    const [selectedAllocation, setSelectedAllocation] = useState(null)

    const handleAddButton = () => {
        onAddButton({ contributor })
    }
    const handleAllocationOverview = ({ value, allocation }) => {
        setSelectedAllocation(allocation)
        setOpenAllocationOverview(value)
    }
    const redirectToContributorDetails = ({ contributor }) => {
        history.push(`/contributor/${contributor.id}`)
    }

    const {
        data: dataAllocation,
        error: errorAllocation,
        loading: loadingAllocation
    } = useQuery(GET_ALLOCATIONS, {
        variables: {
            projectId: project.id,
            contributorId: contributor.id
        }
    })

    const renderContributorAllocations = (props) => {
        const {
            allocations
        } = props

        const currenctAndUpcomingAllocations = filter(allocations, (allocation) => (
            selectActiveAndUpcomingAllocations({
                allocation: allocation
            })
        ))
        const sortedAllocations = sortBy(currenctAndUpcomingAllocations, ['start_date'])

        return sortedAllocations.map(a => {

            const currencyInformation = selectCurrencyInformation({
                currency: a.rate.currency
            })
            const allocationAmount = formatAmount({
                amount: a.amount / 100,
                currencyInformation: currencyInformation
            })
            const hourlyRateAmount = formatAmount({
                amount: a.rate.hourly_rate,
                currencyInformation: currencyInformation
            })
            const isActiveAllocation = moment.utc(a.start_date, 'x').isBefore(moment())
            const expectedHoursMaxBudget = getExpectedHours({
                amount: Number((a.amount / 100).toFixed(2)),
                hourlyRate: a.rate.hourly_rate
            })

            return (
                <Grid
                    item
                    xs={12}
                    onClick={() => handleAllocationOverview({ value: true, allocation: a })}
                    className='ContributorTile'
                >
                    <hr/>
                    <Box my={1}>
                        <Grid container>
                            <Grid item xs={4}>
                                <Typography
                                    color={`${!isActiveAllocation && 'secondary'}`}
                                    variant='caption'
                                >
                                    <strong>
                                        {`Total allocated:`}
                                    </strong>
                                    <br/>
                                    {`${allocationAmount}`}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography
                                    color={`${!isActiveAllocation && 'secondary'}`}
                                    variant='caption'
                                >
                                    <strong>
                                        {`Rate:`}
                                    </strong>
                                    <br/>
                                    {`${hourlyRateAmount} /h.`}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography
                                    color={`${!isActiveAllocation && 'secondary'}`}
                                    variant='caption'
                                >
                                    <strong>
                                        {`Expected hours:`}
                                    </strong>
                                    <br/>
                                    {`${a.rate.total_expected_hours
                                        ? `${a.rate.total_expected_hours} h.`
                                        : `${expectedHoursMaxBudget} h.`
                                    }`}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography
                                    color={`${!isActiveAllocation && 'secondary'}`}
                                    variant='caption'
                                >
                                    <strong>
                                        {`Start date:`}
                                    </strong>
                                    <br/>
                                    {`${moment(a.start_date, 'x').utc().format('MM/DD/YYYY')}`}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography
                                    color={`${!isActiveAllocation && 'secondary'}`}
                                    variant='caption'
                                >
                                    <strong>
                                        {`End date:`}
                                    </strong>
                                    <br/>
                                    {`${moment(a.end_date, 'x').utc().format('MM/DD/YYYY')}`}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography
                                    color={`${!isActiveAllocation && 'secondary'}`}
                                    variant='caption'
                                >
                                    <strong>
                                        {`Date paid:`}
                                    </strong>
                                    <br/>
                                    {`${a.date_paid
                                        ? moment.utc(a.date_paid, 'x').utc().format('MM/DD/YYYY')
                                        : 'Proposed'
                                    }`}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
            )
        })
    }

    if (loadingAllocation) return ''
    if (errorAllocation) return `An error ocurred ${errorAllocation}`

    const { getAllocations: allocations } = dataAllocation

    return (
        <Box
            className={`ContributorTile`}
            bgcolor={`${active ? 'primary.light_blue' : ''}`}
            borderRadius='borderRadius'
            p={2}
            my={2}
            mx={active ? 1 : 0}
            align='left'
        >
            <Box className={`${!active ? 'non-allocated' : ''}`}>
                <Accordion>
                    <Grid container alignItems='center'>
                        <Grid item xs={2}>
                            <Box px={active ? 0 : 1}>
                                <Fab
                                    color={`${active ? 'secondary' : 'primary'}`}
                                    size='small'
                                    onClick={() => handleAddButton()}
                                    className={`${active && 'outlined-add-icon'}`}
                                >
                                    <AddIcon color='action'/>
                                </Fab>
                            </Box>
                        </Grid>
                        <Grid item xs={10}>
                            <AccordionSummary>
                                <Grid container>
                                    <Grid item xs={12}>
                                        <Typography>
                                            <strong>
                                                {contributor.name}
                                            </strong>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        {contributor.github_handle}
                                    </Grid>
                                </Grid>
                            </AccordionSummary>
                        </Grid>
                    </Grid>
                    <AccordionDetails>
                        <Grid container spacing={3}>
                            {
                                renderContributorAllocations({
                                    allocations: allocations
                                })
                            }
                            <Grid item xs={12} align='center'>
                                <Button
                                    variant='outlined'
                                    color='primary'
                                    onClick={() => redirectToContributorDetails({ contributor })}
                                >
                                    {`View Contributor Detail`}
                                </Button>
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            </Box>
            {selectedAllocation &&
                <AllocationOverview
                    allocationInfo={selectedAllocation}
                    onClose={() => handleAllocationOverview({ value: false })}
                    onOpen={openAllocationOverview}
                />
            }
        </Box>

    )
}

export default ContributorTile
