import React from 'react'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import { makeStyles } from '@material-ui/core/styles'

import { LOGO_URL } from '../constants'

const useStyles = makeStyles({
    container: {
        width: '100%',
        height: '100px',
        background: '#f6f8f9',
        transform: 'scaleX(1.1)',
        borderRadius: ' 50% 50% 0 0/ 100% 100% 0 0',
    }
});

const HeaderBanner = ({
    title
}) => {
    const classes = useStyles();
    return (
        <Grid container className='Header'>
            <Grid item xs={12}>
                <Box bgcolor='primary.light_blue'>
                    <Box py={3} color='primary.black'>
                        <img
                            src={LOGO_URL}
                            alt='Logo'
                            className='logo-img'
                        />
                        <h2>
                            {title}
                        </h2>
                    </Box>
                    <Grid container className={classes.container}/>
                </Box>
            </Grid>

        </Grid>
    )
}

export default HeaderBanner
