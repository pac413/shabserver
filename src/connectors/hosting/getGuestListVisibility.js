import models from 'Models'
import { HostProfileType } from 'Models/hostProfile/enums'
import { Roles } from 'Utils/globals'

export default async function getGuestListVisibility(profileId, context) {
  const { activeProfileId, role: adminRole } = context

  if (profileId === activeProfileId) {
    return { visible: true }
  }

  const hostProfile = await models.HostProfile.findOne({
    profile: profileId,
    type: HostProfileType.DEFAULT,
  })

  if (!hostProfile) {
    return { visible: false }
  }

  const filter = {
    host: profileId,
  }

  if (!hostProfile.showGuestList && adminRole !== Roles.Admin) {
    const hostings = await models.Hosting.find(filter)
    if (!hostings.map((item) => item.guest).includes(activeProfileId)) {
      return { visible: false }
    }
  }

  return { visible: true }
}
