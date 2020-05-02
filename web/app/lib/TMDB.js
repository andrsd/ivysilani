
const BASE_URL_V3 = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original'
const API_KEY = '6deae6b9672e7b297ce431e3e818517c'
const LANGUAGE = 'cs-CZ'

const url = {
  searchMovie (query) {
    return `${BASE_URL_V3}/search/movie/?api_key=${API_KEY}&language=${LANGUAGE}&page=1&include_adult=false&query=${encodeURIComponent(query)}`
  },
  movieDetails (id) {
    return `${BASE_URL_V3}/movie/${id}?api_key=${API_KEY}&language=${LANGUAGE}&append_to_response=credits`
  }
}

function imageUrl(img) {
  return `${IMAGE_BASE_URL}${img}`
}

export default {
  url,
  imageUrl
}
