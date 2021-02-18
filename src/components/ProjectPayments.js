import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import moment from 'moment'
import {
    Box,
    Fab,
    Grid,
    Typography
} from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn'
import { orderBy } from 'lodash'

import LoadingProgress from './LoadingProgress'
import PaymentsEmptyState from './PaymentsEmptyState'
import PaymentTile from './PaymentTile'
import PaymentsList from './PaymentsList'
import { GET_PROJECT_PAYMENTS } from '../operations/queries/ProjectQueries'
import {
    calculateTotalPayments,
    formatAmount,
    selectCurrencyInformation
} from '../scripts/selectors'

const ProjectPayments = (props) => {

    const { projectId } = props
    const history = useHistory()

    const { loading, error, data } = useQuery(GET_PROJECT_PAYMENTS, {
        variables: {
            id: Number(projectId)
        }
    })

    if (loading) return <LoadingProgress/>
    if (error) return `Error! ${error.message}`

    const { getProjectById } = data
    const { allocatedPayments, client } = getProjectById

    const currencyInformation = selectCurrencyInformation({ currency: client.currency })
    const totalPaidAmount = formatAmount({
        amount: calculateTotalPayments(allocatedPayments) / 100,
        currencyInformation: currencyInformation
    })
    const payments = orderBy(allocatedPayments, ['date_paid'], ['desc'])

    return (

        <Grid container justify='center' className='ProjectPayments'>
            <Grid item xs={12} align='left'>
                <Box p={3}>
                    <Grid container justify='space-between' alignItems='flex-end'>
                        <Grid item xs={12} sm={8}>
                            <Typography variant='h4'>
                                <strong>
                                    {'Payments'}
                                </strong>
                            </Typography>
                        </Grid>
                        <Grid item xs={11} sm={3}>
                            <Typography variant='h5'>
                                <strong>
                                    {`${totalPaidAmount} Total`}
                                </strong>
                            </Typography>
                        </Grid>
                        <Grid
                            item
                            xs={1}
                            align='right'
                            onClick={() => history.push(`/clients/${getProjectById.client.id}/payments/add`)}
                        >
                            <Fab
                                color='primary'
                                size='medium'
                            >
                                <AddIcon color='action'/>
                            </Fab>
                        </Grid>
                    </Grid>
                </Box>
                {allocatedPayments.length != 0
                    ? (
                        <PaymentsList
                            payments={payments}
                            project={getProjectById}
                        />
                    )
                    : (
                        <PaymentsEmptyState/>
                    )
                }
            </Grid>
        </Grid>

    )
}

export default ProjectPayments
