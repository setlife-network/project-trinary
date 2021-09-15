import React from 'react'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

import ClientAddForm from '../components/ClientAddForm'

class AddClientPage extends React.Component {

    render() {
        return (
            <Grid
                container
                className='AddClientPage'
                justify='center'
            >
                <Grid item xs={10}>
                    <Typography align='left'>
                        <strong>
                            Enter info below to create a client
                        </strong>
                    </Typography>
                    <Typography align='left'>
                        You can add projects within the newly created client page
                    </Typography>
                    <Box mt={5}>
                        <ClientAddForm
                            history={this.props.history}
                        />
                    </Box>
                </Grid>
            </Grid>
        )
    }
}

export default AddClientPage
