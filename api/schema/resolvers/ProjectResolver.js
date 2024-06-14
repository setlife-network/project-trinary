const moment = require('moment')
const sequelize = require('sequelize')
const { ApolloError } = require('apollo-server')
const { col, fn, Op } = require('sequelize')
const { split } = require('lodash')

const { GITHUB, TOGGL } = require('../../config/credentials');
const github = require('../../handlers/github')
const toggl = require('../../handlers/toggl')
const { validateDatesFormat } = require('../helpers/inputValidation')
const { dataSyncs } = require('../../modules')
const apiModules = require('../../modules')

module.exports = {

    Project: {
        admin: (project, args, { models }) => {
            return models.Contributor.findOne({
                include: {
                    model: models.Permission,
                    required: true,
                    where: {
                        project_id: project.id,
                        type: 'owner'
                    }
                }
            })
        },
        allocations: (project, args, { models }) => {
            const whereConditions = {
                project_id: project.id
            }
            if (args.contributorId) {
                whereConditions['contributor_id'] = args.contributorId
            }
            return models.Allocation.findAll({ where: whereConditions })
        },
        allocatedPayments: (project, args, { models }) => {
            return models.Payment.findAll({
                include: [
                    {
                        model: models.Allocation,
                        where: {
                            project_id: project.id
                        }
                    }
                ]
            })
        },
        payments: (project, args, { models }) => {
            return models.Payment.findAll({
                where: {
                    project_id: project.id
                }
            })
        },
        averageHourlyPaid: async (project, args, { models }) => {
            validateDatesFormat({
                fromDate: args.fromDate,
                toDate: args.toDate
            })
            const totalAllocatedMoney = await models.Allocation.sum(
                'amount',
                {
                    where: {
                        project_id: project.id,
                        date_paid: {
                            [Op.and]: [
                                { [Op.ne]: null },
                                { [Op.between]: [
                                    args.fromDate
                                        ? args.fromDate
                                        : moment.utc(1),
                                    args.toDate
                                        ? args.toDate
                                        : moment.utc()
                                ] }
                            ]
                        }
                    }
                }
            ) || 0
            const totalHours = await models.TimeEntry.sum(
                'seconds',
                {
                    where: {
                        project_id: project.id
                    }
                }
            ) / 3600

            //the averageHourlyPaid is returned in cents
            return parseInt(totalAllocatedMoney / totalHours, 10)
        },
        averageIssueCost: async (project, args, { models }) => {
            validateDatesFormat({
                fromDate: args.fromDate,
                toDate: args.toDate
            })
            const dateCondition = {
                [Op.between]: [
                    args.fromDate
                        ? args.fromDate
                        : moment.utc(1),
                    args.toDate
                        ? args.toDate
                        : moment.utc()
                ]
            }
            const totalPaidFromClient = await models.Payment.sum(
                'Payment.amount',
                {
                    where: {
                        date_paid: {
                            [Op.and]: [
                                { [Op.ne]: null },
                                dateCondition
                            ]
                        }
                    },
                    include: [
                        {
                            model: models.Allocation,
                            where: {
                                project_id: project.id
                            }
                        }
                    ],
                }
            ) || 0
            const totalPaidFromAllocation = await models.Allocation.sum(
                'amount',
                {
                    where: {
                        project_id: project.id,
                        date_paid: {
                            [Op.and]: [
                                { [Op.ne]: null },
                                dateCondition
                            ]
                        }
                    }
                }
            ) || 0
            const totalIssues = await models.Issue.count(
                {
                    where: {
                        project_id: project.id,
                        created_at: dateCondition,
                    }
                }
            ) || 0
            return {
                fromPayments: parseInt(totalPaidFromClient / totalIssues, 10),
                fromAllocations: parseInt(totalPaidFromAllocation / totalIssues, 10)
            }
        },
        client: (project, args, { models }) => {
            return models.Client.findByPk(project.client_id)
        },
        contributors: (project, args, { models }) => {
            return models.Contributor.findAll({
                include: [
                    {
                        model: models.Allocation,
                        where: {
                            project_id: project.id
                        }
                    }
                ]
            })
        },
        githubContributors: (project, args, { models }) => {
            return models.Contributor.findAll({
                where: { github_id: { [Op.ne]: null } },
                include: [
                    {
                        model: models.Allocation,
                        where: {
                            project_id: project.id
                        }
                    }
                ]
            })
        },
        issues: (project, args, { models }) => {
            return models.Issue.findAll({
                where: { project_id: project.id },
                limit: args.limit,
                offset: args.offset,
                order: [['date_opened', 'DESC']]
            })
        },
        permissions: (project, args, { models }) => {
            return models.Permission.findAll({
                where: {
                    project_id: project.id
                }
            })
        },
        githubIssuesOpened: async (project, args, { cookies, models }) => {
            validateDatesFormat({
                fromDate: args.fromDate,
                toDate: args.toDate
            })
            const authContributorKey = args.githubPersonalKey
                ? args.githubPersonalKey
                : (await models.Contributor.findByPk(cookies.userSession, { raw: true }))['github_access_token']
            const repoInformation = split(project.github_url, '/');
            const issues = await github.fetchRepoIssues({
                auth_key: authContributorKey,
                repo: repoInformation[repoInformation.length - 1],
                owner: repoInformation[repoInformation.length - 2]
            })
            let openIssues = 0
            issues.map((i, n) => {
                //check is the issue is not a pull request &&
                //check if is not closed &&
                // check the date ranges
                if (
                    i.pull_request == null &&
                        i.closed_at == null &&
                        moment(i.created_at).isAfter(args.fromDate
                            ? args.fromDate
                            : moment(1)) &&
                        moment(i.created_at).isBefore(args.toDate
                            ? args.toDate
                            : moment())
                ) {
                    openIssues += 1
                }
            })
            return openIssues
        },
        githubIssuesClosed: async (project, args, { cookies, models }) => {
            validateDatesFormat({
                fromDate: args.fromDate,
                toDate: args.toDate
            })
            const authContributorKey = args.githubPersonalKey
                ? args.githubPersonalKey
                : (await models.Contributor.findByPk(cookies.userSession, { raw: true }))['github_access_token']
            const repoInformation = split(project.github_url, '/');
            const issues = await github.fetchRepoIssues({
                auth_key: authContributorKey,
                repo: repoInformation[repoInformation.length - 1],
                owner: repoInformation[repoInformation.length - 2]
            })
            let closedIssues = 0
            issues.map((i, n) => {
                //check is the issue is not a pull request &&
                //check if is closed &&
                // check the date ranges
                if (
                    i.pull_request == null &&
                        i.closed_at &&
                        moment(i.closed_at).isAfter(args.fromDate
                            ? args.fromDate
                            : moment(1)) &&
                        moment(i.closed_at).isBefore(args.toDate
                            ? args.toDate
                            : moment())
                ) {
                    closedIssues += 1
                }
            })
            return closedIssues
        },
        githubPullRequestsClosed: async (project, args, { cookies, models }) => {
            validateDatesFormat({
                fromDate: args.fromDate,
                toDate: args.toDate
            })
            const contributor = await models.Contributor.findByPk(
                cookies.userSession
                    ? cookies.userSession
                    : args.contributorId
            )
            const repoInformation = split(project.github_url, '/');
            const pullRequests = await apiModules.dataSyncs.syncPullRequests({
                auth_key: contributor.github_access_token,
                github_url: project.github_url,
                repo: repoInformation[repoInformation.length - 1],
                owner: repoInformation[repoInformation.length - 2]
            })
            const closedPullRequests = []
            pullRequests.map(pr => {
                if (
                    moment(pr.closed_at).isAfter(args.fromDate
                        ? args.fromDate
                        : moment(1))
                    && moment(pr.closed_at).isBefore(args.toDate
                        ? args.toDate
                        : moment())
                    && !pr.merged_at
                ) {
                    closedPullRequests.push(pr)
                }
            })
            return closedPullRequests.length
        },
        githubPullRequestsOpened: async (project, args, { cookies, models }) => {
            validateDatesFormat({
                fromDate: args.fromDate,
                toDate: args.toDate
            })
            const contributor = await models.Contributor.findByPk(
                cookies.userSession
                    ? cookies.userSession
                    : args.contributorId
            )
            const repoInformation = split(project.github_url, '/');
            const pullRequests = await apiModules.dataSyncs.syncPullRequests({
                auth_key: contributor.github_access_token,
                github_url: project.github_url,
                repo: repoInformation[repoInformation.length - 1],
                owner: repoInformation[repoInformation.length - 2]
            })
            const openPullRequests = []
            pullRequests.map(pr => {
                if (!pr.closed_at) {
                    openPullRequests.push(pr)
                }
            })
            return openPullRequests.length
        },
        githubPullRequestsMerged: async (project, args, { cookies, models }) => {
            validateDatesFormat({
                fromDate: args.fromDate,
                toDate: args.toDate
            })
            const contributor = await models.Contributor.findByPk(
                cookies.userSession
                    ? cookies.userSession
                    : args.contributorId
            )
            const repoInformation = split(project.github_url, '/');
            const pullRequests = await apiModules.dataSyncs.syncPullRequests({
                auth_key: contributor.github_access_token,
                github_url: project.github_url,
                repo: repoInformation[repoInformation.length - 1],
                owner: repoInformation[repoInformation.length - 2]
            })
            const mergedPullRequest = []
            pullRequests.map(pr => {
                if (
                    moment(pr.merged_at).isAfter(args.fromDate
                        ? args.fromDate
                        : moment(1))
                    && moment(pr.merged_at).isBefore(args.toDate
                        ? args.toDate
                        : moment())
                ) {
                    mergedPullRequest.push(pr)
                }
            })
            return mergedPullRequest.length
        },
        timeEntries: (project, args, { models }) => {
            validateDatesFormat({
                fromDate: args.fromDate,
                toDate: args.toDate
            })
            return models.TimeEntry.findAll({
                where: {
                    project_id: project.id,
                    start_time: {
                        [Op.between]: [
                            args.fromDate
                                ? args.fromDate
                                : moment.utc(1).format('YYYY-MM-DD'),
                            args.toDate
                                ? args.toDate
                                : moment.utc().format('YYYY-MM-DD')
                        ]
                    },
                    contributor_id: args.contributor_id
                        ? args.contributor_id
                        : { [Op.ne]: null }
                }
            })
        },
        timeSpentPerContributor: (project, args, { models }) => {
            validateDatesFormat({
                fromDate: args.fromDate,
                toDate: args.toDate
            })
            //This query has as parameters fromDate and endDate,
            // if startDate is not passed we want to use moment.utc(1) that stands for startDate=Moment<1970-01-01T00:00:00Z>
            // if endDate is not passed then we will filter by moment.utc() that stands for the current date
            return models.TimeEntry.findAll(
                {
                    where: {
                        project_id: project.id,
                        start_time: {
                            [Op.between]: [
                                args.fromDate
                                    ? args.fromDate
                                    : moment.utc(1).format('YYYY-MM-DD'),
                                args.toDate
                                    ? args.toDate
                                    : moment.utc().format('YYYY-MM-DD')
                            ]
                        },
                    },
                    group: 'contributor_id',
                    attributes: ['contributor_id', [fn('sum', col('seconds')), 'seconds']]
                }
            )

        },
        issuesOpened: (project, args, { models }) => {
            validateDatesFormat({
                fromDate: args.fromDate,
                toDate: args.toDate
            })
            return models.Issue.count({
                where: {
                    'project_id': project.id,
                    'created_at': {
                        [Op.between]: [
                            args.fromDate
                                ? args.fromDate
                                : moment.utc(1).format('YYYY-MM-DD'),
                            args.toDate
                                ? args.toDate
                                : moment.utc().format('YYYY-MM-DD')
                        ]
                    }
                }
            })
        },
        timeSpent: (project, args, { models }) => {
            validateDatesFormat({
                fromDate: args.fromDate,
                toDate: args.toDate
            })
            const whereConditions = {
                project_id: project.id,
                start_time: {
                    [Op.between]:
                        [args.fromDate
                            ? args.fromDate
                            : moment.utc(1).format('YYYY-MM-DD'),
                        args.toDate
                            ? args.toDate
                            : moment.utc().format('YYYY-MM-DD')
                        ]
                }
            }
            if (args.contributor_id) {
                whereConditions.contributor_id = args.contributor_id
            }

            return models.TimeEntry.findOne({
                // The sum gets returned with the property name "seconds"
                attributes: [[fn('sum', col('seconds')), 'seconds']],
                where: whereConditions
            })
        },
        totalAllocated: async (project, args, { models }) => {
            validateDatesFormat({
                fromDate: args.fromDate,
                toDate: args.toDate
            })
            const whereConditions = {}
            whereConditions['project_id'] = project.id
            if (args.confirmedOnly) {
                whereConditions['payment_id'] = {
                    [Op.ne]: args.confirmedOnly && null
                }
            }
            if (args.fromDate || args.endDate) {
                whereCondition['date_paid'] = {
                    [Op.between]: [
                        args.fromDate
                            ? args.fromDate
                            : moment.utc(1),
                        args.toDate
                            ? args.toDate
                            : moment.utc()
                    ]
                }
            }
            const totalAllocated = await models.Allocation.findOne({
                attributes: [[fn('sum', col('amount')), 'amount']],
                raw: true,
                where: {
                    ...whereConditions
                }
            })
            return totalAllocated ? totalAllocated.amount : 0
        },
        totalIncurredPayments: async (project, args, { models }) => {
            const total = await models.Payment.findOne({
                attributes: [[fn('sum', col('amount')), 'totalIncurred']],
                where: {
                    date_paid: {
                        [Op.eq]: null
                    },
                },
                include: [
                    {
                        model: models.Allocation,
                        where: {
                            project_id: project.id
                        },
                        required: true
                    }
                ]
            })
            return total ? total.dataValues.totalIncurred : 0
        },
        totalPaid: async (project, args, { models }) => {
            validateDatesFormat({
                fromDate: args.fromDate,
                toDate: args.toDate
            })
            const total = await models.Payment.findOne({
                attributes: [[fn('sum', col('amount')), 'totalPaid']],
                
                where: {
                    project_id: project.id,
                    date_paid: {
                        [Op.and]: [
                            { [Op.ne]: null },
                            {
                                [Op.between]: [
                                    args.fromDate
                                        ? args.fromDate
                                        : moment.utc(1),
                                    args.toDate
                                        ? args.toDate
                                        : moment.utc()
                                ]
                            }
                        ]
                    },
                },
                include: args.allocationsOnly ? [
                    {
                        model: models.Allocation,
                        where: {
                            project_id: project.id
                        },
                        required: true
                    }
                ] : []
            })
            return total
                ? total.dataValues.totalPaid
                : 0
        }
    },
    TimeSpent: {
        contributor: (timeSpent, args, { models }) => {
            return models.Contributor.findOne(
                {
                    where: {
                        id: timeSpent.contributor_id
                    }
                }
            )
        }
    },
    Query: {
        getProjectById: (root, { id }, { models }) => {
            return models.Project.findByPk(id)
        },
        getProjects: (root, args, { models }) => {
            return models.Project.findAll()
        },
        getActiveProjects: (root, args, { models }) => {
            return models.Project.findAll({
                where: {
                    is_active: true,
                    client_id: {
                        [Op.is]: !null
                    }
                }
            })
        },
        getActiveProjectsCount: (root, args, { models }) => {
            const whereFields = {
                is_active: true,
                client_id: {
                    [Op.is]: !null
                }
            }
            if (args.clientId) whereFields.client_id = args.clientId
            return models.Project.count({
                where: {
                    ...whereFields
                }
            })
        },
        getInactiveProjects: (root, args, { models }) => {
            return models.Project.findAll({
                where: {
                    is_active: false
                }
            })
        },
        getInactiveProjectsCount: (root, args, { models }) => {
            const whereFields = {
                is_active: false
            }
            if (args.clientId) whereFields.client_id = args.clientId
            return models.Project.count({
                where: {
                    ...whereFields
                }
            })
        }
    },
    Mutation: {
        createProject: async (root, { createFields }, { models }) => {
            validateDatesFormat({
                date: createFields['date']
            })
            const projectToCreate = {
                ...createFields
            }
            if (createFields.toggl_url) {
                //get toggleId from togglUrl
                const togglArray = split(createFields.toggl_url, '/')
                const togglId = togglArray[togglArray.length - 1]
                projectToCreate['toggl_id'] = togglId
            }
            const projectAlreadyCreated = await models.Project.findOne({
                where: {
                    github_url: projectToCreate['github_url']
                }
            })
            if (projectAlreadyCreated) { throw new Error('Project already exists') }
            const newProject = await models.Project.create({
                ...projectToCreate
            })
            if (newProject.id) {
                //create owner permission to contributor who created the project
            }
            return newProject
        },
        deleteProjectById: (root, { id }, { models }) => {
            return models.Project.destroy({ where: { id } })
        },
        syncProjectGithubContributors: async (root, args, { models, cookies }) => {
            const authContributorToken = args.githubPersonalKey
                ? args.githubPersonalKey
                : (await models.Contributor.findByPk(cookies.userSession, { raw: true }))['github_access_token']
            const project = await models.Project.findByPk(args.project_id)
            const repo = split(project.github_url, '/')
            return dataSyncs.syncGithubRepoContributors({
                auth_key: authContributorToken,
                owner: repo[repo.length - 2],
                repo: repo[repo.length - 1]
            })
        },
        syncProjectPermissions: async (root, { project_id }, { models }) => {
            const project = await models.Project.findByPk(project_id)
            const projectContributors = await models.Contributor.findAll({
                raw: true,
                include: [
                    {
                        model: models.Allocation,
                        where: {
                            project_id: project.id
                        }
                    }
                ]
            })
            return dataSyncs.syncProjectCollaboratorsPermission({
                project_id: project_id,
                github_url: project.github_url,
                contributors: projectContributors
            })
        },
        syncProjectIssues: async (root, args, { cookies, models }) => {
            const project = await models.Project.findByPk(args.project_id)
            const contributor = await models.Contributor.findByPk(
                cookies.userSession
                    ? cookies.userSession
                    : args.contributor_id
            )
            const syncedIssues = await apiModules.dataSyncs.syncGithubIssues({
                project_id: args.project_id,
                github_url: project.github_url,
                auth_key: contributor.github_access_token
            })
            await models.Project.update({
                date_last_synced: moment.utc()
            }, {
                where: {
                    id: args.project_id
                }
            })
            return syncedIssues
        },
        syncTogglProject: async (root, args, { models }) => {
            let project = await models.Project.findByPk(args.project_id)
            if (args.toggl_url) {
                const { toggl_url } = args
                const togglPropertiesFromUrl = await apiModules.automations.getTogglPropertiesFromURL(toggl_url)
                const togglId = togglPropertiesFromUrl.togglId
                if (!TOGGL.API_KEY) {
                    return new ApolloError('You need to setup a Toggl API KEY on the .env file', 2001)
                }
                if (!togglId) {
                    return new ApolloError('You need to provide a toggl project id', 2001)
                } else if (togglId) {
                    //check if project exists
                    try {
                        await toggl.fetchProjectData({ projectId: togglId })
                    } catch (err) {
                        return new ApolloError(`The toggl_id ${togglId} project does not exists`, 2002)
                    }
                    //update toggl_id
                    await models.Project.update({
                        toggl_id: togglId
                    }, {
                        where: {
                            id: args.project_id
                        }
                    });
                    //get updated project
                    project = await models.Project.findByPk(args.project_id)
                }
                //search for the date of the last sync to fetch since that date
                const lastEntrySynced = await models.TimeEntry.findOne({
                    where: { project_id: args.project_id },
                    order: [['created_at', 'DESC']]
                })
                const dataSync = await apiModules.dataSyncs.syncTogglProject({
                    toggl_project_id: project.toggl_id,
                    workspaceId: togglPropertiesFromUrl.workspaceId,
                    project_id: project.id,
                    since: lastEntrySynced
                        ? lastEntrySynced.created_at
                        : moment().subtract(1, 'y').format('YYYY-MM-DD'),
                    until: moment().format(),
                    page: 1
                })
                if (dataSync) {
                    return project
                } else {
                    return new ApolloError('Something wrong happened', 2003)
                }
            }
        },
        updateProjectById: async (root, { id, updateFields }, { models }) => {
            validateDatesFormat({
                date: updateFields['date']
            })
            if (updateFields.toggl_url) {
                const togglValuesFromUrl = await apiModules.automations.getTogglPropertiesFromURL(updateFields.toggl_url)
                const togglId = togglValuesFromUrl.togglId
                updateFields['toggl_id'] = togglId
            }
            await models.Project.update({
                ...updateFields
            }, {
                where: {
                    id
                }
            })
            return models.Project.findByPk(id)
        }
    }

}
