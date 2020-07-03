import ATV from 'atvjs'

const init = () => {
  let history = ATV.Settings.get('history')
  if (history === undefined) {
    history = {}
    ATV.Settings.set('history', history)
  }

  let progress_time = ATV.Settings.get('progress-time')
  if (progress_time === undefined) {
    progress_time = {}
    ATV.Settings.set('progress-time', progress_time)
  }
}

const markWatched = (id) => {
  init()
  let history = ATV.Settings.get('history')
  history[id] = 1
  ATV.Settings.set('history', history)
  removeProgressTime(id)
}

const markUnwatched = (id) => {
  init()
  let history = ATV.Settings.get('history')
  delete history[id]
  ATV.Settings.set('history', history)
  removeProgressTime(id)
}

const watched = (id) => {
  init()
  let history = ATV.Settings.get('history')
  if (id in history)
    return history[id]
  else
    return 0
}

const setProgressTime = (id, time, duration) => {
  init()
  let progress_time = ATV.Settings.get('progress-time')
  progress_time[id] = time
  ATV.Settings.set('progress-time', progress_time)

  let history = ATV.Settings.get('history')
  history[id] = time / duration
  ATV.Settings.set('history', history)
}

const progressTime = (id) => {
  init()
  let progress_time = ATV.Settings.get('progress-time')
  if (id in progress_time)
    return progress_time[id]
  else
    return 0
}

const removeProgressTime = (id) => {
  init()
  let progress_time = ATV.Settings.get('progress-time')
  delete progress_time[id]
  ATV.Settings.set('progress-time', progress_time)
}

const watchedBadge = (id) => {
  if (watched(id)) {
    return '<badge src="resource://button-checkmark" /><title>Viděno</title>'
  }
  else {
    return '<badge src="resource://button-checkmark" /><title>Neviděno</title>'
  }
}

export default {
  markWatched,
  markUnwatched,
  watched,
  watchedBadge,
  progressTime,
  setProgressTime
}
