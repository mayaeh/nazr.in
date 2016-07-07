const express = require('express')
const subdomain = require('express-subdomain')
const corser = require('corser')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')

const port = process.env.PORT || 3000
const databaseURL = process.env.MONGODB_URI || 'mongodb://localhost/nazrin'

var connection = mongoose.connect(databaseURL)
autoIncrement.initialize(connection)

var ShortLink = require('./app/models/short_link')

const app = express()

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(morgan('combined'))

app.use(corser.create())

app.use(express.static(__dirname + '/public'))

// API routes
const APIRouter = require('./app/routes/api')
app.use(subdomain('api', APIRouter))
// app.use('/api', APIRouter)

// Global routes
app.get('/*', function(req, res) {
  ShortLink.findOne({base62: req.params[0]}, (err, shortLink) => {
    if (err || shortLink === null) {
      res.redirect('/')
      return
    }
    res.redirect(shortLink.url)
  })
})

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})