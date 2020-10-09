const express = require('express')
const bodyParser = require('body-parser') //transform req into JSON format
const fs = require('fs') //module to read files
const cors = require('cors') //handle CORS issues
const { ApolloServer } = require('apollo-server') //Apollo server for graphql integration
const schema = require('./api/schema')

const db = require('./api/models');

const app = express()

var isProduction = process.env.NODE_ENV === 'production';
var port = isProduction ? process.env.PORT : 6001;

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

var whitelist = [
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:4000',
    'https://project-trinary.herokuapp.com/'
];

var corsOptions = {
    origin: function(origin, callback) {
        var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        callback(null, originIsWhitelisted);
    },
    credentials: true,
    methods: ['GET,PUT,POST,DELETE,OPTIONS'],
    allowedHeaders: ['Access-Control-Allow-Headers', 'Origin', 'Access-Control-Allow-Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Cache-Control']
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.get('/api/v/:vid/ping', (req, res) => {
    res.send('Hello World')
})

app.get('/api/fetcPayments', (req, res) => {
    const invoices = fs.readdirSync('./docs/invoicely/invoices/', 'utf-8')
    const payments = fs.readdirSync('./docs/invoicely/payments/', 'utf - 8')

    //TODO: map invoices and payments and call invoicely script with each file path

    res.send(file)
})

const server = new ApolloServer({
    schema,
    context: db
})

server.listen(port, () => {
    console.log(`Trinary project app listening at http://localhost:${port}`)
})
