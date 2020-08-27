import ATV from 'atvjs'
import fastXmlParser from 'fast-xml-parser'

import template from './template.hbs'
import searchTpl from './search.hbs'
import noResultsTpl from './noresults.hbs'

import API from 'lib/ivysilani.js'

var results = null

function buildResults(doc, searchText) {
  // Create parser and new input element
  var domImplementation = doc.implementation
  var lsParser = domImplementation.createLSParser(1, null)
  var lsInput = domImplementation.createLSInput()

  // set default template fragment to display no results
  lsInput.stringData = ``

  if (searchText) {
    if (results) {
      var filtered_results = results.programme.filter(function(obj) {
        return obj.title
          .substring(0, searchText.length)
          .localeCompare(searchText, 'en', { sensitivity: 'base' }) == 0
      })

      lsInput.stringData = searchTpl({
        results: filtered_results
      })

      lsParser.parseWithContext(lsInput, doc.getElementsByTagName("collectionList").item(0), 2)
    }
    else {
      ATV.Ajax
        .post(API.url.programmeList, API.xhrOptions({letter: searchText.toUpperCase()[0]}))
        .then((xhr) => {
          results = fastXmlParser.parse(xhr.response).programmes

          var filtered_results = results.programme.filter(function(obj) {
            return obj.title
              .substring(0, searchText.length)
              .localeCompare(searchText, 'en', { sensitivity: 'base' }) == 0
          })

          lsInput.stringData = searchTpl({
            results: filtered_results
          })

          lsParser.parseWithContext(lsInput, doc.getElementsByTagName("collectionList").item(0), 2)
        }, () => {
          // error
          lsInput.stringData = noResultsTpl({ title: "error" })
          lsParser.parseWithContext(lsInput, doc.getElementsByTagName("collectionList").item(0), 2)
        })
    }
  }
  else {
    results = null
    lsInput.stringData = noResultsTpl()
    lsParser.parseWithContext(lsInput, doc.getElementsByTagName("collectionList").item(0), 2)
  }
}

const SearchPage = ATV.Page.create({
  name: 'search',
  template: template,
  afterReady(doc) {
    let searchField = doc.getElementsByTagName('searchField').item(0)
    let keyboard = searchField && searchField.getFeature('Keyboard')

    if (keyboard) {
      keyboard.onTextChange = function() {
        let searchText = keyboard.text
        buildResults(doc, searchText)
      }
    }
  }
})

export default SearchPage
