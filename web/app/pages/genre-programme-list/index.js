import ATV from 'atvjs'
import template from './template.hbs'

import API from 'lib/ivysilani.js'
import fastXmlParser from 'fast-xml-parser'

const GenreProgrammeListPage = ATV.Page.create({
  name: 'genre-programme-list',
  template: template,
  ready: function (options, resolve, reject) {
    ATV.Navigation.showLoading({
      data: {
        message: 'Načítání',
        class: 'darkBackgroundColor'
      },
      type: 'document'
    })

    let getShows = ATV.Ajax.post(API.url.programmeList, API.xhrOptions({genre: options.link}))

    Promise
      .all([getShows])
      .then((xhrs) => {
        let genre = options
        let shows = fastXmlParser.parse(xhrs[0].response).programmes
        console.log(shows)

        resolve({
          shows: shows.programme,
          genre: genre
        })
      }, (xhr) => {
        reject()
      })
  }
})

export default GenreProgrammeListPage
