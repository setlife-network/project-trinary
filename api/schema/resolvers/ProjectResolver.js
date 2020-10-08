const moment = require('moment')

module.exports = {

    Project: {
        client: (project, args, { models }) => {
            return models.Client.findByPk(project.client_id)
        },
        issues: (project, args, { models }) => {
            return models.Issue.findAll({ where: { project_id: project.id } })
        }
    },

    Query: {
        getProjectById: (root, { id }, { models }) => {
            return models.Project.findByPk(id)
        },
        getProjects: (root, args, { models }) => {
            return models.Project.findAll()
        }
    },

    Mutation: {
        createProject: async(root, {
            createFields,
            date
        }, { models }) => {
            return models.Project.create({
                ...createFields,
                date: new moment(date, 'MM-DD-YYYY HH:mm:ss').utc()
            })
        }
    }

}
