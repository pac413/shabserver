import { autoTypeSearch } from 'Connectors/autoTypeSearch'

export default {
  Query: {
    autoTypeSearch: (parent, { input }, context) => {
      return autoTypeSearch(input, context)
    },
  },
}
