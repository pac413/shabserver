import { sendFlaggedContentEmail } from 'Services/email'
import { prepareCommonProfileEmailTemplate } from 'Utils/email'
import { FRONTEND_URL } from 'Utils/globals'

export const prepareAndSendFlaggedContentEmail = async (
  flaggedContent,
  flaggerId,
  profileFlaggedId
) => {
  const template = {
    flagger: {
      ...(await prepareCommonProfileEmailTemplate(flaggerId)),
    },
    profileFlagged: {
      ...(await prepareCommonProfileEmailTemplate(profileFlaggedId)),
    },
    reason: flaggedContent.reason,
    adminFlaggedContentUrl: `${FRONTEND_URL}/posts/status_update/${flaggedContent.resourceId}`,
  }

  await sendFlaggedContentEmail(template)
}
