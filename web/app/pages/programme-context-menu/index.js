import ATV from 'atvjs'
import template from './template.hbs'
import History from 'lib/history.js'

const ProgrammeContextMenuPage = ATV.Page.create({
  name: 'programme-context-menu',
  template: template,
  ready (options, resolve, reject) {
    this.programme = options.programme
    resolve({
      programme: this.programme
    })
  },
  afterReady (doc) {
    const markAsWatched = () => {
      History.set(this.programme.ID, 1.0)
      ATV.Navigation.back()
    }
    doc
      .getElementById('watched-btn')
      .addEventListener('select', markAsWatched)

    const markAsUnwatched = () => {
      History.remove(this.programme.ID, 0.0)
      ATV.Navigation.back()
    }
    doc
      .getElementById('unwatched-btn')
      .addEventListener('select', markAsUnwatched)
  },
  programme: null
})

export default ProgrammeContextMenuPage
