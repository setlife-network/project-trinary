import React from 'react'
import {
    Grid
} from '@material-ui/core'
import ContributorTile from './ContributorTile'

const Contributors = React.memo((props) => {
    const {
        contributors,
        active,
        project,
        addAllocation
    } = props

    const renderContributorsToAdd = () => {
        return contributors.map(c => {
            return (
                <Grid item xs={12} md={6} key={c.id}>
                    <ContributorTile 
                        active={active}
                        contributor={c}
                        onAddButton={addAllocation}
                        project={project}  
                    />
                </Grid>
            )
        })
    }

    return (
        <Grid container className='Contributors'>
            {
                renderContributorsToAdd()
            }
        </Grid>
    )
})

export default Contributors