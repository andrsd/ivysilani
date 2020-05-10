import ATV from 'atvjs'
import fastXmlParser from 'fast-xml-parser'

import template from './template.hbs'
import API from 'lib/ivysilani.js'
import favorites from 'lib/favorites.js'

import errorTpl from 'shared/templates/error.hbs'

const FavoritesPage = ATV.Page.create({
  name: 'favorites',
  template,
  ready (options, resolve, reject) {
    let favorites = favorites.get()

    if (favorites === undefined) {
      ATV.Navigation.showError({
        data: {
          title: 'Žádné oblíbené pořady',
          message: 'Zkuste nějaké přidat při procházení'
        },
        type: 'document'
      })
    }
    else {
      var promises = []

      favorites.forEach((value) => {
        promises.push(
          ATV.Ajax.post(API.url.programmeDetails, API.xhrOptions({ ID: value.ID }))
            .then((xhr) => {
              value.showInfo = fastXmlParser.parse(xhr.response).programme
              console.log(value.showInfo)
            }))
      })

      Promise
        .all(promises)
        .then(() => {
          resolve({
            favorites: favorites
          })
        }, (xhr) => {
          // error
          reject(xhr)
        })
    }
  }
})

export default FavoritesPage
