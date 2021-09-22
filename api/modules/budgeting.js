const moment = require('moment')
const { DEFAULT_STRIPE_CURRENCY } = require('../config/constants')

const budgeting = module.exports = (() => {
    const db = require('../models')
    const clientManagement = require('./clientManagement')

    const checkForMismatchedClientPayments = async (params) => {
        const existingPayments = await getPaymentsWithClientId({ client_id: params.client.id })
        
        if (existingPayments) {
            existingPayments.forEach(async payment => {

                if (params.client.currency !== params.stripeInvoiceCurrency) {
                    try {
                        const disconnectedCustomer = await clientManagement.deleteClientUuid({ id: params.client.external_uuid })
                        console.log(`stripe customer disconnected ${disconnectedCustomer.email}`)
                    } catch (err) {
                        console.log(`An error ocurred: ${err}`)
                    }
                }
            })
        }
    }

    const createPaymentFromStripeInvoice = async ({ stripeInvoice }) => {
        const client = await clientManagement.findClientWithExternalId({
            id: stripeInvoice.customer
        })

        if (client) {
            const dateIncurredOverride = stripeInvoice.metadata?.date_incurred
                ? moment(stripeInvoice.metadata.date_incurred, 'YYYY-MM-DD')
                : moment(stripeInvoice.created, 'X')

            const datePaidOverride = stripeInvoice.metadata?.date_paid
                ? moment(stripeInvoice.metadata.date_paid, 'YYYY-MM-DD')
                : null

            return db.models.Payment.create({
                amount: stripeInvoice.total,
                date_incurred: dateIncurredOverride,
                date_paid: datePaidOverride,
                client_id: client.id,
                external_uuid: stripeInvoice.id,
                external_uuid_type: 'STRIPE'
            })
        }
    }

    const deletePaymentByStripeInvoiceId = (params) => {
        let deletedPayment
        try {
            deletedPayment = db.models.Payment.destroy({
                where: {
                    external_uuid: params.invoiceId
                }
            })
        } catch {
            throw 'Failed deleting from database'
        }
        return deletedPayment
    }

    const getPaymentsWithClientId = (params) => {
        return db.models.Payment.findAll({
            where: {
                client_id: params.client_id
            }
        })
    }

    const getPaymentWithExternalId = (params) => {
        return db.models.Payment.findOne({
            where: {
                external_uuid: params.id
            },
            raw: true,
        })
    }

    const getPaymentWithId = (params) => {
        return db.models.Payment.findByPk(params.id, {
            raw: true
        })
    }

    const processPaymentFromStripeInvoice = async ({ stripeInvoice }) => {
        const paymentToUpdate = await db.models.Payment.findOne({
            where: {
                external_uuid: stripeInvoice.id,
                external_uuid_type: 'STRIPE'
            }
        })
        const client = await clientManagement.findClientWithExternalId({
            id: stripeInvoice.customer
        })

        try {
            const paymentsDoNotMatch = await checkForMismatchedClientPayments({ client: client, stripeInvoiceCurrency: stripeInvoice.currency })
            client.currency = stripeInvoice.currency.toUpperCase()
            await client.save()
        } catch (err) {
            console.log(`error while changing client currency: ${err}`)
        }

        if (paymentToUpdate) {
            const datePaidOverride = stripeInvoice.metadata.date_paid || null
            const dateIncurredOverride = stripeInvoice.metadata.date_incurred || null

            if (datePaidOverride || dateIncurredOverride) {
                updatePaymentFromStripeInvoice({ stripeInvoice })
            }
        } else {
            //the payment is not in the db, proceed to store it
            createPaymentFromStripeInvoice({
                stripeInvoice
            })
        }
    }

    const updatePaymentFromStripeInvoice = async ({ stripeInvoice }) => {
        const existingPayment = await getPaymentWithExternalId({ id: stripeInvoice.id })

        if (existingPayment) {
            const updatedAttributes = {}
            const datePaidOverride = stripeInvoice.metadata?.date_paid || null
            const dateIncurredOverride = stripeInvoice.metadata?.date_incurred || null

            // Updates the date paid if the override metadata is detected
            // but if not and the invoice has been paid, set date_paid to the
            // webhook delivery timestamp if and only if date_paid has not yet
            // been set
            if (datePaidOverride) {
                updatedAttributes.date_paid = datePaidOverride
            } else if (
                stripeInvoice.paid == true &&
                existingPayment.date_paid == null
            ) {
                updatedAttributes.date_paid = moment(stripeInvoice.webhooks_delivered_at, 'X').format('YYYY-MM-DD')
            }

            if (dateIncurredOverride) {
                updatedAttributes.date_incurred = dateIncurredOverride
            }

            await db.models.Payment.update({
                ...updatedAttributes
            }, {
                where: {
                    id: existingPayment.id
                }
            })
        }
    }
    
    return {
        createPaymentFromStripeInvoice,
        deletePaymentByStripeInvoiceId,
        getPaymentWithId,
        getPaymentWithExternalId,
        processPaymentFromStripeInvoice,
        updatePaymentFromStripeInvoice,
    }
})()
