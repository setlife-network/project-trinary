import React from 'react'
import { useHistory } from 'react-router-dom';
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import { useQuery } from '@apollo/client';

import LoadingProgress from './LoadingProgress'
import { GET_ACTIVE_CLIENTS_COUNT } from '../operations/queries/ClientQueries'

const ClientListManager = (props) => {
    const history = useHistory()

    const addClient = () => {
        history.push('/client/add')
    }

    const { loading, error, data } = useQuery(GET_ACTIVE_CLIENTS_COUNT, {
        fetchPolicy: 'cache-and-network'
    });

    if (loading) return <LoadingProgress/>
    if (error) return `Error! ${error.message}`;
    return (
        <Box
            mb={3}
            mx={1}
            className='ClientListManager'
        >
            <Grid
                container
                direction='row'
                justify='space-between'
                alignItems='flex-end'
            >
                <Grid item xs={8} sm={6} md={4}>
                    <Box
                        bgcolor='primary.black'
                        color='primary.light'
                        borderRadius='borderRadius'
                        px={2}
                        px-lg={5}
                        py={1}
                    >
                        {
                            `${data.getActiveClientsCount} active ${data.getActiveClientsCount == 1
                                ? 'client'
                                : 'clients'
                            }`
                        }
                    </Box>
                </Grid>
                <Grid item xs={4} align='right'>
                    <Fab
                        color='primary'
                        onClick={() => addClient()}
                    >
                        <AddIcon color='action'/>
                    </Fab>
                </Grid>
            </Grid>
        </Box>

    )
}

export default ClientListManager
