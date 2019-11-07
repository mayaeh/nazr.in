import { join } from 'path'
import express from 'express'
import corser from 'corser'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import mongoose from 'mongoose'
import moment from 'moment-timezone'
import path from 'path'
import rfs from 'rotating-file-stream'

import APIRouter from './routes/api'
import ShortLink from './models/short-link'

// Connect to the MongoDB database
const databaseURL = process.env.MONGODB_URI || 'mongodb://localhost/nazrin'
mongoose.connect(databaseURL, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true }).catch((err) => {
  console.error(err)
})

// set timezone
const timezone = 'Asia/Tokyo';

morgan.token('date', () => {
  return moment().tz(timezone).format();
});
morgan.format(
  'combined_custom',
  ':remote-addr - :remote-user [:date[Asia/Tokyo]] ' +
  '":method :url HTTP/:http-version" ' +
  ':status :res[content-length] ":referrer" ":user-agent"',
);

// create a rotating write stream
const accessLogStream = rfs('access.log', {
  size:'10MB',
  interval: '7d', // rotate weekly
  compress: 'gzip',
  path: path.join(__dirname, '../log')
})

// Create an Express app
const app = express()
app.use(bodyParser.urlencoded({ extended: false })) // URL encoded queries
app.use(bodyParser.json()) // JSON
app.use(corser.create()) // CORS
app.use(morgan('combined_custom', {stream: accessLogStream})) // Logging

// API endpoint
app.use('/api', APIRouter)

// Find link and redirect if exists
app.get('/:base62', async (req, res, next) => {
  try {
    const shortLink = await ShortLink.findOne({ base62: req.params.base62 })

    if (shortLink) {
      res.redirect(301, shortLink.url)
    } else {
      res.redirect('/')
    }
  } catch (err) {
    next(err)
  }
})

// Route to React client app
app.use(express.static(join(__dirname + '/../../web/build')))
app.get('*', (req, res) => {
  res.sendFile(join(__dirname + '/../../web/build/index.html'))
})

export default app
