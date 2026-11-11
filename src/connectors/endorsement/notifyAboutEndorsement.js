import models from 'Models'
import { createNewNotification } from 'Connectors/notification'
import { getAvatar, getLocationString } from 'Connectors/profile'
import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'
import {
  NotificationType,
  NotificationStatus,
  NotificationActionStyle,
  NotificationActionType,
} from 'Models/notification/enums'
import { sendEndorsementEmail } from 'Services/email'
import { THUMBNAILS } from 'Utils/globals'
import { getProfileUrl } from 'Utils/profile'
import { SiteRoles } from 'Models/profile/enums'

export const notifyAboutEndorsement = async (
  endorsement,
  { activeProfileId, endorsingBack }
) => {
  const [endorser, profile] = await Promise.all([
    simpleProfileLoader.load(endorsement.endorser),
    simpleProfileLoader.load(endorsement.profile),
  ])

  // Determine what profile ( host | guest ) to endorse back
  const [endorserHostProfile, endorserGuestProfile] = await Promise.all([
    models.HostProfile.findOne({ profile: endorsement.endorser }),
    models.GuestProfile.findOne({ profile: endorsement.endorser }),
  ])
  const isEndorsementHost =
    endorsement.onSiteRole === SiteRoles.HOST && !!endorserGuestProfile
  const isEndorsementGuest =
    endorsement.onSiteRole === SiteRoles.GUEST && !!endorserHostProfile
  const endorsementBackType = isEndorsementHost
    ? 'guest'
    : isEndorsementGuest
    ? 'host'
    : ''

  const actions = [
    {
      name: 'View',
      label: { name: 'notification.profile-endorsed.view' },
      style: NotificationActionStyle.PRIMARY,
      type: NotificationActionType.VIEW_ENDORSEMENT,
      actionUrl: `/action/view-endorsement/accept/${endorsement._id}`,
    },
  ]

  if (endorsementBackType && !endorsingBack) {
    actions.push({
      name: 'Endorse Back',
      label: { name: 'notification.profile-endorsed.endorse-back' },
      style: NotificationActionStyle.SECONDARY,
      type: NotificationActionType.ENDORSE_BACK,
      actionUrl: `/action/endorse-back/accept/${endorser.handle}/${endorsementBackType}`,
    })
  }

  await createNewNotification({
    profile: endorsement.profile,
    triggeredBy: activeProfileId,
    type: NotificationType.PROFILE_ENDORSED,
    title: { name: 'notification.profile-endorsed.title' },
    content: {
      name: 'notification.profile-endorsed.content',
      variables: {
        profileUrl: getProfileUrl(endorser),
        firstName: endorser.firstName,
        lastName: endorser.lastName,
        siteRole: endorsement.onSiteRole,
      },
    },
    status: NotificationStatus.NEW,
    referenceId: endorsement.id,
    actions,
  })

  await sendEndorsementEmail({
    profileEmail: profile.email,
    profileFirstName: profile.firstName,
    endoser: {
      firstName: endorser.firstName,
      lastName: endorser.lastName,
      location: getLocationString(endorser),
      avatarUrl: await getAvatar(endorser, THUMBNAILS.MEDIUM),
      profileUrl: getProfileUrl(endorser),
    },
    text: endorsement.body,
    siteRole: endorsement.onSiteRole,
  })
}
