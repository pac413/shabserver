import moment from 'moment'
import { getStatus } from 'Connectors/hostProfile'
import { upcomingHostingDates } from 'Connectors/hostingDate'
import models from 'Models'

export default {
  Query: {
    hostAvailability: async (
      _,
      { input: { profileId, limit = 1, date } },
      { activeProfileId }
    ) => {
      const upcomingDates = date
        ? [moment(date).utc().toDate()]
        : await upcomingHostingDates(limit).then((ds) => ds.map((d) => d.date))

      const hostProfiles = await models.HostProfile.find({ profile: profileId })
      const hostProfilesByDate = []

      for (const date of upcomingDates) {
        const hostProfile =
          hostProfiles.find((p) => p.activeDates.includes(`${date}`)) ||
          hostProfiles.find((p) => p.primary) ||
          hostProfiles[0]
        if (!hostProfile) {
          continue
        }
        const { reserveBy } = hostProfile

        hostProfilesByDate.push({
          date,
          status: await getStatus(hostProfile, activeProfileId),
          reserveBy,
        })
      }

      return { availability: hostProfilesByDate }
    },
  },
  HostAvailability: {},
}
