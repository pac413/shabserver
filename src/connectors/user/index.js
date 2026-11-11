import { ForbiddenError, UserInputError } from 'apollo-server-express'
import { getAvatar, getLocationString } from 'Connectors/profile'
import { hideFriendships, unhideFriendships } from 'Connectors/friends'
import {
  hideMessageNotifications,
  unhideMessageNotifications,
} from 'Connectors/notification'
import {
  hidePostCommentsPostedBy,
  hidePostsPostedBy,
  unhidePostCommentsPostedBy,
  unhidePostsPostedBy,
} from 'Connectors/post'
import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'
import userLoader from 'DataLoaders/userLoader'
import { ERRORS_BY_CODE } from 'Errors'
import models from 'Models'
import {
  AUTO_ASSIGN_ALL_RESTRICTIONS_ON_MEMBER_REPORTING,
  THUMBNAILS,
  Roles,
} from 'Utils/globals'
import { sendReportMemberEmail } from 'Services/email'
import { getProfileUrl } from 'Utils/profile'

export * from './suspendAccount'
export * from './deleteAccount'
export * from './restoreAccount'
export * from './bulkDeleteAccounts'
export * from './bulkSuspendAccounts'

export const confirmEmail = async (token, context) => {
  const { activeUserId } = context
  const user = await models.User.findOne({
    emailToken: token,
  })
  if (!user) {
    throw new ForbiddenError(ERRORS_BY_CODE.INVALID_TOKEN)
  }
  if (user.id !== activeUserId) {
    throw new ForbiddenError(ERRORS_BY_CODE.DIFFERENT_ACCOUNT)
  }
  if (user.emailConfirmed) {
    throw new ForbiddenError(ERRORS_BY_CODE.EMAIL_ALREADY_CONFIRMED)
  }

  user.emailConfirmed = true
  await user.save()
  return { success: true }
}

export const updateEmail = async (email, context) => {
  const { activeUserId } = context

  const existingUser = await models.User.findOne({
    email,
  })
  if (existingUser) {
    throw new ForbiddenError(ERRORS_BY_CODE.DUPLICATE_EMAIL)
  }

  const [profile, user] = await Promise.all([
    models.Profile.findOne({ user: activeUserId }),
    models.User.findById(activeUserId),
  ])
  user.email = email
  profile.email = email

  await Promise.all([
    profile.save().then(() => simpleProfileLoader.clear(profile._id)),
    user.save().then(() => userLoader.clear(user._id)),
  ])

  return { success: true }
}

export const updatePassword = async (password, context) => {
  const { activeUserId } = context

  const user = await models.User.findById(activeUserId)
  user.password = await models.User.generatePasswordHash(password)
  await user.save()
  return { success: true }
}

export const updateTouchId = async (touchId, context) => {
  const { activeUserId } = context

  // Reset the existing users with the same touchId
  await models.User.updateMany(
    {
      touchId,
    },
    {
      touchId: null,
    }
  )

  // Set touchId to the current user
  await models.User.findOneAndUpdate(
    {
      _id: activeUserId,
    },
    {
      touchId,
    }
  )

  return { success: true }
}

export const verifyTouchId = async (touchId, context) => {
  const { activeUserId } = context

  // Get the active user & check if it already uses the given touchId
  const activeUser = await models.User.findById(activeUserId)
  const isValidTouchId = activeUser.touchId === touchId

  return { success: isValidTouchId }
}

export const setRestrictions = async (profileId, restrictions = {}) => {
  const restrictionsUpdate = {}

  if (typeof restrictions.feed === 'boolean') {
    restrictionsUpdate['restrictions.feed'] = restrictions.feed
  }
  if (typeof restrictions.messaging === 'boolean') {
    restrictionsUpdate['restrictions.messaging'] = restrictions.messaging
  }
  if (typeof restrictions.actions === 'boolean') {
    restrictionsUpdate['restrictions.actions'] = restrictions.actions
  }
  if (typeof restrictions.search === 'boolean') {
    restrictionsUpdate['restrictions.search'] = restrictions.search
  }

  const profile = await models.Profile.findOneAndUpdate(
    { _id: profileId },
    { $set: restrictionsUpdate },
    { returnOriginal: false }
  )

  // Restrict posts as restriction
  if (isFeedRestricted(profile)) {
    hidePostsPostedBy(profileId)
    hidePostCommentsPostedBy(profileId)
  } else {
    unhidePostCommentsPostedBy(profileId)
    unhidePostsPostedBy(profileId)
  }

  // Restrict messages as restriction
  if (isMessagingRestricted(profile)) {
    await hideMessageNotifications(profileId)
  } else {
    await unhideMessageNotifications(profileId)
  }

  // Restrict actions as restriction
  if (isActionsRestricted(profile)) {
    // TODO: Add more sub-data to hide
    await hideFriendships(profileId)
  } else {
    // TODO: Add more sub-data to hide
    await unhideFriendships(profileId)
  }

  return profile.restrictions
}

export const isActionsRestricted = (profile) => {
  return profile.restrictions && profile.restrictions.actions
}

export const isMessagingRestricted = (profile) => {
  return profile.restrictions && profile.restrictions.messaging
}

export const isFeedRestricted = (profile) => {
  return profile.restrictions && profile.restrictions.feed
}

export const isSearchRestricted = (profile) => {
  return profile.restrictions && profile.restrictions.search
}

export const toggleAdmin = async (profileId, value) => {
  const profile = await getProfile(profileId)
  const user = await models.User.findById(profile.user)
  if (!user) {
    throw new UserInputError(ERRORS_BY_CODE.USER_NOT_FOUND)
  }

  // if the current isAdmin value is already equal to requested value
  if (user.isAdmin === value) {
    if (user.isAdmin) {
      throw new UserInputError(ERRORS_BY_CODE.ALREADY_ADMIN)
    } else {
      throw new UserInputError(ERRORS_BY_CODE.NOT_ADMIN)
    }
  }

  const result = await models.User.findOneAndUpdate(
    { _id: user._id },
    { isAdmin: value },
    { returnOriginal: false }
  )

  return result.isAdmin
}

export const toggleZealot = async (profileId, value) => {
  const profile = await getProfile(profileId)

  // if the current isZealot value is already equal to requested value
  if (profile.isZealot === value) {
    if (profile.isZealot) {
      throw new UserInputError(ERRORS_BY_CODE.ALREADY_ZEALOT)
    } else {
      throw new UserInputError(ERRORS_BY_CODE.NOT_ZEALOT)
    }
  }

  const result = await models.Profile.findOneAndUpdate(
    { _id: profileId },
    { isZealot: value },
    { returnOriginal: false }
  )

  return result.isZealot
}

export const toggleGreenlight = async (profileId, value) => {
  const profile = await getProfile(profileId)

  // if the current isGreenlight value is already equal to requested value
  if (profile.isGreenlight === value) {
    if (profile.isGreenlight) {
      throw new UserInputError(ERRORS_BY_CODE.ALREADY_GREENLIGHT)
    } else {
      throw new UserInputError(ERRORS_BY_CODE.ALREADY_GREENLIGHT)
    }
  }

  const result = await models.Profile.findOneAndUpdate(
    { _id: profileId },
    { isGreenlight: value },
    { returnOriginal: false }
  )

  return result.isGreenlight
}

export const isZealot = async (profileId) => {
  const profile = await getProfile(profileId)

  return profile.isZealot
}

export const isGreenlight = async (profileId) => {
  const profile = await getProfile(profileId)

  return profile.isGreenlight
}

export const reportMember = async (
  reportedUserId,
  reporterId,
  reason,
  additionalDetails
) => {
  const [reporter, profileReported] = await Promise.all([
    simpleProfileLoader.load(reporterId),
    getProfile(reportedUserId),
  ])
  const user = await models.User.findById(profileReported.user)

  if (!reporter || !profileReported) {
    throw new UserInputError(ERRORS_BY_CODE.PROFILE_NOT_FOUND, {
      reportedUserId,
    })
  }

  if (user.isAdmin) {
    console.info(
      'Skipping reporting member as the reported member is an admin user',
      {
        reportedUserId,
        reporterId,
        reason,
      }
    )
    return true
  }

  const report = await models.Report.create({
    reportedUser: reportedUserId,
    reporter: reporterId,
    reason,
    additionalDetails,
  })

  await sendReportMemberEmail({
    reporter: {
      firstName: reporter.firstName,
      lastName: reporter.lastName,
      location: getLocationString(reporter),
      avatarUrl: await getAvatar(reporter, THUMBNAILS.MEDIUM),
      profileUrl: getProfileUrl(reporter),
    },
    profileReported: {
      firstName: profileReported.firstName,
      lastName: profileReported.lastName,
      location: getLocationString(profileReported),
      avatarUrl: await getAvatar(profileReported, THUMBNAILS.MEDIUM),
      profileUrl: getProfileUrl(profileReported),
    },
    reason:
      additionalDetails && additionalDetails.length > 0
        ? `${reason}\n${additionalDetails}`
        : reason,
  })

  if (AUTO_ASSIGN_ALL_RESTRICTIONS_ON_MEMBER_REPORTING) {
    await setRestrictions(reportedUserId, {
      feed: true,
      messaging: true,
      actions: true,
      search: true,
    })
  }

  return !!report
}

export const unreportMember = async (input, context) => {
  const { profileId } = input
  const { activeProfileId, role } = context

  if (role !== Roles.Admin) {
    console.error(`${activeProfileId} is forbidden to unreport`)
    throw new ForbiddenError(ERRORS_BY_CODE.FORBIDDEN)
  }

  const reports = await models.Report.find({ reportedUser: profileId })
  reports.map(async (report) => {
    // Remove zealot restriction
    if (
      AUTO_ASSIGN_ALL_RESTRICTIONS_ON_MEMBER_REPORTING &&
      !(await isZealot(report.reporter))
    ) {
      await setRestrictions(report.reportedUser, {
        feed: false,
        messaging: false,
        actions: false,
        search: false,
      })
    }
  })
  await models.Report.deleteMany({ reportedUser: profileId })

  return true
}

export const getProfile = async (profileId) => {
  const profile = await models.Profile.findById(profileId)

  if (!profile) {
    throw new UserInputError(ERRORS_BY_CODE.PROFILE_NOT_FOUND, {
      profileId,
    })
  }

  return profile
}
