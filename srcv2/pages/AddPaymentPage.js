import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'
import moment from 'moment'

import Section from '../components/Section'

import { GET_PROJECT } from '../operations/queries/ProjectQueries'

const AddPaymentPage = () => {

    const { projectId } = useParams()

    const [paymentAmount, setPaymentAmount] = useState(null)
    const [paymentIncurred, setPaymentIncurred] = useState(null)
    const [paymentPaid, setPaymentPaid] = useState(null)

    const {
        data: dataProject,
        loading: loadingProject,
        error: errorProject,
    } = useQuery(GET_PROJECT, {
        variables: {
            id: Number(projectId)
        }
    })

    if (loadingProject) return ('Loading...')

    if (errorProject) return (`${errorProject}`)

    const project = dataProject.getProjectById

    const disabledPayment = !paymentAmount || !paymentIncurred

    const createPayment = () => {
        if (disabledPayment) return
        console.log('createPayment');
    }

    const cancelPayment = () => {
        console.log('cancelPayment')
    }

    return (
        <div className='AddPaymentPage'>
            <Section>
                <div className='grid gap-8'>
                    <p className='text-xl font-bold'>
                        Enter info below to add a payment
                    </p>
                    <div className='flex gap-4'>
                        <input 
                            type='text'
                            placeholder='Amount'
                            onChange={(e) => setPaymentAmount(parseInt(e.target.value, 10))}
                            className='
                                form-control
                                block
                                w-full
                                px-3
                                py-1.5
                                text-black
                                font-normal
                                bg-white bg-clip-padding
                                border border-solid border-light
                                rounded-lg
                                transition
                                ease-in-out
                                m-0
                                focus:text-gray-700 focus:bg-white focus:border-setlife focus:outline-none
                            '
                        />
                        <p className='m-auto text-grey'>
                            {project.expected_budget_currency}
                        </p>
                    </div>
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
                            label='Payment date incurred'
                            value={paymentPaid}
                            onChange={(e) => setPaymentPaid(moment(e['_d']).format('YYYY-MM-DD'))}
                        />
                    </MuiPickersUtilsProvider>
                </div>
                <div className='grid grid-cols-1 gap-4 fixed bottom-20 left-20 right-20'>
                    <div className='w-full'>
                        <button
                            type='button'
                            className={`${disabledPayment ? 'disabled pointer-events-none bg-light' : 'bg-setlife'} rounded-lg px-8 py-2 text-white w-full`}
                            onClick={() => createPayment()}
                            disabled={disabledPayment ? false : true}
                        >
                            Save Payment
                        </button>
                    </div>
                    <div className='w-full'>
                        <button
                            type='button'
                            className='bg-grey rounded-lg px-8 py-2 text-white w-full'
                            onClick={() => cancelPayment()}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Section>
        </div>
    )
}

export default AddPaymentPage