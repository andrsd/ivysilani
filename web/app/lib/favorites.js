import ATV from 'atvjs'

const favInit = () => {
  let favorites = ATV.Settings.get('favorites')
  if (favorites === undefined) {
    favorites = []
    ATV.Settings.set('favorites', favorites)
  }
}

const change = (title, type, id) => {
  favInit()
  if (isFav(id)) {
    remove(id)
    return false
  } else {
    add(title, type, id)
    return true
  }
}

const add = (title, type, id) => {
  let favorites = ATV.Settings.get('favorites')
  favorites.push({
    title: title,
    type: type,
    ID: id
  })
  favorites.sort((a, b) => a['title'].localeCompare(b['title']))
  ATV.Settings.set('favorites', favorites)
  console.log(ATV.Settings.get('favorites'))
}

const remove = (id) => {
  let favorites = ATV.Settings.get('favorites')
  favorites = favorites.filter(object => object.ID !== id)
  ATV.Settings.set('favorites', favorites)
}

const isFav = (id) => {
  favInit()
  let favorites = ATV.Settings.get('favorites')
  if (favorites === undefined) {
    favorites = []
    ATV.Settings.set('favorites', favorites)
  }

  let show = favorites.find(object => object.ID === id)
  if (show === undefined) {
    return false
  } else {
    return true
  }
}

const badge = (id) => {
  if (isFav(id)) {
    return '<badge src="resource://button-remove" /><title>Odstranit</title>'
  }
  else {
    return '<badge src="resource://button-add" /><title>Oblíbit</title>'
  }
}

const get = () => {
  favInit()
  return ATV.Settings.get('favorites')
}

export default {
  change,
  isFav,
  badge,
  get
}
