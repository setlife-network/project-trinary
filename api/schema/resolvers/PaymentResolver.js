const { UserInputError } = require('apollo-server');
const moment = require('moment')
const { fn, col, Op } = require('sequelize')

const { validateDatesFormat } = require('../helpers/inputValidation')
const apiModules = require('../../modules')
const { DEFAULT_STRIPE_CURRENCY, STRIPE_SUPPORTED_CURRENCIES } = require('../../config/constants')

module.exports = {

    Payment: {
        allocations: (payment, args, { models }) => {
            return models.Allocation.findAll({
                where: {
                    payment_id: payment.id
                }
            })
        },
        client: (payment, args, { models }) => {
            return models.Client.findByPk(payment.client_id)
        },
        totalAllocated: async (payment, args, { models }) => {
            const allocations = await models.Allocation.findAll({
                attributes: [
                    'amount',
                    [fn('sum', col('amount')), 'total_amount'],
                ],
                where: {
                    payment_id: payment.id
                },
                raw: true
            })
            return allocations[0].total_amount
        }
    },
    Query: {
        getPaymentById: (root, { id }, { models }) => {
            return models.Payment.findByPk(id)
        },
        getPayments: (root, args, { models }) => {
            return models.Payment.findAll()
        },
        getClientPaymentsByClientId: (root, { clientId }, { models }) => {
            return models.Payment.findAll({ where: { client_id: clientId } })
        }
    },
    Mutation: {
        createPayment: async (root, { createFields }, { models }) => {
            validateDatesFormat({
                date_incurred: createFields['date_incurred'],
                date_paid: createFields['date_paid']
            })
            const client = await models.Client.findOne({
                where: {
                    id: createFields['client_id']
                }
            })

            // Check if the client has an associated Stripe account and if the currency is supported
            // If it does, proceed to create the invoice on Stripe
            if (client.external_uuid && STRIPE_SUPPORTED_CURRENCIES.includes(client.currency)) {
                const stripeInvoice = await apiModules.paymentManagement.processStripeInvoiceWithPayment({
                    amount: createFields['amount'],
                    clientId: client.id,
                    currency: client.currency,
                    date_paid: createFields['date_paid']
                })
                createFields['external_uuid'] = stripeInvoice.id
            }
            return models.Payment.create({
                ...createFields
            })
        },
        deletePaymentById: (root, { id }, { models }) => {
            return models.Payment.destroy({ where: { id } })
        },
        syncPayments: async (root, { source }, { models }) => {
            if (source.toUpperCase() == 'INVOICELY') {
                return apiModules.dataSyncs.syncInvoicelyCSV()
            } else {
                throw new UserInputError(`There's not source that matchs the input`)
            }
        },
        updatePaymentById: async (root, { id, updateFields }, { models }) => {
            validateDatesFormat({
                date_incurred: updateFields['date_incurred'],
                date_paid: updateFields['date_paid']
            })
            await models.Payment.update({
                ...updateFields
            }, {
                where: {
                    id
                }
            })
            return models.Payment.findByPk(id)
        }
    }

}
