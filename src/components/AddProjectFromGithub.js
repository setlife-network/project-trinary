import React, { useEffect, useState } from 'react'
import { useLazyQuery, useQuery } from '@apollo/client'
import {
    Avatar,
    Box,
    FormControl,
    Grid,
    InputLabel,
    Link,
    MenuItem,
    Select,
    Typography
} from '@material-ui/core'

import LoadingProgress from './LoadingProgress'
import {
    GET_CONTRIBUTOR_ORGANIZATIONS_FROM_GITHUB,
    GET_CONTRIBUTOR_REPOS_FROM_GITHUB
} from '../operations/queries/ContributorQueries'

const AddProjectFromGithub = (props) => {
    const {
        setProjectGithubURL
    } = props

    const {
        error: errorOrganizations,
        data: dataOrganizations,
        loading: loadingOrganizations
    } = useQuery(GET_CONTRIBUTOR_ORGANIZATIONS_FROM_GITHUB, {
        onCompleted: dataOrganizations => {
            const githubOrganizations = dataOrganizations.getGithubOrganizations
            setSelectedGithubOrganization(
                githubOrganizations.length
                    ? githubOrganizations[0]
                    : null
            )
        }
    })

    const [getRepos, {
        error: errorOrganizationRepos,
        data: dataOrganizationRepos,
        loading: loadingOrganizationRepos
    }] = useLazyQuery(GET_CONTRIBUTOR_REPOS_FROM_GITHUB, {
        onCompleted: payload => {
            const {
                getGithubRepos: { length }
            } = payload
            if (length) {
                setSelectedGithubRepo(payload.getGithubRepos[0])
                setRepoOptions([
                    ...repoOptions,
                    ...payload.getGithubRepos
                ])
            }
            if (length > 4) {
                setMoreRepoState(true)
            } else {
                setMoreRepoState(false)
            }
        }
    })

    console.log('dataOrganizationRepos')
    console.log(dataOrganizationRepos?.length)
    console.log(dataOrganizationRepos)

    const [selectedGithubOrganization, setSelectedGithubOrganization] = useState(null)
    const [selectedGithubRepo, setSelectedGithubRepo] = useState(null)
    const [MoreRepoState, setMoreRepoState] = useState(false)
    const [actualGithubPage, setActualGithubPage] = useState(null)
    const [repoOptions, setRepoOptions] = useState([])

    useEffect(() => {
        if (dataOrganizations && selectedGithubOrganization) {
            setActualGithubPage(1)
        }
    }, [selectedGithubOrganization])

    useEffect(() => {
        if (selectedGithubRepo) {
            setActualGithubPage(1)
            setProjectGithubURL(selectedGithubRepo.githubUrl)
        } else if (selectedGithubRepo == undefined && MoreRepoState) {
            setActualGithubPage(actualGithubPage + 1)
        }
    }, [selectedGithubRepo])

    useEffect(() => {
        if (selectedGithubOrganization) {
            getRepos({
                variables: {
                    organizationName: selectedGithubOrganization.name,
                    githubPageNumber: actualGithubPage
                }
            })
        }
    }, [actualGithubPage])

    const renderGithubOrganizations = ({ organizations }) => {
        return organizations.map((o, i) => {
            return (
                <MenuItem value={i}>
                    <Grid container spacing={3} alignItems='center'>
                        <Grid item>
                            <Avatar alt='Avatar' src={o.avatar} className='organization-avatar'/>
                        </Grid>
                        <Grid item>
                            {`${o.name ? o.name : 'Select'}`}
                        </Grid>
                    </Grid>
                </MenuItem>
            )
        })
    }

    const renderGithubRepos = ({ repos }) => {
        return repos.map((r, i) => {
            return (
                <MenuItem value={i}>
                    {`${r.name ? r.name : 'Select'}`}
                </MenuItem>
            )
        })
    }

    const renderMoreItem = ( itemValue ) => {
        return (
            <MenuItem value={itemValue + 1}>
                {`...more`}
            </MenuItem>
        )
    }

    if (loadingOrganizations) return <LoadingProgress/>
    if (errorOrganizations) return `An error ocurred ${errorOrganizations}`

    if (loadingOrganizationRepos) return <LoadingProgress/>
    if (errorOrganizationRepos) return `An error ocurred ${errorOrganizationRepos}`

    const githubOrganizations = dataOrganizations.getGithubOrganizations

    return (
        <Grid
            container
            spacing={3}
            justify='space-between'
            alignItems='flex-end'
            className='AddProjectFromGithub'
        >
            <Grid item xs={12} align='left'>
                <Box my={3}>
                    <Typography>
                        {`Search for a repo directly from Github`}
                    </Typography>
                </Box>
            </Grid>
            <Grid item xs={12} sm={5}>
                <FormControl fullWidth>
                    <InputLabel>
                        {`User/Organization`}
                    </InputLabel>
                    <Select
                        fullWidth
                        value={githubOrganizations.indexOf(selectedGithubOrganization)}
                        onChange={(event) => (
                            setSelectedGithubOrganization(githubOrganizations[event.target.value])
                        )}
                    >
                        {renderGithubOrganizations({ organizations: githubOrganizations })}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={5}>
                <FormControl fullWidth>
                    <InputLabel>
                        {`Repositories`}
                    </InputLabel>
                    <Select
                        fullWidth
                        value={repoOptions.indexOf(selectedGithubRepo)}
                        onChange={(event) => setSelectedGithubRepo(repoOptions[event.target.value])}
                    >
                        {renderGithubRepos({
                            repos: repoOptions
                        })}
                        { MoreRepoState ? renderMoreItem(repoOptions.length) : null }
                    </Select>
                </FormControl>
            </Grid>
        </Grid>
    )
}

export default AddProjectFromGithub
