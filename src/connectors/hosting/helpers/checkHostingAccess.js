import { UserInputError, ForbiddenError } from 'apollo-server-express'
import { getFlags } from 'Connectors/profile'
import models from 'Models'
import { ProfileFlagScopes } from 'Models/profile/enums'
import { HostProfileStatus } from 'Models/hostProfile/enums'
import { ERRORS_BY_CODE } from 'Errors'

export async function checkHostingAccess(
  hostId,
  isInviting = false,
  privateInviteCode = null
) {
  const profile = await models.Profile.findById(hostId)
    // phone and location is used by getFlags function
    .select({ phone: 1, location: 1 })
    .lean()
  const flags = getFlags(profile)
    ? getFlags(profile).filter((flag) =>
        flag.scopes.includes(ProfileFlagScopes.HOSTING)
      )
    : []
  if (flags.length > 0) {
    throw new UserInputError(ERRORS_BY_CODE.INCOMPLETE_PROFILE, {
      flags: flags.map((flag) => flag.code).join(','),
    })
  }

  const hostProfile = await models.HostProfile.findOne({ profile: hostId })
  if (!hostProfile) {
    throw new ForbiddenError(ERRORS_BY_CODE.CREATE_INVITE_FORBIDDEN)
  }
  if (!isInviting) {
    if (
      ![
        HostProfileStatus.AVAILABLE,
        HostProfileStatus.ACTIVELY_LOOKING,
      ].includes(hostProfile.status)
    ) {
      throw new ForbiddenError(ERRORS_BY_CODE.CREATE_INVITE_FORBIDDEN)
    }

    if (hostProfile.privateInviteEnabled) {
      if (!privateInviteCode) {
        throw new ForbiddenError(
          ERRORS_BY_CODE.CREATE_INVITE_PRIVATE_INVITE_CODE_REQUIRED
        )
      }
      if (hostProfile.privateInviteCode !== privateInviteCode) {
        throw new ForbiddenError(
          ERRORS_BY_CODE.CREATE_INVITE_PRIVATE_INVITE_CODE_MISMATCH
        )
      }
    }
  }
}
