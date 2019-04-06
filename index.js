const express = require('express')
const helmet = require('helmet')

const app = express()

// add some security-related headers to the response
app.use(helmet())

app.get('*', (req, res) => {
    res.set('Content-Type', 'text/html')
    res.send(200, `
        <h1><marquee direction=right>Hello from Express path '/' on Now 2.0!</marquee></h1>
        <h2>Go to <a href="/about">/about</a></h2>
    `)
})

module.exports = app
