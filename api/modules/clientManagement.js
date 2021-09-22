const clientManagement = module.exports = (() => {
    const db = require('../models')

    const createClientFromStripeCustomer = async (params) => {
        const { stripeCustomerObject } = params

        const clientInformation = {
            email: stripeCustomerObject.email,
            currency: stripeCustomerObject.currency
                ? stripeCustomerObject.currency.toUpperCase()
                : 'SATS',
            name: stripeCustomerObject.name,
            external_uuid: stripeCustomerObject.id,
            is_active: 1
        }

        // Do not create the Client if the email already exists
        let client = await db.models.Client.findOne({
            where: {
                email: clientInformation.email
            }
        })

        if (client == null) {
            client = await createClient({
                createFields: clientInformation
            })
        } else if (client.external_uuid == null) {
            client.external_uuid = clientInformation.external_uuid
            await client.save()
        }

        return client
    }

    const createClient = async (params) => {
        try {
            const { createFields } = params

            const createdClient = await db.models.Client.create({
                ...createFields
            })
            
            return createdClient
        } catch (error) {
            console.log('An error ocurred: ' + error);
        }
    }

    const deleteClientUuid = async (params) => {
        const client = await findClientWithExternalId(params)

        if (client) {
            client.external_uuid = null
            await client.save()
        }
        return client
    }

    const findClientWithEmail = async (params) => {
        return db.models.Client.findOne({
            where: {
                email: params.email
            }
        })
    }

    const findClientWithId = async (clientId) => {
        return db.models.Client.findByPk(clientId)
    }

    const findClientWithExternalId = (params) => {
        return db.models.Client.findOne({
            where: {
                external_uuid: params.id
            }
        })
    }

    const updateClientFromStripeCustomer = async ({ stripeCustomerObject }) => {
        const clientInformation = {
            email: stripeCustomerObject.email,
            name: stripeCustomerObject.name,
            date_created: stripeCustomerObject.created,
            external_uuid: stripeCustomerObject.id,
            is_active: 1
        }

        const {
            email,
            name,
            external_uuid
        } = clientInformation

        let clientToUpdate

        if (clientInformation.external_uuid) {
            clientToUpdate = await db.models.Client.findOne({
                where: {
                    external_uuid
                }
            })
        }
        if (clientInformation.email && (clientToUpdate === null)) {
            clientToUpdate = await db.models.Client.findOne({
                where: {
                    email
                }
            })
        }

        if (clientToUpdate) {
            clientToUpdate.email = email
            clientToUpdate.name = name
            clientToUpdate.external_uuid = external_uuid
            await clientToUpdate.save()
        } else {
            createClientFromStripeCustomer({
                stripeCustomerObject
            })
        }
    }

    return {
        createClient,
        createClientFromStripeCustomer,
        deleteClientUuid,
        findClientWithEmail,
        findClientWithExternalId,
        findClientWithId,
        updateClientFromStripeCustomer
    }
})()
