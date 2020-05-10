import ATV from 'atvjs'
import fastXmlParser from 'fast-xml-parser'
import template from './template.hbs'
import API from 'lib/ivysilani.js'
import favorites from 'lib/favorites.js'

const FavoritesPage = ATV.Page.create({
  name: 'favorites',
  template,
  ready (options, resolve, reject) {
    let favs = favorites.get()

    if (favs.length > 0) {
      var promises = []

      favs.forEach((value) => {
        promises.push(
          ATV.Ajax
            .post(API.url.programmeDetails, API.xhrOptions({ ID: value.ID }))
            .then((xhr) => {
              value.showInfo = fastXmlParser.parse(xhr.response).programme
              console.log(value.showInfo)
            }))
      })

      Promise
        .all(promises)
        .then(() => {
          resolve({
            favorites: favs
          })
        }, (xhr) => {
          // error
          reject(xhr)
        })
    }
    else {
      resolve()
    }
  }
})

export default FavoritesPage
