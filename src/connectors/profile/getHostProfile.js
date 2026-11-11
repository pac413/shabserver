import hostProfileLoader from 'DataLoaders/hostProfileLoader'
import models from 'Models'
import { HostProfileType } from 'Models/hostProfile/enums'
import { SiteRoles } from 'Models/profile/enums'

export default async function getHostProfile(profile, date, myself) {
  const { siteRoles } = profile
  const id = profile._id || profile.id
  if (!siteRoles.includes(SiteRoles.HOST)) {
    return null
  }
  if (myself) {
    return models.HostProfile.findOne({
      profile: id,
      type: HostProfileType.DEFAULT,
    })
  }
  const data = await hostProfileLoader.load(id)
  if (!data) {
    return null
  }
  const hostProfile =
    data.hostProfiles.find((p) =>
      p.activeDates.find((d) => d.toString() === date.toString())
    ) ||
    data.hostProfiles.find((p) => p.type === HostProfileType.DEFAULT) ||
    data.hostProfiles[0]
  return hostProfile
}
