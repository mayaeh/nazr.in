import test from 'ava'
import mongoose from 'mongoose'
import Hashids from 'hashids'

import * as urlService from '../build/services/url-service'

const testURL = 'https://taruntarun.net'
const databaseURL = 'mongodb://localhost/nazrin_test'

mongoose.connect(databaseURL, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false })

test.serial('shorten url and retrieve its decoded value', async (t) => {
  const salt = process.env.HASHIDS_SALT || '';
  const minLength = 5;
  const hashids = new Hashids(salt, minLength);

  const res = await urlService.shortenURL(testURL)
  t.is(res.url, testURL)
  t.is(res.base62, hashids.encode(res.numerical_id))

  const receivedURL = await urlService.getURL(res.base62)
  t.is(receivedURL.url, testURL)
  t.is(receivedURL.numerical_id, res.numerical_id)
})

test.serial('incremental id', async (t) => {
  const firstURL = await urlService.shortenURL(testURL)
  const firstID = parseInt(firstURL.numerical_id, 10)

  const secondURL = await urlService.shortenURL(testURL)
  const secondID = parseInt(secondURL.numerical_id, 10)

  t.is(firstID + 1, secondID)
})
