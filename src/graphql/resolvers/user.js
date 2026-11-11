import { ForbiddenError } from 'apollo-server-express'
import {
  confirmEmail,
  deleteAccount,
  setRestrictions,
  suspendAccount,
  updateEmail,
  updatePassword,
  updateTouchId,
  verifyTouchId,
  restoreAccount,
  toggleAdmin,
  toggleZealot,
  toggleGreenlight,
  reportMember,
  unreportMember,
  bulkSuspendAccounts,
  bulkDeleteAccounts,
} from 'Connectors/user'
import { ERRORS_BY_CODE } from 'Errors'
import models from 'Models'
import { PreDefineds } from 'Models/adminNote/enums'
import { Roles } from 'Utils/globals'

export default {
  Query: {},

  Mutation: {
    confirmEmail: async (_, { input: { token } }, context) => {
      return await confirmEmail(token, context)
    },
    updateAccountEmail: async (_, { input: { email } }, context) => {
      return await updateEmail(email, context)
    },
    updateAccountPassword: async (_, { input: { password } }, context) => {
      return await updatePassword(password, context)
    },
    updateAccountTouchId: async (_, { input: { touchId } }, context) => {
      return await updateTouchId(touchId, context)
    },
    verifyAccountTouchId: async (_, { input: { touchId } }, context) => {
      return await verifyTouchId(touchId, context)
    },
    deleteMyAccount: async (
      _,
      { input: { reason, note } },
      { activeProfileId }
    ) => {
      if (reason || note) {
        await models.AdminNote.create({
          noteable: 'profile',
          noteableId: activeProfileId,
          note,
          predefineds: [
            {
              type: PreDefineds.USER_ACCOUNT_DELETE_REASON,
              content: reason,
            },
          ],
          profiles: [activeProfileId],
        })
      }
      return await deleteAccount(activeProfileId)
    },
    restoreMyAccount: async (_, __, { activeProfileId }) => {
      return await restoreAccount(activeProfileId)
    },
    suspendAccount: async (
      _,
      { input: { reason, note, profileId } },
      { role }
    ) => {
      if (role !== Roles.Admin) {
        throw new ForbiddenError(ERRORS_BY_CODE.ADMIN_ONLY_ALLOWED)
      }
      if (reason || note) {
        await models.AdminNote.create({
          noteable: 'profile',
          noteableId: profileId,
          note,
          predefineds: [
            {
              type: PreDefineds.ADMIN_ACCOUNT_DELETE_REASON,
              content: reason,
            },
          ],
          profiles: [profileId],
        })
      }
      const { success } = await suspendAccount(profileId)
      const profile = await models.Profile.findById(profileId)

      return {
        success,
        profile,
      }
    },
    unsuspendAccount: async (_, { input: { profileId } }, { role }) => {
      if (role !== Roles.Admin) {
        throw new ForbiddenError(ERRORS_BY_CODE.ADMIN_ONLY_ALLOWED)
      }
      const { success } = await restoreAccount(profileId)
      const profile = await models.Profile.findById(profileId)

      return {
        success,
        profile,
      }
    },
    setRestrictions: async (
      _,
      { input: { profileId, messaging, feed, actions, search } },
      { role }
    ) => {
      if (role !== Roles.Admin) {
        throw new ForbiddenError(ERRORS_BY_CODE.ADMIN_ONLY_ALLOWED)
      }

      const updatedRestrictions = await setRestrictions(profileId, {
        messaging,
        feed,
        actions,
        search,
      })

      return {
        profileId,
        ...updatedRestrictions,
      }
    },
    toggleAdmin: async (_, { input: { profileId, value } }, { role }) => {
      if (role !== Roles.Admin) {
        throw new ForbiddenError(ERRORS_BY_CODE.ADMIN_ONLY_ALLOWED)
      }
      const success = await toggleAdmin(profileId, value)
      const profile = await models.Profile.findById(profileId)
      return {
        success,
        profile,
      }
    },
    toggleZealot: async (_, { input: { profileId, value } }, { role }) => {
      if (role !== Roles.Admin) {
        throw new ForbiddenError(ERRORS_BY_CODE.ADMIN_ONLY_ALLOWED)
      }
      const success = await toggleZealot(profileId, value)
      const profile = await models.Profile.findById(profileId)
      return {
        success,
        profile,
      }
    },
    toggleGreenlight: async (_, { input: { profileId, value } }, { role }) => {
      if (role !== Roles.Admin) {
        throw new ForbiddenError(ERRORS_BY_CODE.ADMIN_ONLY_ALLOWED)
      }
      const success = await toggleGreenlight(profileId, value)
      const profile = await models.Profile.findById(profileId)
      return {
        success,
        profile,
      }
    },
    deleteMember: async (_, { input: { profileId, suspend } }, { role }) => {
      if (role !== Roles.Admin) {
        throw new ForbiddenError(ERRORS_BY_CODE.ADMIN_ONLY_ALLOWED)
      }

      const { success } = suspend
        ? await suspendAccount(profileId)
        : await deleteAccount(profileId)

      const profile = await models.Profile.findById(profileId)
      return {
        success,
        profile,
      }
    },
    bulkDeleteMembers: async (
      _,
      { input: { profileIds, suspend } },
      { role }
    ) => {
      if (role !== Roles.Admin) {
        throw new ForbiddenError(ERRORS_BY_CODE.ADMIN_ONLY_ALLOWED)
      }

      const { success } = suspend
        ? await bulkSuspendAccounts(profileIds)
        : await bulkDeleteAccounts(profileIds)

      const profiles = await models.Profile.find({
        _id: { $in: profileIds },
      })
      return {
        success,
        profiles,
      }
    },
    reportMember: async (
      _,
      { input: { profileId, reason, additionalDetails } },
      { activeProfileId }
    ) => {
      const success = await reportMember(
        profileId,
        activeProfileId,
        reason,
        additionalDetails
      )
      const profile = await models.Profile.findById(profileId)
      return {
        success,
        profile,
      }
    },
    unreportMember: async (_, { input: { profileId } }, context) => {
      const success = await unreportMember({ profileId }, context)
      const profile = await models.Profile.findById(profileId)
      return {
        success,
        profile,
      }
    },
  },
  User: {
    id: (parent) => parent.id || parent._id,
  },
}
