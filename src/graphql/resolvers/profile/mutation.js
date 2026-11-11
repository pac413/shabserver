import { ForbiddenError } from 'apollo-server-express'
import { combineResolvers } from 'graphql-resolvers'
import { profileIdInCtx } from 'graphql/resolvers/authorization'
import { deletePictureAddedPost } from 'Connectors/post'
import { deleteMedia } from 'Connectors/media'
import {
  addSiteRole,
  completeRegister,
  deleteSiteRole,
  setProfileFriendRequestSetting,
  updateProfile,
  updateProfilePrimaryLocale,
} from 'Connectors/profile'
import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'
import userLoader from 'DataLoaders/userLoader'
import models from 'Models'
import { SiteRoles } from 'Models/profile/enums'
import { sendEmailVerificationRequest } from 'Services/email'
import { FRONTEND_URL, Roles } from 'Utils/globals'

export default {
  completeRegister: async (_, { input }, context) => {
    return await completeRegister(input, context)
  },
  resendConfirmationEmail: async (
    _,
    { input },
    { activeProfileId, activeUserId }
  ) => {
    const [activeProfile, activeUser] = await Promise.all([
      simpleProfileLoader.load(activeProfileId),
      userLoader.load(activeUserId),
    ])
    if (!activeProfile) {
      return {
        status: false,
        error: 'PROFILE_NOT_EXIST',
      }
    }

    if (!activeUser) {
      return {
        status: false,
        error: 'USER_NOT_EXIST',
      }
    }

    if (activeUser.emailConfirmed) {
      return {
        status: false,
        error: 'EMAIL_ALREADY_CONFIRMED',
      }
    }

    try {
      await sendEmailVerificationRequest({
        profileId: activeProfile._id,
        profileEmail: activeProfile.email,
        profileFirstName: activeProfile.firstName,
        confirmActionRedirectUrl: `${FRONTEND_URL}/action/confirm-email/confirm/${activeUser.emailToken}`,
      })

      return {
        status: true,
      }
    } catch (error) {
      console.log(error)
      return {
        status: false,
        error: 'CANNOT_SEND_EMAIL',
      }
    }
  },
  updateProfile: combineResolvers(
    profileIdInCtx,
    async (_, { input }, context) => {
      const updatedProfile = await updateProfile(input, context)
      return { profile: updatedProfile }
    }
  ),
  updateProfilePrimaryLocale: async (_, { primaryLocale }, context) => {
    await updateProfilePrimaryLocale(primaryLocale, context)
    return primaryLocale
  },
  addGuestSiteRole: combineResolvers(
    profileIdInCtx,
    async (_, { input }, { activeProfileId }) => {
      const id = input && input.id ? input.id : activeProfileId
      const profile = await addSiteRole(SiteRoles.GUEST, id)
      return { profile }
    }
  ),
  addHostSiteRole: combineResolvers(
    profileIdInCtx,
    async (_, { input }, { activeProfileId }) => {
      const id = input && input.id ? input.id : activeProfileId
      const profile = await addSiteRole(SiteRoles.HOST, id)
      return { profile }
    }
  ),
  addDatingSiteRole: combineResolvers(
    profileIdInCtx,
    async (_, { input }, { activeProfileId }) => {
      const id = input && input.id ? input.id : activeProfileId
      const profile = await addSiteRole(SiteRoles.DATING, id)
      return {
        profile,
      }
    }
  ),
  deleteGuestSiteRole: combineResolvers(
    profileIdInCtx,
    async (_, { input }, { activeProfileId }) => {
      const id = input && input.id ? input.id : activeProfileId
      const profile = await deleteSiteRole(SiteRoles.GUEST, id)
      return { profile }
    }
  ),
  deleteHostSiteRole: combineResolvers(
    profileIdInCtx,
    async (_, { input }, { activeProfileId }) => {
      const id = input && input.id ? input.id : activeProfileId
      const profile = await deleteSiteRole(SiteRoles.HOST, id)
      return { profile }
    }
  ),
  deleteDatingSiteRole: combineResolvers(
    profileIdInCtx,
    async (_, { input }, { activeProfileId }) => {
      const id = input && input.id ? input.id : activeProfileId
      const profile = await deleteSiteRole(SiteRoles.DATING, id)
      return { profile }
    }
  ),
  setProfileFriendRequestSetting: async (_, { input }, { activeProfileId }) => {
    return await setProfileFriendRequestSetting(activeProfileId, input)
  },
  deleteProfilePicture: async (_, { input }, context) => {
    const { id, removePost } = input
    if (removePost) {
      await deletePictureAddedPost({ mediaId: id }, context)
    }
    await deleteMedia({ id, keepOriginal: !removePost }, context)
    return { id }
  },
  mergeProfiles: async (_, { input }, context) => {
    const { primaryProfileId, secondaryProfileId } = input
    const { role } = context

    // we are merging social properties of Secondary Profile into Primary Profile
    // and removing Secondary Profile

    if (role !== Roles.Admin) {
      throw new ForbiddenError('Only admin can perform this operation')
    }
    const [primaryProfile, secondaryProfile] = await Promise.all([
      models.Profile.findById(primaryProfileId),
      models.Profile.findById(secondaryProfileId),
    ])

    if (!primaryProfile) {
      throw new Error(`Primary profile do not exist`, { primaryProfileId })
    }
    if (!secondaryProfile) {
      throw new Error(`Secondary profile do not exist`, { secondaryProfileId })
    }
    const [primaryUser, secondaryUser] = await Promise.all([
      models.User.findById(primaryProfile.user),
      models.User.findById(secondaryProfile.user),
    ])
    if (!primaryUser) {
      throw new Error(`Primary user do not exist`)
    }
    if (!secondaryUser) {
      throw new Error(`Secondary user do not exist`)
    }

    const profileUpdate = {}

    const providers = ['google', 'facebook']
    for (const provider of providers) {
      if (secondaryUser[provider] && secondaryUser[provider].id) {
        profileUpdate[provider] = secondaryUser[provider]
      }
    }

    if (Object.keys(profileUpdate).length) {
      await models.User.updateOne({ _id: primaryUser._id }, profileUpdate)
      await Promise.all([
        models.Conversation.updateMany(
          { 'participants.participant': secondaryUser._id },
          { $set: { 'participants.$.participant': primaryUser._id } }
        ),
        models.Friendship.updateMany(
          { members: secondaryUser._id },
          { $set: { 'members.$': primaryUser._id } }
        ),
        models.Hosting.updateMany(
          { host: secondaryUser._id },
          { $set: { host: primaryUser._id } }
        ),
        models.Hosting.updateMany(
          { guest: secondaryUser._id },
          { $set: { guest: primaryUser._id } }
        ),
        models.Message.updateMany(
          { sender: secondaryUser._id },
          { $set: { sender: primaryUser._id } }
        ),
        models.Message.updateMany(
          { 'recipients.recipient': secondaryUser._id },
          { $set: { 'recipients.$.recipient': primaryUser._id } }
        ),
        models.Notification.updateMany(
          { profile: secondaryUser._id },
          { $set: { profile: primaryUser._id } }
        ),
        models.Notification.updateMany(
          { triggeredBy: secondaryUser._id },
          { $set: { triggeredBy: primaryUser._id } }
        ),
        models.Post.updateMany(
          { postedBy: secondaryUser._id },
          { $set: { postedBy: primaryUser._id } }
        ),
        models.PostComment.updateMany(
          { commentedBy: secondaryUser._id },
          { $set: { commentedBy: primaryUser._id } }
        ),
        models.PostLike.updateMany(
          { likedBy: secondaryUser._id },
          { $set: { likedBy: primaryUser._id } }
        ),
        models.PostView.updateMany(
          { viewedBy: secondaryUser._id },
          { $set: { viewedBy: primaryUser._id } }
        ),
        models.Endorsement.updateMany(
          { endorser: secondaryUser._id },
          { $set: { endorser: primaryUser._id } }
        ),
        models.Endorsement.updateMany(
          { profile: secondaryUser._id },
          { $set: { profile: primaryUser._id } }
        ),
        models.ProfileView.updateMany(
          { viewer: secondaryUser._id },
          { $set: { viewer: primaryUser._id } }
        ),
        models.ProfileView.updateMany(
          { viewed: secondaryUser._id },
          { $set: { viewed: primaryUser._id } }
        ),
        models.Blocking.updateMany(
          { profileId: secondaryUser._id },
          { $set: { profileId: primaryUser._id } }
        ),
        models.Blocking.updateMany(
          { blockedProfileId: secondaryUser._id },
          { $set: { blockedProfileId: primaryUser._id } }
        ),
        models.Follower.updateMany(
          { profileId: secondaryUser._id },
          { $set: { profileId: primaryUser._id } }
        ),
        models.Follower.updateMany(
          { followerProfileId: secondaryUser._id },
          { $set: { followerProfileId: primaryUser._id } }
        ),
        models.Media.updateMany(
          { ownerId: secondaryUser._id },
          { $set: { ownerId: primaryUser._id } }
        ),
        models.ProfileSettings.deleteMany({ profile: secondaryUser._id }),
        models.SponsoredPost.updateMany(
          { postedBy: secondaryUser._id },
          { $set: { postedBy: primaryUser._id } }
        ),
        models.Reference.updateMany(
          { profile: secondaryUser._id },
          { $set: { profile: primaryUser._id } }
        ),
        models.Reference.updateMany(
          { profileShabbatMember: secondaryUser._id },
          { $set: { profileShabbatMember: primaryUser._id } }
        ),
        models.DatingMatch.updateMany(
          { guy: secondaryUser._id },
          { $set: { guy: primaryUser._id } }
        ),
        models.DatingMatch.updateMany(
          { girl: secondaryUser._id },
          { $set: { girl: primaryUser._id } }
        ),
        models.DatingMatch.updateMany(
          { matchmaker: secondaryUser._id },
          { $set: { matchmaker: primaryUser._id } }
        ),
        models.DatingMatch.updateMany(
          { matchmaker: secondaryUser._id },
          { $set: { matchmaker: primaryUser._id } }
        ),
        models.Request.updateMany(
          { requestor: secondaryUser._id },
          { $set: { requestor: primaryUser._id } }
        ),
        models.Request.updateMany(
          { recipient: secondaryUser._id },
          { $set: { recipient: primaryUser._id } }
        ),
        models.FlaggedContent.updateMany(
          { reportedBy: secondaryUser._id },
          { $set: { reportedBy: primaryUser._id } }
        ),
        models.FlaggedContent.updateMany(
          { ownedBy: secondaryUser._id },
          { $set: { ownedBy: primaryUser._id } }
        ),
        models.MutedConnection.updateMany(
          { profileId: secondaryUser._id },
          { $set: { profileId: primaryUser._id } }
        ),
        models.MutedConnection.updateMany(
          { mutedProfileId: secondaryUser._id },
          { $set: { mutedProfileId: primaryUser._id } }
        ),
        models.DatingProfile.updateMany(
          { profile: secondaryUser._id },
          { $set: { profile: primaryUser._id } }
        ),
        models.HostProfile.updateMany(
          { profile: secondaryUser._id },
          { $set: { profile: primaryUser._id } }
        ),
        models.GuestProfile.updateMany(
          { profile: secondaryUser._id },
          { $set: { profile: primaryUser._id } }
        ),
      ])
      await models.User.deleteOne({ _id: secondaryUser._id })
      await models.Profile.deleteOne({ user: secondaryUser._id })

      return {
        status: true,
      }
    }

    return {
      status: false,
    }
  },
}
