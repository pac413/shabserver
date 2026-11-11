import { getMutualFriendProfileCount } from 'Connectors/friends'
import { getAvatar, getLocationString } from 'Connectors/profile'
import models from 'Models'
import { HostingType } from 'Models/hosting/enums'
import { THUMBNAILS, FRONTEND_URL } from 'Utils/globals'
import moment from 'moment'

/**
 * This function is used to prepare email payload for both "Hosting/Invitation request" and "Requester Notification"
 * @param {string} hostingId
 * @param {boolean} isNotifyingRequester
 */
export default async function hostingEmailParts(
  hostingId,
  isNotifyingRequester
) {
  const hosting = await models.Hosting.findById(hostingId)
    .populate('host')
    .populate('guest')

  let sender =
    hosting.type === HostingType.INVITATION ? hosting.host : hosting.guest
  let recipient =
    hosting.type === HostingType.INVITATION ? hosting.guest : hosting.host

  // If the purpose of this email is to notify "Requester",
  // We have to flip sender and recipient
  // So that:
  // if it's invitation we will send to host
  // if it's request we will send to the guess
  if (isNotifyingRequester) {
    ;[sender, recipient] = [recipient, sender]
  }

  const hostParts =
    hosting.type === HostingType.INVITATION
      ? hosting.hostParts
      : hosting.guestParts
  const type =
    hosting.type === HostingType.INVITATION ? 'INVITATION' : 'REQUEST'
  const hostingDate = await models.HostingDate.findOne({ date: hosting.date })

  // in order to prevent date shifting because of difference in timezone
  // we can add 12 hours to that day, so that time corrections won't change the date
  if (hostingDate.date) {
    hostingDate.date.setUTCHours(12, 0, 0)
  }

  const apiDate = {
    date: hostingDate.date,
    hebrewDate: hosting.hebrewDate,
    englishHebrewDate: hosting.englishHebrewDate,
    type: hostingDate.type === 'shabbat' ? 'SHABBAT' : 'YOMTOV',
    description: hostingDate.diaspora.parsha,
    hebrewDescription: hostingDate.diaspora.hebrewParsha,
    local: 'US',
  }
  const senderHistory = hosting.statusHistory.filter((history) => {
    return history.profile === sender._id
  })
  let hostingType = hosting.type === HostingType.INVITATION ? 'guest' : 'host'
  // If the purpose of this email is to notify "Requester",
  // We have to flip hosting type, so that "guest" will become "host"
  // and "host" will become "guest"
  if (isNotifyingRequester) {
    hostingType = hostingType === 'guest' ? 'host' : 'guest'
  }
  const body = {
    senderId: sender._id,
    senderFullName: `${sender.firstName} ${sender.lastName}`,
    senderProfileUrl: `${FRONTEND_URL}/profile/${sender.handle}`,
    senderAvatarUrl: await getAvatar(sender, THUMBNAILS.MEDIUM),
    senderLocation: getLocationString(sender, false),
    recipientId: recipient._id,
    recipientFirstName: recipient.firstName,
    recipientEmail: recipient.email,
    mutualFriendsAmount: await getMutualFriendProfileCount({
      profileId: sender._id,
      activeProfileId: recipient._id,
    }),
    hostParts,
    note: senderHistory ? senderHistory[senderHistory.length - 1].note : '',
    type,
    date: apiDate,
    respondActionRedirectUrl: `${FRONTEND_URL}/planner/${hostingType}/${moment
      .utc(hosting.date)
      .format('YYYY-MM-DD')}/${hosting.id}`,
    status: hosting.status.toUpperCase(),
  }
  return {
    sender,
    recipient,
    body,
  }
}
