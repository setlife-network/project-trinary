import React, { useState, useEffect, useMemo, Suspense } from 'react'
import {
    Grid,
    Box,
    TextField,
    Typography
} from '@material-ui/core'
import ContributorsEmptyState from './ContributorsEmptyState'
import AllocationAddForm from './AllocationAddForm'
import { differenceBy } from 'lodash'
import GithubAccessBlocked from './GithubAccessBlocked'

const ContributorList = (props) => {

    const {
        contributors,
        project,
        activeContributorsAllocated,
        upcomingContributorsAllocatedOnly,
        errorGithubContributors,
        projectId
    } = props

    const [openAddAllocationDialog, setOpenAddAllocationDialog] = useState(false)
    const [contributorClicked, setContributorClicked] = useState(null)
    const [search, setSearch] = useState('')

    const ActiveContributors = React.lazy(() => import('./ActiveContributors'))
    const UpcomingContributors = React.lazy(() => import('./UpcomingContributors'))
    const Contributors = React.lazy(() => import('./Contributors'))

    const matchName = (name) => {
        return name.name.toLowerCase().includes(search.toLowerCase())
    }

    const matchGithub = (github) => {
        return github.github_handle.toLowerCase().includes('https://github.com/' + (search).toLowerCase())
    }

    const activeContributors = useMemo(
        () => activeContributorsAllocated.filter(a => {
            return matchName(a) || matchGithub(a)
        }),
        [search]
    )
    
    const upcomingContributors = useMemo( 
        () => upcomingContributorsAllocatedOnly.filter(u => {
            return matchName(u) || matchGithub(u)
        }),
        [search]
    )
    
    const addContributors = differenceBy(contributors, [...activeContributorsAllocated, ...upcomingContributorsAllocatedOnly], 'id')
    const contributorsToAdd = useMemo(
        () => addContributors.filter(a => {
            return matchName(a) || matchGithub(a)
        }),
        [search]
    )

    const addAllocation = (props) => {
        setOpenAddAllocationDialog(true)
        setContributorClicked(props.contributor)
    }

    const handleAddAllocationClose = (value) => {
        setOpenAddAllocationDialog(false)
    }

    return (
        <Grid container className='ProjectContributors'>
            <h1>
                {`${project.name} Contributors`}
            </h1>
            <Grid xs={12}/>
            <Grid item xs={12} sm={5}>
                <TextField
                    placeholder='Search contributors...' 
                    onChange={(event) => { setSearch(event.target.value) }}
                    fullWidth
                    color='primary'
                    variant='outlined'
                    type={'search'}
                    id='search'
                />
            </Grid>
            <Grid xs={12}/>
            <Grid item xs={12} sm={5}>
                <Box
                    bgcolor='primary.black'
                    color='primary.light'
                    borderRadius='borderRadius'
                    px={5}
                    py={1}
                    mt={3}
                >
                    {
                        `${activeContributors.length} active ${activeContributors.length == 1
                            ? 'contributor'
                            : 'contributors'
                        }`
                    }
                </Box>
            </Grid>
            <Grid xs={12}/>
            <Grid item xs={12}>
                <Box my={3}>
                    <Typography align='left' variant='h5'>
                        {`Active contributors`}
                    </Typography>
                    <Grid container>
                        {activeContributors.length != 0
                            ? (
                                <Suspense 
                                    fallback={
                                        <div>Loading...</div>
                                    }
                                >
                                    <ActiveContributors
                                        active
                                        contributors={activeContributors}
                                        project={project}
                                        addAllocation={addAllocation}
                                    />
                                </Suspense>
                            ) : <ContributorsEmptyState active/>
                        }
                    </Grid>
                </Box>
                <Box my={[2, 5]}>
                    <Typography align='left' variant='h5'>
                        {`Upcoming contributors`}
                    </Typography>
                    <Grid container>
                        {upcomingContributors.length != 0
                            ? ( 
                                <Suspense 
                                    fallback={
                                        <div>Loading...</div>
                                    }
                                >
                                    <UpcomingContributors 
                                        active
                                        contributors={upcomingContributors}
                                        project={project}
                                        addAllocation={addAllocation}
                                    />
                                </Suspense>
                            ) : <ContributorsEmptyState active/>
                        }
                    </Grid>
                </Box>
                <hr/>
            </Grid>
            <h1>
                {`Add new contributors to the project`}
            </h1>
            {errorGithubContributors
                ? ( 
                    <GithubAccessBlocked
                        message={`You must have access to this repository on GitHub to see an up-to-date list of collaborators.`}
                        projectId={projectId}
                    />
                ) : null
            }
            <Grid item xs={12}>
                <Box>
                    <Grid container>
                        {contributorsToAdd.length != 0
                            ? (
                                <Suspense 
                                    fallback={
                                        <div>Loading...</div>
                                    }
                                >
                                    <Contributors
                                        contributors={contributorsToAdd}
                                        project={project}
                                        addAllocation={addAllocation}
                                    />
                                </Suspense>
                            ) : <ContributorsEmptyState/>
                        }
                    </Grid>
                </Box>
                <Box my={[2, 5]} py={5}/>
            </Grid>
            <Grid item xs={12}>
                {contributorClicked &&
                    <AllocationAddForm
                        project={project}
                        open={openAddAllocationDialog}
                        onClose={handleAddAllocationClose}
                        contributor={contributorClicked}
                    />
                }
            </Grid>
        </Grid>
    )
}

export default ContributorList