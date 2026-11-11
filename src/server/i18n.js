import path from 'path'
import i18n from 'i18n'

require('../locales/de.json')
require('../locales/en.json')
require('../locales/fr.json')
require('../locales/he.json')
require('../locales/pt.json')
require('../locales/ru.json')
require('../locales/es.json')

export default (app) => {
  i18n.configure({
    directory: path.resolve(__dirname, '..', 'locales'),
    autoReload: true,
    updateFiles: false,
    objectNotation: true,
    indent: '  ',
  })
  if (app) {
    app.use(i18n.init)
  }
}
