import ATV from 'atvjs'
import template from './template.hbs'
import fastXmlParser from 'fast-xml-parser'

import API from 'lib/ivysilani.js'
import History from 'lib/history.js'

var programme_id = null
var player = new Player()

const PlayPage = ATV.Page.create({
  name: 'play',
  ready (options, resolve, reject) {
    programme_id = options.ID

    let setQuality
    let setPlayerType
    if (options.isVod === '') {
      setQuality = 'web'
      setPlayerType = 'ios'
    } else {
      setQuality = 'max1080p'
      setPlayerType = 'progressive'
    }
    const getPlaylistUrl = ATV.Ajax.post(API.url.playlist, API.xhrOptions({
      ID: options.ID,
      quality: setQuality,
      playerType: setPlayerType,
      playlistType: 'json'
    }))

    Promise
      .all([getPlaylistUrl])
      .then((xhrs) => {
        const parsed = fastXmlParser.parse(xhrs[0].response)
        if ('playlistURL' in parsed) {
          const playlistUrl = Object.values(parsed)[0]
          console.log(playlistUrl)

          const tvosPlaylist = new Playlist()

          const playlist = API.syncAjax(playlistUrl, { responseType: 'json' }).playlist

          Object.entries(playlist).forEach(([key, value]) => {
            const mediaItem = new MediaItem('video', value.streamUrls.main)
            mediaItem.artworkImageURL = value.previewImageUrl
            mediaItem.title = value.title
            tvosPlaylist.push(mediaItem)

            if (key == 0) {
              player.playlist = tvosPlaylist

              player.addEventListener('timeDidChange', function(info) {
                History.setProgressTime(programme_id, info.time)
              }, {
                interval: 1
              })
            }
          })

          var watched = History.watched(programme_id)

          if ((watched > 0) && (watched < 0.99)) {
            var progressTime = History.progressTime(programme_id)
            var time = new Date(progressTime * 1000).toISOString('H:mm:ss').substr(11, 8)

            var doc = ATV.Navigation.presentModal({
              template: template,
              data: {
                time: time
              },
            })
            doc
              .getElementById('play-btn')
              .addEventListener('select', () => {
                player.play()
              })

            doc
              .getElementById('resume-btn')
              .addEventListener('select', () => {
                player.seekToTime(progressTime)
                player.play()
              })
          }
          else {
            player.play()
            resolve(false)
          }
        }
        else {
          ATV.Navigation.showError({
            data: {
              title: 'Chyba',
              message: 'Video se nepodařilo nalézt'
            },
            type: 'document'
          })
        }
      }, (xhr) => {
        reject(xhr)
      })
  }
})

export default PlayPage
