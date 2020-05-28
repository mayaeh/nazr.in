import Hashids from 'hashids/cjs'
import { isURL } from 'validator'

import ShortLink from '../models/short-link'

export async function shortenURL(url) {
  if (!isURL(url)) {
    throw new Error('Invalid URL provided')
  }

  if (url.indexOf('//s.t8n.dev') > -1) {
    throw new Error('URLs contain s.t8n.dev can not to be shortened')
  }

  const salt = process.env.HASHIDS_SALT || '';
  const minLength = 5;
  const hashids = new Hashids(salt, minLength);
  const shortLink = new ShortLink()

  if(await isRegistedURL(url)){
    const registedLink = await getShortLink(url)
    shortLink.id = registedLink.numerical_id
    shortLink.url = registedLink.url
    shortLink.base62 = registedLink.base62
  }else {
    await shortLink.save()
    shortLink.url = url
    shortLink.base62 = hashids.encode(shortLink.numerical_id)
    await shortLink.save()
  }
  return shortLink
}

export async function isRegistedURL(url){
  if (!isURL(url)) {
    throw new Error('Invalid URL provided')
  }
  const registedData = await ShortLink.findOne({ url: url })
  return registedData != null;
}

export async function getShortLink(url) {
  if (!isURL(url)){
    throw new Error('Invalid URL provided')
  }
  const shortLink = await ShortLink.findOne({url: url});
  return {
    numerical_id: shortLink.numerical_id, // eslint-disable-line camelcase
    base62: shortLink.base62,
    url: shortLink.url,
  }
}

export async function getURL(id) {
  const shortLink = await ShortLink.findOne({ base62: id })
  if (shortLink === null) {
    throw new Error('Requested link is missing')
  }
  return {
    numerical_id: shortLink.numerical_id, // eslint-disable-line camelcase
    base62: shortLink.base62,
    url: shortLink.url,
  }
}
