import models from 'Models'
import { HostingStatus } from 'Models/hosting/enums'
import { SiteRoles } from 'Models/profile/enums'

export default {
  Query: {
    hostingMetrics: async (_, { input }, { activeProfileId }) => {
      const {
        date,
        profile = activeProfileId,
        siteRole = SiteRoles.HOST,
      } = input

      const filter = {
        date,
        [siteRole.toLowerCase()]: profile,
      }

      const hostings = await models.Hosting.find(filter)

      const hostingMetrics = hostings.reduce(
        (metrics, hosting) => {
          metrics[hosting.status] = metrics[hosting.status] + 1
          return metrics
        },
        { pending: 0, accepted: 0, declined: 0 }
      )

      const partMetrics = hostings.reduce(
        (metrics, hosting) => {
          if (hosting.status === HostingStatus.ACCEPTED) {
            hosting.sharedParts.map((p) => (metrics[p] = metrics[p] + 1))
          }
          return metrics
        },

        { night: 0, day: 0, third: 0, melaveMalka: 0, lodging: 0 }
      )
      return {
        hostingMetrics,
        partMetrics,
      }
    },
  },
}
