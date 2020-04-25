import ATV from 'atvjs'

const historyInit = () => {
  let history = ATV.Settings.get('history')
  if (history === undefined) {
    history = {}
    ATV.Settings.set('history', history)
  }
}

const set = (id, value) => {
  historyInit()
  let history = ATV.Settings.get('history')
  history[id] = value
  ATV.Settings.set('history', history)
}

const remove = (id) => {
  historyInit()
  let history = ATV.Settings.get('history')
  delete history[id]
  ATV.Settings.set('history', history)
}

const watched = (id) => {
  historyInit()
  let history = ATV.Settings.get('history')
  if (id in history)
    return history[id]
  else
    return 0
}

export default {
  set,
  remove,
  watched
}
