import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import {
    Collapse,
    Grid,
    List,
    ListItem,
    ListItemText,
    Typography
} from '@material-ui/core/'
import PaymentIcon from '@material-ui/icons/Payment'
import {
    ExpandLess,
    ExpandMore
} from '@material-ui/icons'
import moment from 'moment'
import {
    differenceWith,
    findIndex,
    isEqual
} from 'lodash'

import { formatAmount, selectCurrencyInformation } from '../scripts/selectors'

const EditAllocationInfo = (props) => {

    const {
        allocation,
        payments,
        selectedPayment,
        setSelectedPayment
    } = props

    const currencyInformation = selectCurrencyInformation({
        currency: allocation.project.client.currency
    })

    const [openPayments, setOpenPayments] = useState(false)

    const history = useHistory()

    const handleClickPayments = () => {
        setOpenPayments(!openPayments)
    }
    const onClickPayment = (payment) => {
        if (payment) {
            setSelectedPayment(payment)
        } else {
            setSelectedPayment(null)
        }
        setOpenPayments(false)
    }

    const paymentAmount = (
        selectedPayment
            ? formatAmount({
                amount: selectedPayment.amount / 100,
                currencyInformation: currencyInformation
            })
            : 'Proposed'
    )
    const datePaid = (
        selectedPayment
            ? selectedPayment.date_paid
                ? moment(selectedPayment.date_paid, 'x').format('MM/DD/YYYY')
                : selectedPayment.date_incurred
                    ? 'Warning: This payment has not been paid'
                    : 'Proposed'
            : ''
    )

    const listPayments = (payments) => {
        const paymentsList = differenceWith(payments, [selectedPayment], isEqual)
        return paymentsList.map(payment => {
            const paymentAmount = (
                payment
                    ? (formatAmount({
                        amount: payment.amount / 100,
                        currencyInformation: currencyInformation
                    }))
                    : null
            )
            return (
                <List component='div' disablePadding>
                    <ListItem button onClick={() => onClickPayment(payment)}>
                        <Grid container>
                            <Grid item xs={6} md={6}>
                                <ListItemText
                                    primary={`${
                                        payment
                                            ? `${paymentAmount}`
                                            : 'Propose'
                                    }`}
                                />
                            </Grid>
                            <Grid item xs={6} md={3} align='center'>
                                <Typography variant='caption' color='secondary'>
                                    {`${payment
                                        ? payment.date_paid
                                            ? moment(payment.date_paid, 'x').format('MM/DD/YYYY')
                                            : 'Not paid yet'
                                        : 'Proposed'
                                    }`}
                                </Typography>
                            </Grid>
                            <Grid item md={3}/>
                        </Grid>
                    </ListItem>
                </List>
            )
        })
    }

    const redirectToContributor = () => {
        history.push('/contributor/' + allocation.contributor.id)
    }

    return (
        <Grid
            container
            className='EditAllocationInfo'
            spacing={3}
        >
            <Grid item xs={6}>
                <Typography>
                    {`Project`}
                </Typography>
                <Typography color='primary'>
                    {`${allocation.project.name}`}
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography>
                    {`Contributor`}
                    <Typography 
                        className='redirect' 
                        color='primary'
                        onClick={redirectToContributor}
                    >
                        <span>
                            {`${allocation.contributor.name}`}
                        </span>
                    </Typography>
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography>
                    {`Client`}
                </Typography>
                <Typography color='primary'>
                    {`${allocation.project.client.name}`}
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography>
                    {`Payment`}
                </Typography>
                <List component='nav'>
                    <ListItem button onClick={handleClickPayments}>
                        <Grid container>
                            <Grid item xs={10}>
                                <Typography color='primary'>
                                    <ListItemText
                                        primary={`${paymentAmount}`}
                                    />
                                </Typography>
                            </Grid>
                            <Grid item xs={2} align='right'>
                                {openPayments
                                    ? <ExpandLess />
                                    : <ExpandMore />
                                }
                            </Grid>
                        </Grid>
                    </ListItem>
                    <Collapse in={openPayments} timeout='auto' unmountOnExit>
                        {payments.length > 1 &&
                            listPayments(payments)
                        }
                    </Collapse>
                </List>
                <Typography color='secondary' variant='caption'>
                    {`Date paid: ${datePaid}`}
                </Typography>
            </Grid>
        </Grid>
    )
}

export default EditAllocationInfo
