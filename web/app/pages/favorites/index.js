import ATV from 'atvjs'
import fastXmlParser from 'fast-xml-parser'
import template from './template.hbs'
import context_menu from './context-menu.hbs'
import API from 'lib/ivysilani.js'
import Favorites from 'lib/favorites.js'

const FavoritesPage = ATV.Page.create({
  name: 'favorites',
  template,
  events: {
    holdselect: 'onHoldSelect'
  },
  ready (options, resolve, reject) {
    let favs = Favorites.get()

    if (favs.length > 0) {
      var promises = []

      favs.forEach((value) => {
        promises.push(
          ATV.Ajax
            .post(API.url.programmeDetails, API.xhrOptions({ ID: value.ID }))
            .then((xhr) => {
              value.showInfo = fastXmlParser.parse(xhr.response).programme
              if (value.type == 'episode')
                value.target = 'programme-details'
              else
                value.target = 'programme-list'
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
  },
  onHoldSelect(e) {
    let element = e.target

    if (element.nodeName === 'lockup') {
      var programme = JSON.parse(element.getAttribute("data-href-page-options"))

      var doc = ATV.Navigation.presentModal({
        template: context_menu,
        data: {
          programme: programme
        }
      })

      doc
        .getElementById('favorite-btn')
        .addEventListener('select', () => {
          ATV.Navigation.dismissModal()
          Favorites.remove(programme.ID)
        })
    }
  },
})

export default FavoritesPage
