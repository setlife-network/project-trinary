const db = require('../models')
const { DEFAULT_STRIPE_CURRENCY } = require('../config/constants')
const paymentManagement = module.exports = (() => {

    const processStripeInvoiceWithPayment = async (params) => {
        const stripe = require('../handlers/stripe')
        const {
            amount,
            clientId,
            currency,
            date_paid
        } = params
        
        const actualCurrency = 
            currency == DEFAULT_STRIPE_CURRENCY
                ? currency
                : DEFAULT_STRIPE_CURRENCY

        const createdInvoice = await stripe.createInvoice({
            clientId,
            amount,
            actualCurrency
        })

        if (date_paid) {
            return stripe.finalizeInvoice({ invoice: createdInvoice })
        }

        return createdInvoice
    }

    return {
        processStripeInvoiceWithPayment
    }
})()
