import ATV from 'atvjs'
import fastXmlParser from 'fast-xml-parser'

import template from './template.hbs'
import API from 'lib/ivysilani.js'
import favorites from 'lib/favorites.js'
import TMDB from 'lib/TMDB.js'

const _ = ATV._

let showInfo

var ProgrammeDetailsPage = ATV.Page.create({
  name: 'programme-details',
  template: template,
  ready: function (options, resolve, reject) {
    showInfo = options

    var title = options.title
    var m = title.match(/(.+)(:[^:]+)/)
    if (m != null) {
      title = m[1]
    }

    Promise
      .all([
        ATV.Ajax.get(TMDB.url.searchMovie(title)),
        ATV.Ajax.get(TMDB.url.searchTVShow(title))
      ])
      .then((res) => {
        let getProgrammeDetails = ATV.Ajax.post(API.url.programmeDetails, API.xhrOptions({ID: options.ID}))
        let getRelatedList = ATV.Ajax.post(API.url.programmeList, API.xhrOptions({
          ID: options.ID,
          'type[0]': 'related'
        }))

        if ((res[0].response.total_results > 0) && (res[1].response.total_results == 0)) {
          var id = res[0].response.results[0].id
          return Promise.all([
            getProgrammeDetails,
            getRelatedList,
            ATV.Ajax.get(TMDB.url.movieDetails(id))
          ])
        }
        else if ((res[0].response.total_results == 0) && (res[1].response.total_results > 0)) {
          var id = res[1].response.results[0].id
          return Promise.all([
            getProgrammeDetails,
            getRelatedList,
            ATV.Ajax.get(TMDB.url.tvShowDetails(id))
          ])
        }
        else {
          return Promise.all([
            getProgrammeDetails,
            getRelatedList
          ])
        }
      }, (res) => {
        resolve(false)
      })
      .then((res) => {
        let ctdetails = fastXmlParser.parse(res[0].response).programme
        let related = fastXmlParser.parse(res[1].response).programmes.related.programme
        var details = {}
        var info = []
        var languages = []

        if (res.length == 3) {
          var tmdb = res[2].response
          if ('title' in tmdb) {
            details.title = tmdb.title
          }
          if ('name' in tmdb) {
            details.title = tmdb.name
          }
          details.description = tmdb.overview
          details.poster_path = TMDB.imageUrl(tmdb.poster_path)

          if (tmdb.genres.length > 0) {
            details.genres = tmdb.genres
          }

          if ('release_date' in tmdb) {
            var release_date = new Date(tmdb.release_date)
            details.release_year = release_date.getFullYear()

            info.push({
              title: 'Vydáno',
              values: [ release_date.toLocaleString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' }) ]
            })
          }

          if ('first_air_date' in tmdb) {
            var first_air_date = new Date(tmdb.first_air_date)
            details.release_year = first_air_date.getFullYear()

            info.push({
              title: 'Poprvé vysíláno',
              values: [ first_air_date.toLocaleString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' }) ]
            })
          }

          // runtime
          if ('runtime' in tmdb) {
            var hh = Math.floor(tmdb.runtime / 60)
            var mm = tmdb.runtime % 60
            if (hh > 0) {
              if (mm < 10)
                details.runtime = `${hh}h 0${mm}min`
              else
                details.runtime = `${hh}h ${mm}min`
            }
            else
              details.runtime = `${mm}min`
            info.push({
              title: 'Délka',
              values: [ `${hh}:${mm}` ]
            })
          }

          if (tmdb.production_companies.length > 0) {
            var studios = []
            for (var c of tmdb.production_companies) {
              studios.push(c.name)
            }
            info.push({
              title: 'Studio',
              values: studios
            })
          }

          if ('spoken_languages' in tmdb) {
            if (tmdb.spoken_languages.length > 0) {
              var langs = []
              for (var l of tmdb.spoken_languages) {
                langs.push(l.name)
              }

              languages.push({
                title: 'Jazyky',
                values: langs
              })
            }
          }

          var credits = tmdb.credits
          if (credits.crew) {
            details.crew = []

            var directors = []
            for (var i of credits.crew) {
              if (i.job.toLowerCase() == 'director') {
                directors.push(i.name)
              }
            }
            details.crew.push({
              job: 'Režie',
              names: directors
            })
          }

          if (credits.cast) {
            details.cast = credits.cast
            for (var i of details.cast) {
              i.profile_path = TMDB.imageUrl(i.profile_path)
            }
          }
        }
        else {
          details.title = ctdetails.title
          if (_.isEmpty(ctdetails.description)) {
            details.description = 'Tento pořad nemá žádný popisek'
          }
          else {
            details.description = ctdetails.description
          }

          details.poster_path = ctdetails.imageURL

          var release_date = new Date(ctdetails.timeStampPremiere * 1000)
          details.release_year = release_date.getFullYear()

          // runtime
          var hh = Math.floor(ctdetails.footage / 60)
          var mm = ctdetails.footage % 60
          if (hh > 0)
            details.runtime = `${hh}h ${mm}min`
          else
            details.runtime = `${mm}min`
          info.push({
            title: 'Délka',
            values: [ `${hh}:${mm}` ]
          })
        }

        resolve({
          favoriteButton: favorites.badge(showInfo.ID),
          details: details,
          ctdetails: ctdetails,
          info: info,
          related: related,
          languages: languages
        })
      }, (res) => {
        resolve(false)
      })
  },
  afterReady (doc) {
    const changeFavorites = () => {
      favorites.change(showInfo.title, showInfo.ID)
      doc.getElementById('favButton').innerHTML = favorites.badge(showInfo.ID)
    }

    doc
      .getElementById('favButton')
      .addEventListener('select', changeFavorites)
  }
})

export default ProgrammeDetailsPage
