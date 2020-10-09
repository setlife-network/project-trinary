const fs = require('fs')
const moment = require('moment')

const db = require('../models')

const { slice, indexOf, split, join, replace } = require('lodash')

module.exports = (() => {
    modelCSV = async (data) => {

        //deletes all the quotes in the file
        const quotes = data[0] == '"'
        var keysLine = data.slice(0, data.indexOf('\n'))
        keysLine = (
            quotes
                ? keysLine.slice(1, keysLine.length - 1)
                : keysLine.slice(0, keysLine.length - 1)
        )
        keysLine = (
            quotes
                ? split(keysLine, '","')
                : split(keysLine, ',')
        )
        //create an array with each line of data of the file
        dataLines = split(data, '\n')
        dataLines.shift()
        //create subarrays with each piece of data of each line
        dataLines.map((d, i) => {
            d = d.slice(1, d.length - 1);
            dataLines[i] = (
                quotes
                    ? split(d, '","')
                    : split(d, ','))
        })
        //create objects with each data line
        var dataObject = []
        dataLines.map((d, di) => {
            object = {}
            keysLine.map((k, ki) => {
                if (d[ki] != null && d[ki] != '') object[k] = d[ki]
            })
            if (Object.keys(object).length) dataObject.push(object)
        })
        //Iterate object collection and create the data object into the db
        dataObject.map( async d => {

            //Look for the id of the client based on the name
            //TODO: Consider make the name of the client in the DB Unique
            const matchClients = await db.models.Client.findAll({ where: {
                name: d['Client']
            } })
            if (matchClients[0]) {
                const total = (
                    !quotes && d['Payments'][0] == '"'
                        ? (
                            d['Payments'].slice(1, d['Payments'].length).concat(split(d['Total'], '.', 1)[0])
                        )
                        : null
                )

                await db.models.Payment.create({
                    amount: total ? total : parseFloat(d['Total'].split(',').join('')),
                    date_incurred: moment.utc(d['Date Issued'], 'MMM D YYYY'),
                    date_paid: d['Date Paid'] ? moment.utc(d['Date Paid'], 'MMM D YYYY') : null,
                    client_id: matchClients[0].id
                })
            }

        })
        return dataObject
    }

    return {
        modelCSV
    }

})();
