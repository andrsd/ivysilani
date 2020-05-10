import ATV from 'atvjs'
import Handlebars from 'handlebars'

const _ = ATV._

function assetUrl (name) {
  return `${ATV.launchOptions.BASEURL}assets/${name}`
}

const helpers = {
  toJSON (obj = {}) {
    let str
    try {
      str = JSON.stringify(obj)
    } catch (ex) {
      str = '{}'
    }
    return str
  },
  asset_url (asset) {
    return new Handlebars.SafeString(assetUrl(asset))
  },
  fullImageURL (imageURL) {
    return new Handlebars.SafeString(imageURL)
  },
  watchedState (state) {
    if (state == 0)
      return "&#9673;"
    else if (state < 1)
      return "&#9686;"
    else
      return "&#8194;"
  },
}

// register all helpers
_.each(helpers, (fn, name) => Handlebars.registerHelper(name, fn))

export default helpers
