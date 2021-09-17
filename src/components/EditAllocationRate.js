import React, { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import {
    Box,
    Button,
    ButtonGroup,
    Grid
} from '@material-ui/core/'
import moment from 'moment'
import { findKey } from 'lodash'

import LoadingProgress from './LoadingProgress'
import RateProratedMonthlyForm from './RateProratedMonthlyForm'
import RateMaxBudgetForm from './RateMaxBudgetForm'
import {
    GET_CONTRIBUTOR_ALLOCATIONS,
    GET_CONTRIBUTOR_RATES
} from '../operations/queries/ContributorQueries'
import { CREATE_RATE } from '../operations/mutations/RateMutations'
import { UPDATE_ALLOCATION } from '../operations/mutations/AllocationMutations'
import DateInput from './DateInput'

const EditAllocationRate = (props) => {

    const {
        allocation,
        currency,
        endDate,
        rate,
        selectedPayment,
        setEndDate,
        setNewAllocationRate,
        setSelectedCurrency,
        setStartDate,
        startDate,
    } = props
    
    const [selectedRateType, setSelectedRateType] = useState(rate.type)

    return (
        <Box className='EditAllocationRate'>
            <Grid container>
                <Grid item xs={12}>
                    <ButtonGroup color='primary' aria-label='outlined primary button group'>
                        <Button
                            variant={`${selectedRateType == 'prorated_monthly' ? 'contained' : 'outlined'}`}
                            color='primary'
                            onClick={() => setSelectedRateType('prorated_monthly')}
                        >
                            {'Prorated monthly'}
                        </Button>
                        <Button
                            variant={`${selectedRateType == 'max_budget' ? 'contained' : 'outlined'}`}
                            color='primary'
                            onClick={() => setSelectedRateType('max_budget')}
                        >
                            {'Max Budget'}
                        </Button>
                    </ButtonGroup>
                </Grid>
            </Grid>
            <Box mt={3}>
                <DateInput
                    startDate={startDate}
                    endDate={endDate}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                />
            </Box>
            {selectedRateType == 'prorated_monthly'
                ? (
                    <RateProratedMonthlyForm
                        rateCurrency={rate.currency}
                        clientCurrency={currency}
                        currentRate={rate}
                        selectedPayment={selectedPayment}
                        setNewAllocationRate={setNewAllocationRate}
                        setCurrency={setSelectedCurrency}
                        startDate={moment(startDate)}
                        endDate={moment(endDate)}
                    />
                ) : (
                    <RateMaxBudgetForm
                        currentTotal={allocation.amount}
                        clientCurrency={currency}
                        currentRate={rate}
                        selectedPayment={selectedPayment}
                        setCurrency={setSelectedCurrency}
                        setNewAllocationRate={setNewAllocationRate}
                        startDate={moment(startDate)}
                        endDate={moment(endDate)}
                    />
                )
            }
        </Box>
    )
}

export default EditAllocationRate
