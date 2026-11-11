import { getAvatar, getLocationString } from 'Connectors/profile'
import { sendEndorsementSolicitEmail } from 'Services/email'
import { THUMBNAILS, FRONTEND_URL } from 'Utils/globals'

export const sendEndorsementRequestEmails = async ({
  hostProfile,
  guestProfile,
}) => {
  await Promise.all([
    sendEndorsementSolicitEmail({
      profileEmail: hostProfile.email,
      profileFirstName: hostProfile.firstName,
      endorsementForRole: 'GUEST',
      postEndorsementUrl: `${FRONTEND_URL}/profile/${guestProfile.handle}?endorsementModal=guest`,
      endorsee: {
        firstName: guestProfile.firstName,
        lastName: guestProfile.lastName,
        location: getLocationString(guestProfile, false),
        avatarUrl: await getAvatar(guestProfile, THUMBNAILS.MEDIUM),
        profileUrl: `${FRONTEND_URL}/profile/${guestProfile.handle}`,
      },
    }),
    sendEndorsementSolicitEmail({
      profileEmail: guestProfile.email,
      profileFirstName: guestProfile.firstName,
      endorsementForRole: 'HOST',
      postEndorsementUrl: `${FRONTEND_URL}/profile/${hostProfile.handle}?endorsementModal=host`,
      endorsee: {
        firstName: hostProfile.firstName,
        lastName: hostProfile.lastName,
        location: getLocationString(hostProfile, false),
        avatarUrl: await getAvatar(hostProfile, THUMBNAILS.MEDIUM),
        profileUrl: `${FRONTEND_URL}/profile/${hostProfile.handle}`,
      },
    }),
  ])
}
