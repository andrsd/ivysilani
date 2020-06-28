import ATV from 'atvjs'
import fastXmlParser from 'fast-xml-parser'

import template from './template.hbs'
import context_menu from './context-menu.hbs'
import API from 'lib/ivysilani.js'
import Favorites from 'lib/favorites.js'
import History from 'lib/history.js'
import HB from 'lib/template-helpers.js'

let show_info

var ProgrammeListPage = ATV.Page.create({
  name: 'programme-list',
  template: template,
  events: {
    highlight: 'onHighlight',
    holdselect: 'onHoldSelect'
  },
  ready: function (options, resolve, reject) {
    // Paging support
    let current_page
    let page_size = 20
    if ('paging' in options)
      current_page = options.paging.nextPage
    else
      current_page = '1'
    if ('showInfo' in options)
      // got here via paging
      show_info = options.showInfo
    else
      show_info = options

    let getProgrammeList = ATV.Ajax.post(API.url.programmeList, API.xhrOptions({
        ID: show_info.ID,
        'paging[episodes][currentPage]': current_page,
        'paging[episodes][pageSize]': page_size,
        'type[0]': 'episodes',
        'type[1]': 'related',
        'type[2]': 'bonuses'
      }))

    var promises = [ getProgrammeList ]
    promises.push(
      ATV.Ajax.post(API.url.programmeDetails,
        API.xhrOptions({
          ID: show_info.ID
        })
      )
    )

    Promise
      .all(promises)
      .then((xhrs) => {
        let programmeList = fastXmlParser.parse(xhrs[0].response).programmes
        let programmeDetails = fastXmlParser.parse(xhrs[1].response).programme
        show_info.SIDP = programmeDetails.SIDP

        if (programmeDetails.description.length == 0) {
          programmeDetails.description = options.synopsis
        }

        // Modifikace pagování, odstraň paging, pokud se všechno vešlo na 1 stránku
        if (programmeList.episodes.paging.pagesCount === 1) {
          delete programmeList.episodes.paging
        }

        if ('programme' in programmeList.episodes) {
          // U některých pořadů má iVysílání chybu -> ukazuje, že je více stránek,
          // přitom další už je prázdná
          if (programmeList.episodes.programme.length < page_size) {
            delete programmeList.episodes.paging
          }
          // Pokud to není seriál ale film, obal to do pole, kvůli korektnímu zobrazení
          // Kvuli konverzti XML -> JSON. fastXMLParser hodí jednu epizodu jako child, ne jako pole
          if (!(programmeList.episodes.programme.constructor === Array)) {
            programmeList.episodes.programme = [programmeList.episodes.programme]
          }

          this.single = programmeList.episodes.programme.length == 1
          for (var e of programmeList.episodes.programme) {
            e.watched = History.watched(e.ID)
          }

          var favorite_button
          if (this.single)
            favorite_button = Favorites.badge(show_info.ID)
          else
            favorite_button = Favorites.badge(show_info.SIDP)

          resolve({
            favoriteButton: favorite_button,
            watchedButton: History.watchedBadge(show_info.ID),
            details: programmeDetails,
            related: programmeList.related.programme,
            showInfo: show_info,
            paging: programmeList.episodes.paging,
            single: this.single,
            episodes: programmeList.episodes.programme
          })
        }
        else {
          ATV.Navigation.showError({
            data: {
              title: 'Chyba',
              message: 'Pořad není v iVysílání dostupný'
            },
            type: 'document'
          })
        }
      }, (xhr) => {
        reject()
      })
  },
  afterReady (doc) {
    doc
      .getElementById('favorite-btn')
      .addEventListener('select', () => {
        if (this.single) {
          Favorites.change(show_info.title, 'episode', show_info.ID)
          doc.getElementById('favorite-btn').innerHTML = Favorites.badge(show_info.ID)
        }
        else {
          Favorites.change(show_info.title, 'show', show_info.SIDP)
          doc.getElementById('favorite-btn').innerHTML = Favorites.badge(show_info.SIDP)
        }
      })

      if (this.single) {
        doc
          .getElementById('watched-btn')
          .addEventListener('select', () => {
            if (History.watched(show_info.ID))
              History.markUnwatched(show_info.ID)
            else
              History.markWatched(show_info.ID)
            doc.getElementById('watched-btn').innerHTML = History.watchedBadge(show_info.ID)
          })
      }
  },
  onHighlight(e) {
    let element = e.target
    let elementType = element.nodeName

    if (elementType === 'listItemLockup') {
      var doc = getActiveDocument()
      var data_href = element.getAttribute("data-href-page")

      if (data_href == "play") {
        var programme = JSON.parse(element.getAttribute("data-href-page-options"))
        doc.getElementById('ep-img').setAttribute("src", programme.imageURL)
        doc.getElementById('description').innerHTML = programme.synopsis
      }
      else {
        doc.getElementById('ep-img').setAttribute("src", " ")
        doc.getElementById('description').innerHTML = " "
      }
    }
  },
  onHoldSelect(e) {
    let element = e.target

    if (element.nodeName === 'listItemLockup') {
      var programme = JSON.parse(element.getAttribute("data-href-page-options"))
      var ordinal = element.getElementsByTagName('ordinal').item(0)

      var doc = ATV.Navigation.presentModal({
        template: context_menu,
        data: {
          programme: programme
        }
      })

      doc
        .getElementById('watched-btn')
        .addEventListener('select', () => {
          ATV.Navigation.dismissModal()
          History.markWatched(programme.ID)
          ordinal.innerHTML = HB.helpers.watchedState(1)
        })

      doc
        .getElementById('unwatched-btn')
        .addEventListener('select', () => {
          ATV.Navigation.dismissModal()
          History.markUnwatched(programme.ID)
          ordinal.innerHTML = HB.helpers.watchedState(0)
        })
    }
  },
  single: null
})

export default ProgrammeListPage
