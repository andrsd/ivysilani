import ATV from 'atvjs'
import fastXmlParser from 'fast-xml-parser'

import API from 'lib/ivysilani.js'
import History from 'lib/history.js'

var programme_id = null

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
        const playlistUrl = Object.values(parsed)[0]
        console.log(playlistUrl)

        const player = new Player()
        const tvosPlaylist = new Playlist()

        const playlist = API.syncAjax(playlistUrl, { responseType: 'json' }).playlist

        Object.entries(playlist).forEach(([key, value]) => {
          const mediaItem = new MediaItem('video', value.streamUrls.main)
          mediaItem.artworkImageURL = value.previewImageUrl
          mediaItem.title = value.title
          tvosPlaylist.push(mediaItem)

          if (key == 0) {
            player.playlist = tvosPlaylist
            player.play()
            History.set(programme_id, 0.5)

            player.addEventListener('mediaItemWillChange', function(e) {
              History.set(programme_id, 1.)
            })
            player.addEventListener('stateDidChange', function(stateObj) {
              if (stateObj.state == 'end') {
                History.set(programme_id, 1.)
              }
            })
          }
        })

        resolve(false)
      }, (xhr) => {
        reject(xhr)
      })
  }
})

export default PlayPage
