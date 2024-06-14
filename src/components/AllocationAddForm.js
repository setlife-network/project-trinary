import React, { useEffect, useState } from 'react'
import { useLazyQuery, useQuery, useMutation } from '@apollo/client'
import {
    Box,
    Button,
    ButtonGroup,
    Dialog,
    DialogTitle,
    Grid,
    Snackbar,
    Typography
} from '@material-ui/core/'
import Alert from '@material-ui/lab/Alert'
import {
    fill,
    filter,
    findKey
} from 'lodash'
import moment from 'moment'

import AllocationAddSpecifics from './AllocationAddSpecifics'
import AllocationClientSpecifics from './AllocationClientSpecifics'
import AllocationProposeSpecifics from './AllocationProposeSpecifics'
import LoadingProgress from './LoadingProgress'
import RateMaxBudgetForm from './RateMaxBudgetForm'
import RateProratedMonthlyForm from './RateProratedMonthlyForm'
import DateInput from './DateInput'

import {
    GET_CONTRIBUTORS,
    GET_CONTRIBUTOR_ALLOCATIONS,
    GET_CONTRIBUTOR_RATES
} from '../operations/queries/ContributorQueries'
import {
    GET_PROJECT_CONTRIBUTORS,
    GET_PROJECT_CLIENT_PAYMENTS,
    GET_PROJECT_PAYMENTS
} from '../operations/queries/ProjectQueries'
import {
    GET_PAYMENT_ALLOCATIONS,
    GET_PAYMENT_TOTAL_ALLOCATED
} from '../operations/queries/PaymentQueries'
import { GET_ALLOCATIONS } from '../operations/queries/AllocationQueries'
import { CREATE_RATE } from '../operations/mutations/RateMutations'
import { CREATE_ALLOCATION } from '../operations/mutations/AllocationMutations'

import colors from '../styles/colors.module.scss'
import { GET_CLIENT_PAYMENTS } from '../operations/queries/ClientQueries'

const { red } = colors

const AllocationAddForm = (props) => {

    const {
        client,
        contributor,
        payment,
        project,
        onClose,
        open
    } = props

    const [allocationTypes, setAllocationTypes] = useState([1, 0])
    const [allocationSelection, setAllocationSelection] = useState([1, 0])
    const [contributorAllocations, setContributorAllocations] = useState(null)
    const [contributorRates, setContributorRates] = useState(null)
    const [displayError, setDisplayError] = useState(false)
    const [mostRecentAllocation, setMostRecentAllocation] = useState(null)
    const [newAllocationRate, setNewAllocationRate] = useState({})
    const [newAllocation, setNewAllocation] = useState({})
    const [rateCurrency, setRateCurrency] = useState(null)
    const [startDate, setStartDate] = useState(moment().add(1, 'months').startOf('month'))
    const [endDate, setEndDate] = useState(moment().add(1, 'months').endOf('month'))
    const [selectedContributor, setSelectedContributor] = useState(null)
    const [selectedProject, setSelectedProject] = useState(null)
    const [selectedPayment, setSelectedPayment] = useState(null)
    const [paymentError, setPaymentError] = useState('')
    const [totalAllocatedFromPayment, setTotalAllocatedFromPayment] = useState(null)

    const changeAllocationType = (props) => {
        const { allocationTypes, selectedType } = props
        const allocationTypesState = allocationTypes
        fill(allocationTypesState, 0)
        allocationTypesState[selectedType] = 1
        setAllocationTypes([...allocationTypesState])
    }

    const addAllocationOrLinkPayment = (props) => {
        const { allocationSelection, selection } = props
        const selectionState = allocationSelection
        fill(selectionState, 0)
        selectionState[selection] = 1
        setAllocationSelection([...selectionState])
    }

    const handleAlertClose = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }
        setDisplayError(false)
    }

    const createRateAndAllocation = async (props) => {
        try {
            const {
                allocation,
                contributorRates,
                rate
            } = props
            const allocationRate = {}
            //check if the values are different to any rate and if ti's the case, create new rate
            const existingRate = findKey(
                contributorRates,
                {
                    'hourly_rate': rate.hourly_rate.toString(),
                    'total_expected_hours': Number(rate.total_expected_hours),
                    'minimum_expected_hours': rate.minimum_expected_hours 
                        ? Number(rate.minimum_expected_hours)
                        : null,
                    'maximum_expected_hours': rate.maximum_expected_hours
                        ? Number(rate.maximum_expected_hours)
                        : null,
                    'minimum_hourly_rate': rate.minimum_hourly_rate
                        ? rate.minimum_hourly_rate.toString() 
                        : null,
                    'maximum_hourly_rate': rate.maximum_hourly_rate
                        ? rate.maximum_hourly_rate.toString() 
                        : null,
                    'type': rate.type,
                    'currency': rateCurrency
                }
            )
            if (existingRate != null) {
                //create only allocation referencing contributorRates[existingRate].id
                allocationRate['id'] = contributorRates[`${existingRate}`].id
            } else {
                allocationRate['id'] = (
                    await createRate({
                        variables: {
                            hourly_rate: rate.hourly_rate.toString(),
                            total_expected_hours: Number(rate.total_expected_hours),
                            minimum_expected_hours: rate.minimum_expected_hours 
                                ? Number(rate.minimum_expected_hours)
                                : null,
                            maximum_expected_hours: rate.maximum_expected_hours
                                ? Number(rate.maximum_expected_hours)
                                : null,
                            minimum_hourly_rate: rate.minimum_hourly_rate
                                ? rate.minimum_hourly_rate.toString() 
                                : null,
                            maximum_hourly_rate: rate.maximum_hourly_rate
                                ? rate.maximum_hourly_rate.toString() 
                                : null,
                            type: rate.type,
                            currency: rateCurrency,
                            contributor_id: selectedContributor.id
                        }
                    })).data.createRate.id
            }
            //create allocation with that rate id
            const allocationCreated = await createAllocation({
                variables: {
                    amount: Number(Number(rate.total_amount).toFixed(2)),
                    start_date: moment(startDate).format('YYYY-MM-DD'),
                    end_date: moment(endDate).format('YYYY-MM-DD'),
                    date_paid: null,
                    payment_id: allocation.payment_id,
                    project_id: Number(selectedProject.id),
                    contributor_id: Number(selectedContributor.id),
                    rate_id: allocationRate.id,
                    status: 'active'
                }
            })
            if (loadingNewAllocation) return ''
            else if (allocationCreated.errors) {
                console.log('Error adding the allocation');
            } else {
                onClose()
            }
        } catch (error) {
            setPaymentError('Error adding the allocation')
            setDisplayError(true)
        }
    }

    const getMostRecentAlloaction = (props) => {
        const { allocations } = props
        const mostRecentAllocation = [{ start_date: 0 }]
        allocations.map(a => {
            if (a.start_date > mostRecentAllocation[0].start_date) {
                return mostRecentAllocation[0] = a
            }
        })
        return mostRecentAllocation[0]
    }

    const getRangedTimeEntries = (dates) => {
        const [start, end] = dates
        setStartDate(start)
        setEndDate(end)
    }

    const {
        data: dataContributors,
        loading: loadingContributors,
        error: errorContributors
    } = useQuery(GET_CONTRIBUTORS)

    const {
        data: dataProjectContributors,
        loading: loadingProjectContributors,
        error: errorProjectContributors
    } = useQuery(GET_PROJECT_CONTRIBUTORS, {
        variables: {
            id: project && project.id
        },
        skip: !project
    })

    const {
        data: dataClientPayments,
        loading: loadingClientPayments,
        error: errorClientPayments
    } = useQuery(GET_PROJECT_CLIENT_PAYMENTS, {
        variables: {
            id: project && project.id
        },
        skip: !project
    })

    const [getContributorAllocations, {
        data: dataContributorAllocations,
        loading: loadingContributorAllocations,
        error: errorContributorAllocations
    }] = useLazyQuery(GET_CONTRIBUTOR_ALLOCATIONS, {
        onCompleted: dataContributorAllocations => {
            setContributorAllocations(dataContributorAllocations)
        }
    })

    const [getContributorRates, {
        data: dataContributorRates,
        loading: loadingContributorRates,
        error: errorContributorRates
    }] = useLazyQuery(GET_CONTRIBUTOR_RATES, {
        onCompleted: dataContributorRates => {
            setContributorRates(dataContributorRates)
        }
    })

    const [getTotalAllocatedFromPayment, {
        data: dataTotalAllocated,
        loading: loadingTotalAllocated,
        error: errorTotalAllocated
    }] = useLazyQuery(GET_PAYMENT_TOTAL_ALLOCATED, {
        onCompleted: dataTotalAllocated => {
            setTotalAllocatedFromPayment(dataTotalAllocated)
        }
    })

    const [createRate, {
        dataNewRate,
        loadingNewRate,
        errorNewRate
    }] = useMutation(CREATE_RATE)

    const [createAllocation, {
        dataNewAllocations,
        loadingNewAllocation,
        errorNewAllocation
    }] = useMutation(CREATE_ALLOCATION, {
        refetchQueries: [{
            query: GET_PROJECT_CONTRIBUTORS,
            variables: {
                id: selectedProject ? Number(selectedProject.id) : null
            }
        }, {
            query: GET_CONTRIBUTOR_ALLOCATIONS,
            variables: {
                id: selectedContributor ? Number(selectedContributor.id) : null
            }
        }, {
            query: GET_ALLOCATIONS,
            variables: {
                contributorId: contributor ? contributor.id : null,
                projectId: project ? project.id : null
            }
        }, {
            query: GET_PROJECT_PAYMENTS,
            variables: {
                id: selectedProject ? Number(selectedProject.id) : null
            }
        }, {
            query: GET_PAYMENT_ALLOCATIONS,
            variables: {
                paymentId: selectedPayment ? Number(selectedPayment.id) : null
            }
        }, {
            query: GET_PAYMENT_TOTAL_ALLOCATED,
            variables: {
                paymentId: selectedPayment ? Number(selectedPayment.id) : null
            }
        }]
    })

    useEffect(() => {
        if (contributor) {
            setSelectedContributor(contributor)
        } else if (payment) {
            setSelectedPayment(payment)
        }
        if (dataContributors) {
            if (!client && !contributor && !selectedContributor) {
                setSelectedContributor(dataContributors[0])
            }
        }
        if (project) {
            setSelectedProject(project)
        } else {
            setSelectedProject(null)
        }
        if (!contributor) {
            setSelectedContributor(null)
        }
    }, [open])

    useEffect(() => {
        if (dataContributors) {
            if (!client && !contributor && !selectedContributor) {
                setSelectedContributor(dataContributors.getContributors[0])
            }
        }
    }, [dataContributors])

    useEffect(() => {
        if (mostRecentAllocation) {
            if (mostRecentAllocation.rate) {
                if (mostRecentAllocation.rate.type == 'prorated_monthly') {
                    setAllocationTypes([1, 0])
                } else if (mostRecentAllocation.rate.type == 'max_budget') {
                    setAllocationTypes([0, 1])
                }
            }
        }
    }, [mostRecentAllocation])

    useEffect(() => {
        if (selectedContributor) {
            getContributorAllocations({
                variables: {
                    id: selectedContributor.id
                }
            })
        }
    }, [selectedContributor])

    useEffect(() => {
        if (contributorAllocations) {
            setMostRecentAllocation(
                getMostRecentAlloaction(contributorAllocations.getContributorById)
            )
        }
    }, [contributorAllocations])

    useEffect(() => {
        if (selectedPayment) {
            if (selectedPayment.id) {
                getTotalAllocatedFromPayment({
                    variables: {
                        paymentId: selectedPayment.id
                    }
                })
            } else {
                setSelectedPayment(null)
            }
        }
    }, [selectedPayment])

    useEffect(() => {
        if (selectedPayment) {
            getTotalAllocatedFromPayment({
                variables: {
                    paymentId: selectedPayment.id
                }
            })
        }
    }, [newAllocationRate])

    if (loadingProjectContributors || loadingContributors || loadingContributorAllocations || loadingContributorRates || loadingClientPayments) {
        return (
            <>
                <LoadingProgress/>
            </>
        )
    }
    if (errorProjectContributors || errorContributors || errorContributorAllocations || errorContributorAllocations || errorContributorRates || errorClientPayments) {
        return `error`
    }

    const allocations = dataContributorAllocations && contributor
        ? dataContributorAllocations.getContributorById.allocations
        : dataProjectContributors
            ? dataProjectContributors.allocations
            : null
    const payments = dataClientPayments
        ? [...dataClientPayments.getProjectById.client.payments, {
            amount: null,
            date_paid: null
        }].sort((a, b) => b.date_incurred - a.date_incurred)
        : [null]
    const clientCurrency = (
        dataClientPayments
            ? dataClientPayments.getProjectById.client.currency
            : client
                ? client.currency
                : selectedProject
                    ? selectedProject.client.currency
                    : null
    )
    const rates = contributorRates
        ? dataContributorRates.getContributorById.rates
        : null
    const contributors = dataContributors.getContributors
    const activeAllocations = filter(allocations, 'active')
    const activeContributors = activeAllocations.map(a => {
        return a.contributor
    })
    if (!rateCurrency && clientCurrency) {
        setRateCurrency(clientCurrency)
    }

    return (
        <Dialog
            onClose={onClose}
            open={open}
            className='AllocationAddForm'
        >
            <Box m={5}>
                <DialogTitle>
                    {project && 
                        `Add Allocation`
                    }
                    {client && !selectedProject &&
                        <ButtonGroup color='primary' aria-label='outlined primary button group'>
                            <Button
                                variant={`${allocationSelection[0] ? 'contained' : 'outlined'}`}
                                color='primary'
                                onClick={() => (
                                    addAllocationOrLinkPayment({
                                        selection: 0,
                                        allocationSelection
                                    })
                                )}
                            >
                                {'Create New Allocation'}
                            </Button>
                            <Button
                                variant={`${allocationSelection[1] ? 'contained' : 'outlined'}`}
                                color='primary'
                                onClick={() => (
                                    addAllocationOrLinkPayment({
                                        selection: 1,
                                        allocationSelection
                                    })
                                )}
                            >
                                {'Link Existing Payment'}
                            </Button>
                        </ButtonGroup>
                    }
                </DialogTitle>
                <Grid container spacing={5} justifyContent='center'>
                    <Grid item xs={12}>
                        {project
                            ? (
                                <AllocationAddSpecifics
                                    contributor={contributor}
                                    contributors={contributors}
                                    currency={clientCurrency}
                                    payment={payment}
                                    payments={payments}
                                    project={project}
                                    setNewAllocation={setNewAllocation}
                                    selectedContributor={selectedContributor ? selectedContributor : contributors[0]}
                                    setContributor={setSelectedContributor}
                                    setPayment={setSelectedPayment}
                                />
                            )
                            : client
                                ? (
                                    <AllocationClientSpecifics
                                        client={client}
                                        contributor={selectedContributor}
                                        contributors={contributors}
                                        payment={payment}
                                        project={selectedProject}
                                        setNewAllocation={setNewAllocation}
                                        setContributor={setSelectedContributor}
                                        setProject={setSelectedProject}
                                        allocationSelection={allocationSelection}
                                    />
                                ) : (
                                    <AllocationProposeSpecifics
                                        contributor={contributor}
                                        setNewAllocation={setNewAllocation}
                                        setPayment={setSelectedPayment}
                                        setProject={setSelectedProject}
                                    />
                                )
                        }
                        <hr/>
                    </Grid>
                    {selectedProject &&
                        <>
                            <Grid item xs={12}>
                                <ButtonGroup color='primary' aria-label='outlined primary button group'>
                                    <Button
                                        variant={`${allocationTypes[0] ? 'contained' : 'outlined'}`}
                                        color='primary'
                                        onClick={() => (
                                            changeAllocationType({
                                                selectedType: 0,
                                                allocationTypes
                                            })
                                        )}
                                    >
                                        {'Prorated'}
                                    </Button>
                                    <Button
                                        variant={`${allocationTypes[1] ? 'contained' : 'outlined'}`}
                                        color='primary'
                                        onClick={() => (
                                            changeAllocationType({
                                                selectedType: 1,
                                                allocationTypes
                                            })
                                        )}
                                    >
                                        {'Budgeted'}
                                    </Button>
                                </ButtonGroup>
                            </Grid>
                            <Grid item xs={12} className='RangeDatePicker'>
                                <DateInput
                                    startDate={startDate}
                                    endDate={endDate}
                                    setStartDate={setStartDate}
                                    setEndDate={setEndDate}
                                />
                            </Grid>
                        </>
                    }
                </Grid>
                {selectedContributor &&
                    <>
                        {
                            allocationTypes[0]
                                ? (
                                    <RateProratedMonthlyForm
                                        clientCurrency={clientCurrency}
                                        currentRate={mostRecentAllocation ? mostRecentAllocation.rate : null}
                                        selectedPayment={selectedPayment}
                                        setNewAllocationRate={setNewAllocationRate}
                                        setCurrency={setRateCurrency}
                                        startDate={moment(startDate)}
                                        endDate={moment(endDate)}
                                    />
                                ) : (
                                    <RateMaxBudgetForm
                                        clientCurrency={clientCurrency}
                                        currentRate={mostRecentAllocation ? mostRecentAllocation.rate : null}
                                        selectedPayment={selectedPayment}
                                        setCurrency={setRateCurrency}
                                        setNewAllocationRate={setNewAllocationRate}
                                        startDate={moment(startDate)}
                                        endDate={moment(endDate)}
                                    />
                                )
                        }
                        {
                            (totalAllocatedFromPayment && selectedPayment) &&
                            (Number(totalAllocatedFromPayment.getPaymentById['totalAllocated']) + Number(newAllocationRate['total_amount'])) > Number(selectedPayment['amount']) &&
                            <Box color={`${red}`} mb={2}>
                                <Typography>
                                    {`Warning: The total allocated is bigger that the amount of the payment`}
                                </Typography>
                            </Box>

                        }
                        <Button
                            variant={`contained`}
                            color='primary'
                            disabled={
                                !selectedProject ||
                                !newAllocationRate['total_amount'] ||
                                !newAllocationRate['hourly_rate']
                                    ? true
                                    : false
                            }
                            onClick={() => createRateAndAllocation({
                                allocation: newAllocation,
                                rate: newAllocationRate,
                                contributorRates: rates
                            })}
                        >
                            {'Add Allocation'}
                        </Button>
                        {!selectedProject &&
                            <Box mt={2}>
                                <Typography variant='caption' className='warning'>
                                    {'Please select a project to create an allocation'}
                                </Typography>
                            </Box>
                        }
                    </>
                }
            </Box>
            <Snackbar
                open={displayError}
                autoHideDuration={1000}
                onClose={handleAlertClose}
            >
                <Alert severity='error'>
                    {`${paymentError}`}
                </Alert>
            </Snackbar>
        </Dialog>
    )
}

export default AllocationAddForm
