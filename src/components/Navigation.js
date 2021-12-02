import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useReactiveVar } from '@apollo/client'
import {
    AppBar,
    Box,
    Grid,
    Typography
} from '@material-ui/core'
import withWidth, { isWidthUp } from '@material-ui/core/withWidth'
import { split } from 'lodash'

import { lightBlue } from '../styles/colors.scss'
import { LOGO_URL, SMALL_LOGO_URL } from '../constants'
import { capitalizeWord, matchTitlePage } from '../scripts/utilities'
import { pageName } from '../reactivities/variables'

const Navigation = (props) => {

    const history = useHistory()
    const redirectToHome = () => {
        history.push('/')
    }
    const location = useLocation()
    const locationTitle = matchTitlePage({ location: location.pathname })
    const optionalLocationTitle = useReactiveVar(pageName)

    return (
        <Box bgcolor={lightBlue} mb={[3, 5]}>
            <AppBar className='Navigation' position='sticky' color='white'>
                <Grid container alignItems='center'>
                    <Grid item xs={2} sm={3}>
                        <Box align='center' onClick={() => redirectToHome()}>
                            {props.width == 'xs'
                                ? (
                                    <img
                                        src={SMALL_LOGO_URL}
                                        alt='Logo'
                                        className='icon-image'
                                    />
                                ) : (
                                    <img
                                        src={LOGO_URL}
                                        alt='Logo'
                                        className='icon-image'
                                    />
                                )
                            }
                        </Box>
                    </Grid>
                    <Grid item xs={8} sm={6}>
                        <Typography 
                            variant='h5' 
                            className='navigation-title'
                            noWrap
                        >
                            {capitalizeWord({
                                word: locationTitle.title || optionalLocationTitle
                            })}
                        </Typography>
                    </Grid>
                </Grid>
            </AppBar>
        </Box>

    )
}

export default withWidth()(Navigation)
