import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/client'
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'
import moment from 'moment'
import CurrencyTextField from '@unicef/material-ui-currency-textfield'

import Section from '../components/Section'

import { selectCurrencyInformation } from '../scripts/selectors'

import { GET_PROJECT } from '../operations/queries/ProjectQueries'
import { CREATE_PAYMENT } from '../operations/mutations/PaymentMutations'

import { sessionUser } from '../reactivities/variables'

const AddPaymentPage = () => {

    const { projectId } = useParams()

    const [paymentAmount, setPaymentAmount] = useState(null)
    const [paymentIncurred, setPaymentIncurred] = useState(null)
    const [paymentPaid, setPaymentPaid] = useState(null)

    const history = useHistory()

    const {
        data: dataProject,
        loading: loadingProject,
        error: errorProject,
    } = useQuery(GET_PROJECT, {
        variables: {
            id: Number(projectId)
        }
    })

    const [createPayment, {
        dataNewPayment,
        loadingNewPayment,
        errorNewPayment
    }] = useMutation(CREATE_PAYMENT)

    if (loadingProject) return ('Loading...')

    if (errorProject) return (`${errorProject}`)

    const project = dataProject.getProjectById

    const disabledPayment = !paymentAmount || !paymentIncurred

    const currencyInformation = 
        selectCurrencyInformation({
            currency: project.expected_budget_currency
                ? project.expected_budget_currency
                : 'USD' 
        })

    const handleCreatePayment = async () => {
        if (disabledPayment) return
        const variables = {
            amount: paymentAmount,
            project_id: Number(projectId),
            date_incurred: paymentIncurred,
            date_paid: paymentPaid,
            currency: project.expected_budget_currency,
            contributor_id: sessionUser().id
        }
        const newPayment = await createPayment({ variables })
        if (loadingNewPayment) return 'Loading...'
        if (newPayment.errors) {
            return `An error ocurred ${Object.keys(newPayment.errors[0].extensions.exception.fields)[0]}`
        }
        const {
            createPayment: payment
        } = newPayment.data
        history.push(`/payments/edit/${payment.id}`)
    }

    const cancelPayment = () => {
        history.push(`/projects/${project.id}`)
    }

    return (
        <div className='AddPaymentPage'>
            <Section>
                <div className='grid gap-8'>
                    <p className='text-xl font-bold'>
                        Enter info below to add a payment
                    </p>
                    <CurrencyTextField
                        fullWidth
                        label='Payment amount'
                        variant='outlined'
                        currencySymbol={`${currencyInformation['symbol']}`}
                        minimumValue='0'
                        outputFormat='string'
                        decimalCharacter={`${currencyInformation['decimal']}`}
                        digitGroupSeparator={`${currencyInformation['thousand']}`}
                        value={paymentAmount}
                        onChange={(event, value) => setPaymentAmount(parseInt(value, 10))}
                    />
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                        <KeyboardDatePicker
                            fullWidth
                            disableToolbar
                            variant='inline'
                            format='MM/DD/YYYY'
                            margin='normal'
                            label='Payment date incurred'
                            value={paymentIncurred}
                            onChange={(e) => setPaymentIncurred(moment(e['_d']).format('YYYY-MM-DD'))}
                        />
                    </MuiPickersUtilsProvider>
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                        <KeyboardDatePicker
                            fullWidth
                            disableToolbar
                            variant='inline'
                            format='MM/DD/YYYY'
                            margin='normal'
                            label='Payment date paid'
                            value={paymentPaid}
                            onChange={(e) => setPaymentPaid(moment(e['_d']).format('YYYY-MM-DD'))}
                        />
                    </MuiPickersUtilsProvider>
                </div>
                <div className='grid grid-cols-1 gap-4 fixed bottom-20 left-20 right-20'>
                    
                    <button
                        type='button'
                        className=' rounded-lg px-8 py-2 w-fit text-center m-auto'
                        onClick={() => cancelPayment()}
                    >
                        Cancel
                    </button>
                   
                    <div className='w-full'>
                        <button
                            type='button'
                            className={`${disabledPayment ? 'disabled pointer-events-none bg-light' : 'bg-setlife'} rounded-lg px-8 py-2 text-white w-full`}
                            onClick={() => handleCreatePayment()}
                            disabled={disabledPayment}
                        >
                            Save Payment
                        </button>
                    </div>
                </div>
            </Section>
        </div>
    )
}

export default AddPaymentPage