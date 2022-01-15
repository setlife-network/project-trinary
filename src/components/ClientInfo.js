import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import {
    Box,
    Button,
    Card,
    CardActions,
    Dialog,
    Grid,
    Typography,
} from '@material-ui/core/'
import AttachMoneyIcon from '@material-ui/icons/AttachMoney'
import EuroIcon from '@material-ui/icons/Euro'

import ClientEditDialog from './ClientEditDialog'
import LoadingProgress from './LoadingProgress'

import { selectCurrencySymbol } from '../scripts/selectors'
import colors from '../styles/colors.module.scss'
import { GET_CLIENT_INFO } from '../operations/queries/ClientQueries'
import { styles } from '@material-ui/pickers/views/Calendar/Calendar'

const { lightGrey } = colors

const ClientInfo = ({
    clientId
}) => {
    const [open, setOpen] = useState(false)

    const handleEditOpen = () => {
        setOpen(true)
    }
    const handleEditClose = (value) => {
        setOpen(false)
    }

    const { loading, error, data, networkStatus } = useQuery(GET_CLIENT_INFO, {
        variables: {
            id: parseInt(clientId, 10)
        }
    })

    if (loading) return <LoadingProgress/>
    if (error) return `Error! ${error.message}`

    const client = data.getClientById

    return (
        <Card>
            <Box px={5} p={3} align='left'>
                <Typography variant='h4' color='primary'>
                    <strong>
                        {client.name}
                    </strong>
                </Typography>
                <Typography variant='h6'>
                    <Box overflow='hidden' textOverflow='ellipsis'>
                        {client.email}
                    </Box>
                </Typography>
                <Grid container alignItems='flex-end' >
                    <Grid item>
                        <Typography variant={'h6'} >
                            {`${selectCurrencySymbol({ currency: client.currency })}`}
                            {client.currency}
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
            <hr color={lightGrey}/>
            <Box px={3} pb={1}>
                <CardActions>
                    <Button onClick={handleEditOpen}>
                        {'Edit'.toUpperCase()}
                    </Button>
                </CardActions>
            </Box>
            <ClientEditDialog
                client={client}
                open={open}
                onClose={handleEditClose}
            />
        </Card>
    )
}

export default ClientInfo
