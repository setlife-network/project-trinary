const { split } = require('lodash')

const authentication = require('./authentication')
const amazon = require('../handlers/amazon')
const github = require('../handlers/github')
const toggl = require('../handlers/toggl')
const db = require('../models')
const invoicelyCodebase = require('../scripts/invoicelyCodebase')
const timeLogging = require('../scripts/timeLogging')
const { INVOICELY_CSV_PATH } = require('../config/constants')
const { GITHUB, TOGGL } = require('../config/credentials')

const dataSyncs = module.exports = (() => {

    const findIssueByGithubUrl = async (url) => {
        return db.models.Issue.findOne({
            raw: true,
            where: {
                github_url: url
            }
        })
    }

    const syncGithubRepoContributors = async (params) => {
        //this func will add in the contributors table all the contributors from a github project
        const newContributors = []
        const githubContributors = await github.fetchRepoContributors({
            auth_key: params.auth_key,
            repo: params.repo,
            owner: params.owner
        })
        await Promise.all(
            await githubContributors.map(async c => {
                //we look for mathing contributors in our db, if there's none add them
                const matchingContributor = await db.models.Contributor.findOne({
                    where: {
                        github_id: c['id']
                    }
                })
                if (!matchingContributor) {
                    const contributorInfo = await github.fetchUserData({
                        auth_key: params.auth_key,
                        username: c.login
                    })
                    newContributors.push(
                        await db.models.Contributor.create({
                            name: contributorInfo.name ? contributorInfo.name : c.login,
                            github_id: c.id,
                            github_handle: c.html_url
                        })
                    )
                }
            })
        )
        return newContributors
    }

    const syncGithubIssues = async (params) => {
        const newIssues = []
        const repoInformation = split(params.github_url, '/')
        const issues = []
        try {
            const githubIssues = await github.fetchRepoIssues({
                auth_key: params.auth_key,
                owner: repoInformation[repoInformation.length - 2],
                repo: repoInformation[repoInformation.length - 1]
            })
            githubIssues.map(i => {
                if (!i.pull_request) {
                    issues.push(i)
                }
            })
        } catch (error) {
            console.log('error: ' + error);
        }
        await Promise.all(
            issues.map(async i => {
                const matchingIssue = await findIssueByGithubUrl(i.html_url)
                if (!matchingIssue) {
                    await db.models.Issue.create({
                        github_url: i.html_url,
                        github_number: i.number,
                        name: i.title,
                        date_opened: i.created_at,
                        date_closed: i.closed_at,
                        project_id: params.project_id
                    })
                        .then((createdIssue) => {
                            newIssues.push(createdIssue.get({ plain: true }))
                        })
                } else if (matchingIssue.date_closed != i.date_closed) {
                    await db.models.Issue.update({
                        date_closed: matchingIssue.date_closed
                    }, {
                        where: {
                            id: i.id
                        }
                    })
                }
            })
        )
        return newIssues
    }

    const syncInvoicelyCSV = async () => {
        const invoiceFile = INVOICELY_CSV_PATH
        return (
            amazon.fetchFile({ file: invoiceFile })
                .then(file => {
                    invoicelyCodebase.modelCSV(file)
                    return 'Success'
                })
                .catch(err => {
                    console.log('error', err);
                    return err.message
                })
        )
    }

    const syncProjectCollaboratorsPermission = async (params) => {
        const syncedPermissions = []
        await Promise.all(
            params.contributors.map(async c => {
                const urlInfo = params.github_url.split('/')
                const owner = urlInfo[urlInfo.length - 2]
                const repo = urlInfo[urlInfo.length - 1]
                const dbContributorPermission = await db.models.Permission.findOne({
                    raw: true,
                    where: {
                        project_id: params.project_id,
                        contributor_id: c.id
                    }
                })
                const githubContributorPermission = await github.fetchUserPermission({
                    auth_key: GITHUB.OAUTH_CLIENT_SECRET,
                    owner,
                    repo,
                    username: c.github_handle
                })
                //if the permission it's not already stored save it into the db
                //if is stored and the permission value it's not the same update it
                //if not don't do anything
                if (!dbContributorPermission) {
                    return syncedPermissions.push(
                        db.models.Permission.create({
                            type: githubContributorPermission,
                            contributor_id: c.id,
                            project_id: params.project_id
                        })
                    )
                } else if (dbContributorPermission.type != githubContributorPermission) {
                    syncedPermissions.push(dbContributorPermission)
                    return db.models.Permission.update({
                        type: githubContributorPermission,
                    }, {
                        where: {
                            contributor_id: c.id,
                            project_id: params.project_id
                        }
                    })
                }
            })
        )
        return syncedPermissions
    }

    const syncPullRequests = async (params) => {
        const pullRequests = []
        const repoInformation = split(params.github_url, '/')
        try {
            const issues = await github.fetchRepoIssues({
                auth_key: params.auth_key,
                owner: repoInformation[repoInformation.length - 2],
                repo: repoInformation[repoInformation.length - 1]
            })
            issues.map(i => {
                if (i.pull_request) {
                    pullRequests.push(i)
                }
            })
        } catch (error) {
            console.log('error: ' + error);
        }
        return pullRequests
    }

    const syncTogglProject = async (params) => {
        try {
            const timeEntries = await toggl.fetchWorkspaceTimeEntries({
                pId: params.toggl_project_id,
                wId: params.workspaceId,
                since: params.since,
                until: params.until
            })
            const addedTimeEntries = await timeLogging.addTimeEntries({
                timeEntries,
                project_id: params.project_id
            })
        } catch (error) {
            console.log('error: ' + error)
            return
        }
        return true
    }

    return {
        syncGithubRepoContributors,
        syncGithubIssues,
        syncInvoicelyCSV,
        syncProjectCollaboratorsPermission,
        syncPullRequests,
        syncTogglProject
    }
})()
