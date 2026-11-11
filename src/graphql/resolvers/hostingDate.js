import { allHostingDates, hostingDate } from 'Connectors/hostingDate'
import moment from 'moment'
import { HostingDateTypes } from 'Models/hostingDate/enums'

export default {
  Query: {
    hostingDate: async (_, { input: { date } }) => {
      return await hostingDate(date)
    },
    hostingDates: async (_, { input = {} }, { local = 'US' }) => {
      const { date = moment(), limit = 26 } = input // local = ctxLocal || 'US '
      return await allHostingDates(limit, date, local)
    },
  },

  HostingDate: {
    type: (parent, input, { local = 'US' }) => {
      const details = local === 'IL' ? parent.israel : parent.diaspora
      return details.type
    },

    local: (parent, args, { local = 'US' }) => {
      return local
    },
    description: (parent, input, { local = 'US' }) => {
      const details = local === 'IL' ? parent.israel : parent.diaspora
      if (details.type === HostingDateTypes.SHABBAT) {
        return `Shabbat Parshat ${details.parsha}`
      }
      if (details.type === HostingDateTypes.YOMTOV) {
        return details.name
      }
      return ''
    },
    hebrewDescription: (parent, input, { local = 'US' }) => {
      const details = local === 'IL' ? parent.israel : parent.diaspora
      if (details.type === HostingDateTypes.SHABBAT) {
        return 'שבת פרשת' + ' ' + details.hebrewParsha
      }
      if (details.type === HostingDateTypes.YOMTOV) {
        return details.hebrewName
      }
      return ''
    },
  },
}
