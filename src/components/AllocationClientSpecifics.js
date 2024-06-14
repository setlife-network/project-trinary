import React, { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import {
    Box,
    Button,
    Collapse,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography
} from '@material-ui/core/'
import {
    ExpandLess,
    ExpandMore
} from '@material-ui/icons'
import AssessmentIcon from '@material-ui/icons/Assessment'
import GitHubIcon from '@material-ui/icons/GitHub'
import PaymentIcon from '@material-ui/icons/Payment'
import PeopleIcon from '@material-ui/icons/Group'
import moment from 'moment'
import {
    differenceBy,
    differenceWith,
    last,
    split
} from 'lodash'

import LoadingProgress from './LoadingProgress'
import { GET_CLIENT_PROJECTS } from '../operations/queries/ClientQueries'
import {
    formatAmount,
    selectCurrencyInformation
} from '../scripts/selectors'

const AllocationClientSpecifics = (props) => {

    const {
        client,
        contributor,
        contributors,
        payment,
        project,
        setContributor,
        setProject,
        setNewAllocation,
        allocationSelection
    } = props

    const {
        data: dataProjects,
        error: errorProjects,
        loading: loadingProjects
    } = useQuery(GET_CLIENT_PROJECTS, {
        fetchPolicy: 'cache-and-network',
        variables: {
            id: client.id
        }
    })

    const [openContributorsList, setOpenContributorsList] = useState(false)
    const [openProjectsList, setOpenProjectsList] = useState(false)
    const [selectedContributor, setSelectedContributor] = useState(null)
    const [selectedProject, setSelectedProject] = useState(null)

    useEffect(() => {
        if (selectedProject) {
            setProject(selectedProject)
        }
        if (selectedContributor) {
            setContributor(selectedContributor)
        }
        if (!contributor) {
            setSelectedContributor(null)
        }
    })
    useEffect(() => {
        if (contributor) {
            setSelectedContributor(contributor)
        }
    }, [contributor])
    useEffect(() => {
        if (project) {
            setSelectedProject(project)
        }
    }, [project])
    useEffect(() => {
        if (selectedContributor && selectedProject) {
            setNewAllocation({
                payment_id: payment.id,
                project_id: selectedProject.id
            })
        }
    }, [selectedContributor, selectedProject])

    const handleClickContributorsList = () => {
        setOpenContributorsList(!openContributorsList)
    }
    const handleClickProjectsList = () => {
        setOpenProjectsList(!openProjectsList)
    }
    const onClickProject = ({ project }) => {
        setSelectedProject(project)
        setOpenProjectsList(false)
    }
    const onClickContributor = ({ contributor }) => {
        setSelectedContributor(contributor)
        setOpenContributorsList(false)
    }

    const listContributors = (contributors) => {
        const contributorsList = differenceWith(contributors, [selectedContributor])
        return contributorsList.map(c => {
            return (
                <List component='div' disablePadding>
                    <ListItem button onClick={() => onClickContributor({ contributor: c })}>
                        <Grid container>
                            <Grid item md={3}/>
                            <Grid item xs={6} md={3}>
                                <ListItemText primary={`${c.name}`}/>
                            </Grid>
                            <Grid item xs={5} md={3} className='responsive-align'>
                                <Typography variant='caption' color='secondary'>
                                    {`${last(split(c.github_handle, '/'))}`}
                                </Typography>
                            </Grid>
                            <Grid item xs={1} md={3} className='icon-align'>
                                {c.github_access_token &&
                                    <GitHubIcon color='secondary' fontSize='small'/>
                                }
                            </Grid>
                        </Grid>
                    </ListItem>
                </List>
            )
        })
    }
    const listProjects = ({ projects, selectedProject }) => {
        const unselectedProjects = differenceBy(projects, [selectedProject], 'id')
        return unselectedProjects.map(project => {
            return (
                <List component='div' disablePadding>
                    <ListItem button onClick={() => onClickProject({ project })}>
                        <Grid container>
                            <Grid item md={3}/>
                            <Grid item xs={6} md={3}>
                                <ListItemText primary={`${project.name}`}/>
                            </Grid>
                            <Grid item xs={6} md={3} className='responsive-align'>
                                <Typography variant='caption' color='secondary'>
                                    {`${last(split(project.github_url, '/'))}`}
                                </Typography>
                            </Grid>
                        </Grid>
                    </ListItem>
                </List>
            )
        })
    }

    if (loadingProjects) return <LoadingProgress/>
    if (errorProjects) return `${errorProjects}`

    const { projects } = dataProjects.getClientById
    const currencyInformation = selectCurrencyInformation({
        currency: client.currency
    })
    const paymentAmount = formatAmount({
        amount: payment.amount / 100,
        currencyInformation: currencyInformation
    })
    const githubProjectHandle = selectedProject ? last(split(selectedProject.github_url, '/')) : ''
    const githubContributorHandle = selectedContributor ? last(split(selectedContributor.github_handle, '/')) : ''

    return (
        <Box className='AllocationClientSpecifics'>
            {allocationSelection[0] 
                ? ( 
                    <Grid container justifyContent='center'>
                        <Grid item xs={12}>
                            <List component='nav'>
                                <ListItem>
                                    <Grid container>
                                        <Grid item xs={2} md={3}>
                                            <PaymentIcon color='primary'/>
                                        </Grid>
                                        <Grid item xs={10} md={3}>
                                            <Typography>
                                                {`${paymentAmount}`}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} md={6} align='center'>
                                            <Typography variant='caption' color='secondary'>
                                                {`${payment.date_paid
                                                    ? moment.utc(payment.date_paid, 'x').format('MM/DD/YYYY')
                                                    : ''
                                                }`}
                                                {`${
                                                    !payment.date_paid && payment.date_incurred
                                                        ? 'Warning: This payment has not been paid'
                                                        : ''

                                                }`}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </ListItem>
                            </List>
                        </Grid>

                        <Grid item xs={12}>
                            <List component='nav'>
                                <ListItem button onClick={handleClickProjectsList}>
                                    <Grid container>
                                        <Grid item xs={2} md={3}>
                                            <AssessmentIcon color='primary'/>
                                        </Grid>
                                        <Grid item xs={4} md={3}>
                                            <Typography>
                                                {selectedProject ? selectedProject.name : 'No selected'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={4} md={3} className='responsive-align'>
                                            <Typography variant='caption' color='secondary'>
                                                {`${githubProjectHandle}`}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={2} md={3} align='right'>
                                            {openProjectsList
                                                ? <ExpandLess />
                                                : <ExpandMore />
                                            }
                                        </Grid>
                                    </Grid>
                                </ListItem>
                                <Collapse in={openProjectsList} timeout='auto' unmountOnExit>
                                    {listProjects({
                                        projects,
                                        selectedProject: selectedProject
                                    })}
                                </Collapse>
                                <ListItem button onClick={handleClickContributorsList}>
                                    <Grid container>
                                        <Grid item xs={2} md={3}>
                                            <PeopleIcon color='primary'/>
                                        </Grid>
                                        <Grid item xs={4} md={3}>
                                            <Typography>
                                                {selectedContributor ? selectedContributor.name : 'No selected'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={4} md={3} className='responsive-align'>
                                            <Typography variant='caption' color='secondary'>
                                                {`${githubContributorHandle}`}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={2} md={3} align='right'>
                                            {openContributorsList
                                                ? <ExpandLess />
                                                : <ExpandMore />
                                            }
                                        </Grid>
                                    </Grid>
                                </ListItem>
                                <Collapse in={openContributorsList} timeout='auto' unmountOnExit>
                                    {listContributors(contributors)}
                                </Collapse>
                            </List>
                        </Grid>

                    </Grid>
                ) : (
                    <Grid container justifyContent='center'>
                        <Grid item xs={12}>
                            'test'
                        </Grid>
                    </Grid>
                )
            }
        </Box>
    )

}

export default AllocationClientSpecifics
