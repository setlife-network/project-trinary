import React, { useEffect, useState } from 'react'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import { useHistory } from 'react-router-dom'
import {
    Button,
    FormControl,
    Grid,
    Snackbar
} from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers'
import CurrencyTextField from '@unicef/material-ui-currency-textfield'
import moment from 'moment'
import MomentUtils from '@date-io/moment'

import LoadingProgress from './LoadingProgress'
import { GET_CLIENT_INFO } from '../operations/queries/ClientQueries'
import { GET_CLIENT_PAYMENTS } from '../operations/queries/PaymentQueries'
import { CREATE_PAYMENT } from '../operations/mutations/PaymentMutations'
import {
    selectCurrencyInformation
} from '../scripts/selectors'

const AddPaymentForm = (props) => {

    const {
        clientId
    } = props

    const history = useHistory()

    const {
        data: dataClient,
        error: errorClient,
        loading: loadingProject
    } = useQuery(GET_CLIENT_INFO, {
        variables: {
            id: Number(clientId)
        }
    })

    const [createPayment, {
        dataNewPayment,
        loadingNewPayment,
        errorNewPayment
    }] = useMutation(CREATE_PAYMENT, {
        refetchQueries: [{
            query: GET_CLIENT_PAYMENTS,
            variables: {
                clientId: Number(clientId)
            }
        }]
    })

    const handleAlertClose = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }
        setDisplayError(false)
    }
    const handleCreatePayment = async () => {
        try {
            const variables = {
                amount: paymentAmount,
                client_id: Number(clientId),
                date_incurred: dateIncurred,
                date_paid: datePaid,
                currency: currencyInformation.name
            }
            const newPayment = await createPayment({ variables })
            if (loadingNewPayment) return <LoadingProgress/>
            else {
                const newPaymentId = newPayment.data.createPayment.id             
                history.push(`/clients/${clientId}/payments/${newPaymentId}/update`)
            }
        } catch (err) {
            if (err == 'Error: Invalid date format: date_incurred' || err == 'Error: Invalid date format: date_paid') {
                setCreatePaymentError('Invalid date format')
            } else if (err == 'Error: Response not successful: Received status code 400') {
                setCreatePaymentError('There was an unexpected error, please try again')
            } else {
                setCreatePaymentError(err)
            }
            setDisplayError(true)
        }
    }
    const handleDateIncurredChange = (date) => {
        if (date) {
            setDateIncurred(moment(date['_d']).format('YYYY-MM-DD'))
        } else {
            setDateIncurred(null)
            setDisableAdd(true)
        }
    }
    const handleDatePaidChange = (date) => {
        if (date) {
            setDatePaid(moment(date['_d']).format('YYYY-MM-DD'))
        } else {
            setDatePaid(null)
        }
    }
    const handlePaymentAmountChange = (input) => {
        if (input) {
            setInvalidPaymentAmountInput(false)
            const amount = Number(input.replace(/\D/g, ''))
            setPaymentAmount(amount)
        } else {
            setPaymentAmount(null)
            setDisableAdd(true)
        }
    }

    const [createPaymentError, setCreatePaymentError] = useState('')
    const [dateIncurred, setDateIncurred] = useState(null)
    const [datePaid, setDatePaid] = useState(null)
    const [disableAdd, setDisableAdd] = useState(true)
    const [displayError, setDisplayError] = useState(false)
    const [invalidPaymentAmountInput, setInvalidPaymentAmountInput] = useState(false)
    const [paymentAmount, setPaymentAmount] = useState(null)

    useEffect(() => {
        if (dateIncurred && paymentAmount) {
            setDisableAdd(false)
        }
    })

    if (loadingProject) return <LoadingProgress/>
    if (errorClient) return `Error! ${errorClient}`

    const { getClientById: client } = dataClient

    const currencyInformation = selectCurrencyInformation({
        currency: client.currency
    })

    return (
        <FormControl
            fullWidth
            align='left'
        >
            <Grid container spacing={5}>
                <Grid item xs={12}>
                    <Grid container>
                        <Grid item xs={12} sm={6} lg={4} data-testid='add-payment-amount-field'>
                            <CurrencyTextField
                                fullWidth
                                label='Payment amount'
                                variant='outlined'
                                currencySymbol={`${currencyInformation['symbol']}`}
                                minimumValue='0'
                                outputFormat='string'
                                decimalCharacter={`${currencyInformation['decimal']}`}
                                digitGroupSeparator={`${currencyInformation['thousand']}`}
                                onChange={(event) => handlePaymentAmountChange(event.target.value)}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={6} lg={4} data-testid='add-payment-date-incurred-field'>
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                        <KeyboardDatePicker
                            fullWidth
                            disableToolbar
                            variant='inline'
                            format='MM/DD/YYYY'
                            margin='normal'
                            label='Payment date incurred'
                            value={dateIncurred}
                            onChange={handleDateIncurredChange}
                        />
                    </MuiPickersUtilsProvider>
                </Grid>
                <Grid item xs={12} sm={6} lg={4} data-testid='add-payment-date-paid-field'>
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                        <KeyboardDatePicker
                            fullWidth
                            disableToolbar
                            variant='inline'
                            format='MM/DD/YYYY'
                            margin='normal'
                            label='Payment date paid'
                            value={datePaid}
                            onChange={handleDatePaidChange}
                        />
                    </MuiPickersUtilsProvider>
                </Grid>
                <Grid item xs={12}>
                    <Button
                        variant='contained'
                        color='primary'
                        disabled={disableAdd}
                        onClick={handleCreatePayment}
                        data-testid='add-payment-submit-button'
                    >
                        {`Add Payment`}
                    </Button>
                </Grid>
            </Grid>
            <Snackbar
                open={displayError}
                autoHideDuration={4000}
                onClose={handleAlertClose}
            >
                <Alert severity='error'>
                    {`${createPaymentError}`}
                </Alert>
            </Snackbar>
        </FormControl>
    )
}

export default AddPaymentForm