import models from 'Models'
import { SiteRoles } from 'Models/profile/enums'
import updateProfileAvailability from './updateProfileAvailability'

export default async function addSiteRole(siteRole, profileId) {
  if (!Object.values(SiteRoles).includes(siteRole)) {
    throw new Error(`Invalid SiteRole ${siteRole}`)
  }
  const profile = await models.Profile.findById(profileId)
  if (profile.siteRoles.includes(siteRole)) {
    return profile
  }

  profile.siteRoles.push(siteRole)
  await profile.save()

  let model
  if (siteRole === SiteRoles.GUEST) {
    model = models.GuestProfile
  } else if (siteRole === SiteRoles.HOST) {
    model = models.HostProfile
  } else if (siteRole === SiteRoles.DATING) {
    model = models.DatingProfile
  }
  const deletedDocuments = await model.findDeleted({
    profile: profileId,
  })
  if (deletedDocuments.length) {
    // restore all soft deleted siteRole profiles
    const tasks = deletedDocuments.map((document) => document.restore())
    await Promise.all(tasks)
  } else {
    // create a new siteRole profile
    await model.create({ profile: profileId })
  }

  // Update Profile's availableOnly
  await updateProfileAvailability(profileId)

  return profile
}
