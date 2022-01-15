const { split } = require('lodash')

const { 
    findIssueByGithubUrl, 
    findContributorByGithubHandle, 
    findContributionByGithubUrlAndHandle 
} = require('./projectManagement')
const amazon = require('../handlers/amazon')
const github = require('../handlers/github')
const toggl = require('../handlers/toggl')
const stripe = require('../handlers/stripe')
const db = require('../models')
const invoicelyCodebase = require('../scripts/invoicelyCodebase')
const timeLogging = require('../scripts/timeLogging')
const { INVOICELY_CSV_PATH } = require('../config/constants')
const { GITHUB } = require('../config/credentials')

const dataSyncs = module.exports = (() => {

    const syncContributions = async (params) => {
        const matchingContribution = await findContributionByGithubUrlAndHandle({
            url: params.github_url, 
            handle: params.handler_url
        })
        if (!matchingContribution) {
            const matchingContributor = await findContributorByGithubHandle(params.handler_url)
            if (matchingContributor) {
                await db.models.Contribution.create({
                    contributor_id: matchingContributor.id,
                    issue_id: params.matchingIssue.id,
                    is_author: params.author,
                    is_assigned: params.assignee,
                    date_contributed: params.createdAt
                })
            }
        }
    }

    const importInvoicelyCsvToStripe = async () => {
        const invoiceFile = INVOICELY_CSV_PATH
        try {
            const csvFile = await amazon.fetchFile({ file: invoiceFile })
            const modeledCsv = await invoicelyCodebase.modelCSV(csvFile)

            const stripeCustomers = await stripe.listAllCustomers()
            const customersFromCsv = []

            modeledCsv.map(async csvData => {
                let customerInformation
                const customer = stripeCustomers.data.find(customerData => customerData.name == csvData.Client)
                csvData.Total = csvData.Total.replace(/,/g, '')
                const amount = Number((Number(csvData.Total) * 100).toFixed(0))
                if (customer) {
                    customerInformation = customer
                } else if (!customersFromCsv.includes(csvData.Client)) {
                    customersFromCsv.push(csvData.Client)
                    customerInformation = await stripe.createCustomer({ name: csvData.Client, email: null })
                }
                await stripe.createInvoice({
                    amount: amount,
                    external_uuid: customerInformation.id,
                    actualCurrency: csvData.Currency
                })
            })
        } catch (err) {
            console.log('an error ocurred: ', err)
            return 'Something failed'
        }
        return 'Import completed'
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
                if (i.user) {
                    await syncContributions({
                        github_url: i.html_url,
                        handler_url: i.user.html_url,
                        author: 1,
                        assignee: 0,
                        matchingIssue: matchingIssue,
                        createdAt: i.created_at
                    })
                }
                if (i.assignee) {
                    await syncContributions({
                        github_url: i.html_url,
                        handler_url: i.assignee.html_url,
                        author: 0,
                        assignee: 1,
                        matchingIssue: matchingIssue,
                        createdAt: i.created_at
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
            const fetchedPRs = await github.fetchPullRequests({
                auth_key: params.auth_key,
                owner: repoInformation[repoInformation.length - 2],
                repo: repoInformation[repoInformation.length - 1]
            })
            fetchedPRs.map(i => {
                pullRequests.push(i)
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
                until: params.until,
                page: params.page
            })
            const addedTimeEntries = await timeLogging.addTimeEntries({
                timeEntries,
                project_id: params.project_id
            })
            if (timeEntries.length >= 50) {
                params.page += 1
                await syncTogglProject(params)
            }
        } catch (error) {
            console.log('error: ' + error)
            return
        }
        return true
    }

    return {
        importInvoicelyCsvToStripe,
        syncGithubRepoContributors,
        syncGithubIssues,
        syncInvoicelyCSV,
        syncProjectCollaboratorsPermission,
        syncPullRequests,
        syncTogglProject
    }
})()
