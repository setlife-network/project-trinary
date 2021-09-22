const express = require('express')
const bodyParser = require('body-parser') //transform req into JSON format
const fs = require('fs') //module to read files
const cors = require('cors') //handle CORS issues
const { ApolloServer } = require('apollo-server-express') //Apollo server for graphql integration
const cookieSession = require('cookie-session') //store the user session key
const cookieParser = require('cookie-parser') //transform cooki session into object with key name
const moment = require('moment') //momentjs libreary for expitation cookie date
const { findIndex } = require('lodash')

const schema = require('./api/schema')
const db = require('./api/models');
const apiModules = require('./api/modules');
const github = require('./api/handlers/github')

const { GITHUB } = require('./api/config/credentials')
const { SITE_ROOT } = require('./api/config/constants')

const app = express()

const isProduction = process.env.NODE_ENV === 'production';
const port = isProduction ? process.env.PORT : 6001;

// Serve static assets
app.use(express.static(__dirname + '/build'));

app.get('*', function(req, res, next) {
    if (req.path.indexOf('/api/') != -1) {
        //route to the next middleware function
        return next()
    }
    fs.readFile(__dirname + '/build/index.html', 'utf8', function (err, text) {
        res.send(text);
    });
})

const whitelist = [
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:4000',
    'http://localhost:6001',
    'http://localhost:6002',
    'http://github.com/',
    'https://github.com/',
    'https://project-trinary.herokuapp.com/',
    'https://trinary.setlife.tech',
    'https://trinary-staging.herokuapp.com'
];
const corsOptions = {
    origin: function(origin, callback) {
        const originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        callback(null, originIsWhitelisted);
    },
    credentials: true,
    methods: ['GET,PUT,POST,DELETE,OPTIONS'],
    allowedHeaders: ['Access-Control-Allow-Headers', 'Origin', 'Access-Control-Allow-Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Cache-Control']
}

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser())
app.use(cookieSession({
    name: 'session',
    keys: ['userSession'],
    expires: moment().add(180, 'days').toDate()
}))
app.use('/api/graph/v/:vid', express.json(), (req, res, next) => {
    console.log(`Incoming API v${req.params.vid} request on worker PID ${process.pid}`)
    next()
})

app.get('/api/login', (req, res) => {
    res.redirect(`https://github.com/login/oauth/authorize?client_id=${GITHUB.OAUTH_CLIENT_ID}&scope=repo`)
})
app.get('/api/oauth-redirect', (req, res) => { //redirects to the url configured in the Github App
    github.fetchAccessToken({ code: req.query.code })
        .then(async githubAccessToken => {
            const contributorInfo = await apiModules.authentication.getContributor({ githubAccessToken })
            contributorInfo.githubContributor['accessToken'] = githubAccessToken
            return contributorInfo
        })
        .then(async (contributorInfo) => {
            //if it's a new user store it in contributors table
            //if the user is already in th db but 1st time loggin in store the github access token
            if (!contributorInfo.contributor) {
                contributorInfo.contributor = await apiModules.authentication.createContributor({ ...contributorInfo.githubContributor })
            } else if (!contributorInfo.contributor['github_access_token']) {
                contributorInfo.contributor = await apiModules.authentication.updateGithubAccessTokenContributor({ ...contributorInfo.githubContributor })
            }
            //store contributor id in the cookie session
            req.session.userSession = contributorInfo.contributor.id
            return contributorInfo
        })
        .then((contributorInfo) => {
            //sync the permissions for the contributor
            apiModules.authentication.grantProjectPermissions({
                contributor: contributorInfo.contributor.dataValues
            })
        })
        .then(() => {
            res.redirect(SITE_ROOT)
        })
        .catch(err => {
            console.log('An error ocurred ' + err);
        })
})

app.post('/api/webhooks/invoice/paid', async (req, res) => {
    const invoiceObjectPayload = req.body.data.object
    try {
        await apiModules.budgeting.updatePaymentFromStripeInvoice({
            stripeInvoice: invoiceObjectPayload
        })
        res.send('payment updated')
    } catch (err) {
        console.log(`An error ocurred: ${err}`)
    }
})

app.post('/api/webhooks/invoice/updated', async (req, res) => {
    const invoiceObjectPayload = req.body.data.object
    //1. see if payment is ready to allocate, if not do nothing
    if (
        invoiceObjectPayload.metadata &&
        invoiceObjectPayload.metadata.ready_to_allocate
    ) {
        try {
            await apiModules.budgeting.processPaymentFromStripeInvoice({
                stripeInvoice: invoiceObjectPayload
            })
            res.send('Payment created from invoice')
        } catch (err) {
            console.log(`An error ocurred: ${err}`)
            res.send(`An error ocurred: ${err}`);
        }
    } else {
        res.send('payment not ready to allocate')
    }
})

app.post('/api/webhooks/invoice/delete', async (req, res) => {
    const invoiceId = req.body.data.object.id
    try {
        await apiModules.budgeting.deletePaymentByStripeInvoiceId({ invoiceId })
        res.sendStatus(200)
    } catch (err) {
        console.log(`An error ocurred: ${err}`)
    }
})

app.post('/api/webhooks/clients', async (req, res, next) => {
    const webhookPayload = req.body
    const stripeCustomerObject = webhookPayload.data.object
    const webhookType = webhookPayload.type
    if (webhookType === 'customer.created') {
        try {
            await apiModules.clientManagement.createClientFromStripeCustomer({
                stripeCustomerObject
            })
            res.sendStatus(200)
        } catch (err) {
            console.log(`An error ocurred: ${err}`)
        }
    } else if (webhookType === 'customer.updated' ) {
        try {
            await apiModules.clientManagement.updateClientFromStripeCustomer({ stripeCustomerObject })
            res.sendStatus(200)
        } catch (err) {
            console.log(`An error ocurred: ${err}`)
        }
    }
})

app.post('/api/webhooks/customer/delete', async (req, res) => {
    const stripeCustomerObject = req.body.data.object
    try {
        await apiModules.clientManagement.deleteClientUuid( { stripeCustomerObject } )
        res.sendStatus(200)
    } catch (err) {
        console.log(`An error ocurred: ${err}`)
    }
})

const server = new ApolloServer({
    schema,
    context: ({ req }) => ({
        ...db,
        cookies: req.session
    }),
    introspection: true,
    playground: {
        settings: {
            'editor.theme': 'dark',
            'request.credentials': 'include',
        },
    },
})

server.applyMiddleware({
    app,
    path: ['/api/graph/v/:vid', '/api/graph'],
    cors: corsOptions
});

app.listen(port, () => {
    console.log(`Trinary project app listening at http://localhost:${port}`)
})
