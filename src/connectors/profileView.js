import moment from 'moment'
import { createNewNotification } from 'Connectors/notification'
import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'
import models from 'Models'
import { NotificationType, NotificationStatus } from 'Models/notification/enums'
import { getProfileUrl } from 'Utils/profile'
import { UPDATE_PROFILE_VIEW_DAYS } from 'Utils/settings'

export const viewProfile = async (
  viewer,
  viewed,
  browser,
  anonymousBrowsing
) => {
  if (viewer === viewed) {
    return
  }

  const currentDate = moment.utc().toDate()
  const anonymous = anonymousBrowsing
  const aWeekAgo = moment()
    .subtract(UPDATE_PROFILE_VIEW_DAYS, 'd')
    .utc()
    .toDate()

  const filter = { viewer, viewed }
  const doc = {
    viewer,
    viewed,
    browser,
    dateViewed: currentDate,
    anonymous,
    createdAt: {
      $gte: aWeekAgo,
      $lt: currentDate,
    },
  }

  const result = await models.ProfileView.findOneAndUpdate(filter, doc, {
    returnNewDocument: true,
    upsert: true,
  })

  // if the operation above resulted in an insert 'null' is returned and not anonymousBrowsing.
  // So we also increment the profile views.
  if (result === null && !anonymous) {
    const pageView = await models.ProfileView.findOne(filter)
    await createNewProfileViewNotification(pageView)
  }
}

/* Disabled the feature that sends an email for profile being viewed by others
const prepareAndSendNewProfileViewEmail = async (
  viewerId,
  viewedProfileId,
  contentOwnerEmail
) => {
  const template = {
    viewer: {
      ...(await prepareCommonProfileEmailTemplate(viewerId)),
    },
    viewedProfile: {
      ...(await prepareCommonProfileEmailTemplate(viewedProfileId)),
    },
    contentOwnerEmail,
  }

  await sendNewProfileViewEmail(template)
}
*/

const createNewProfileViewNotification = async (pageView) => {
  const viewerUser = await simpleProfileLoader.load(pageView.viewer)

  await createNewNotification({
    profile: pageView.viewed,
    triggeredBy: pageView.viewer,
    type: NotificationType.PROFILE_VIEW,
    title: { name: 'notification.profile-viewed.title' },
    content: {
      name: 'notification.profile-viewed.content',
      variables: {
        profileUrl: getProfileUrl(viewerUser),
        firstName: viewerUser.firstName,
        lastName: viewerUser.lastName,
      },
    },
    status: NotificationStatus.NEW,
  })
}

export async function deleteProfileViews(profileId, shouldHardDelete = false) {
  const whereOptions = {
    $or: [{ viewer: profileId }, { viewed: profileId }],
  }
  if (shouldHardDelete) {
    await models.ProfileView.deleteMany(whereOptions)
  } else {
    await models.ProfileView.delete(whereOptions).exec()
  }
}

export async function restoreProfileViews(profileId) {
  const whereOptions = {
    $or: [{ viewer: profileId }, { viewed: profileId }],
  }
  await models.ProfileView.restore(whereOptions).exec()
}
