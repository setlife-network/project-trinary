import React from 'react'
import {
    Icon
} from '@material-ui/core'
import { useQuery } from '@apollo/client'
import { useHistory } from 'react-router-dom';

import ProjectTile from './ProjectTile'

import { sessionUser } from '../reactivities/variables'

import { GET_CONTRIBUTOR_PROJECTS } from '../operations/queries/ContributorQueries'

const ProjectsList = () => {

    const history = useHistory()

    const {
        data: dataContributorProjects,
        loading: loadingContributorProjects,
        error: errorContributorProjects
    } = useQuery(GET_CONTRIBUTOR_PROJECTS, {
        variables: {
            id: Number(sessionUser().id)
        }
    })

    const renderProjects = () => {
        return dataContributorProjects.getContributorById.projects.map(project => {
            return (
                <div className='w-full'>
                    <button type='button' className='w-full' onClick={() => history.push(`/projects/${project.id}`)}>
                        <ProjectTile project={project}/>
                    </button>
                </div>
            )
        })
    }

    const projectsToShow = !loadingContributorProjects && !!dataContributorProjects.getContributorById.projects.length

    return (
        <div className='ProjectsList'>
            <div className='grid grid-flow-row auto-rows-max'>
                <div className='gap-2 flex mb-4 mt-8'>
                    <Icon className='fas fa-tasks'/>
                    <p>
                        My projects
                    </p> 
                </div>
                {loadingContributorProjects &&
                    `Loading...`
                }
                {!projectsToShow &&
                    <button type='button' onClick={() => history.push('/create-project')}>
                        <div className={`
                            bg-white
                            flex
                            px-8 py-6
                            gap-4
                            rounded-lg
                        `}
                        >
                            <div>
                                <div className='rounded-full h-10 w-10 bg-setlife'>
                                    <p className='text-2xl text-white font-bold'>
                                        +
                                    </p>
                                </div>
                            </div>
                            <div className='h-fit my-auto'>
                                <p className='text-xl font-bold'>
                                    Add new project
                                </p>
                            </div>
                        </div>
                    </button>
                }
                
                {projectsToShow &&
                    <div className={`projects-list bg-white pb-4 px-4 rounded-lg mt-2`}>
                        {renderProjects()}
                    </div>
                }
            </div>
        </div>
    )
}

export default ProjectsList