const moment = require('moment')
const { fn, col, Op } = require('sequelize')

const { validateDatesFormat } = require('../helpers/inputValidation')
const stripe = require('../../handlers/stripe')
const apiModules = require('../../modules')

module.exports = {

    Client: {
        payments: (client, args, { models }) => {
            return models.Payment.findAll({ where: { client_id: client.id } })
        },
        projects: (client, args, { models }) => {
            return models.Project.findAll({ where: { client_id: client.id } })
        },
        totalPaid: async (client, args, { models }) => {
            //MARK: Review if validateDatesFormat({ ...args }) is the best solution, consider if we pass more attributes non date this will break
            validateDatesFormat({ ...args })
            const totalPaid = await models.Payment.findOne({
                raw: true,
                attributes: [[fn('sum', col('amount')), 'total']],
                where: {
                    client_id: client.id,
                    date_incurred: { [Op.between]: [
                        args.fromDate
                            ? args.fromDate
                            : moment.utc(1),
                        args.toDate
                            ? args.toDate
                            : moment.utc()
                    ] }
                }
            })
            return totalPaid.total
        }
    },
    Query: {
        getClientById: (root, { id }, { models }) => {
            return models.Client.findByPk(id)
        },
        getClients: (root, args, { models }) => {
            return models.Client.findAll()
        },
        getActiveClients: (root, args, { models }) => {
            return models.Client.findAll( {
                where: {
                    is_active: true
                }
            })
        },
        getInactiveClients: (root, args, { models }) => {
            return models.Client.findAll( {
                where: {
                    is_active: false
                }
            })
        },
        getActiveClientsCount: (root, args, { models }) => {
            return models.Client.count({
                where: {
                    is_active: true
                }
            })
        },
        getInactiveClientsCount: (root, args, { models }) => {
            return models.Client.count({
                where: {
                    is_active: false
                }
            })
        }
    },
    Mutation: {
        createClient: async (root, { createFields }, { cookies, models }) => {
            try {
                if (!cookies.userSession || createFields.contributor_id) {
                    throw new Error('A contributor id is required');
                }
                const newlyCreatedClient = await models.Client.create({
                    ...createFields
                })
                const contributor = (
                    await models.Contributor.findByPk(
                        cookies ? cookies.userSession : createFields.contributor_id
                    )
                )
                //Grant write access to the contributor that created the client
                const permissionAttributes = {
                    type: 'write',
                    contributor_id: contributor.id,
                    client_id: newlyCreatedClient.id
                }
                await models.Permission.create({
                    ...permissionAttributes
                })
                return newlyCreatedClient
            } catch (error) {
                console.log('An error ocurred: ' + error);
            }

        },
        deleteClientById: (root, { id }, { models }) => {
            return models.Client.destroy({ where: { id } })
        },
        updateClientById: async (root, { id, updateFields }, { models }) => {
            await models.Client.update({
                ...updateFields
            }, {
                where: {
                    id
                }
            })
            await stripe.pushUpdatedClient({ updateFields })
            return models.Client.findByPk(id)
        }
    }
}
