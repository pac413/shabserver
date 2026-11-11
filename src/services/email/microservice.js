import request from 'request-promise'
import { LEGACY_API_URL, DELIVER_EMAILS, TESTING_EMAILS } from 'Utils/globals'
import { createTokenForMicroservice } from 'Utils/token'
import { getRecipientProfileSetting } from './helpers'

export const CommentLikeTargetType = Object.freeze({
  ON_COMMENT: 0,
  ON_POST: 1,
})

export const sendEmail = async (endpoint, body) => {
  const options = {
    method: 'POST',
    uri: `${LEGACY_API_URL}/app/${endpoint}`,
    body,
    json: true,
  }

  // do not send email if email is mocked
  // mocked emails look like: something+@shabbat.com
  for (const field in body) {
    if (
      field.toLowerCase().includes('email') &&
      typeof body[field] === 'string' &&
      body[field].startsWith('noemail+') &&
      body[field].endsWith('@shabbat.com')
    ) {
      console.info(
        `Email was skipped because of mocked ${body[field]}`,
        endpoint,
        body
      )
      return
    }
  }

  body.token = await createTokenForMicroservice()

  // if set to false email won't be delivered unless recipient is whitelisted
  // true - will deliver to anyone
  body.testingMode = !DELIVER_EMAILS
  body.destinationEmails = TESTING_EMAILS

  switch (process.env.NODE_ENV) {
    case 'local':
    case 'test':
    case 'development':
      body.testEnvironment = 'DEV'
      break
    case 'staging':
      body.testEnvironment = 'QA'
      break
    case 'uat':
      body.testEnvironment = 'UAT'
      break
  }

  return request.post(options)
}

export const sendFriendRequest = async (body) => {
  const { friendRequestByEmail } = await getRecipientProfileSetting(body)
  const endpoint = 'send-friend-request-email'
  return friendRequestByEmail && sendEmail(endpoint, body)
}

export const sendRequestReference = (body) => {
  const endpoint = 'send-profile-references-request-email'
  return sendEmail(endpoint, body)
}

export const sendReferences = (body) => {
  const endpoint = 'accept-profile-references-request-email'
  return sendEmail(endpoint, body)
}

export const sendMessageRequest = (body) => {
  const endpoint = 'send-message-request-email'
  return sendEmail(endpoint, body)
}

export const sendAcceptMessageRequest = (body) => {
  const endpoint = 'accept-message-request-email'
  return sendEmail(endpoint, body)
}

export const sendAcceptFriendRequest = async (body) => {
  const { friendRequestByEmail } = await getRecipientProfileSetting(body)
  const endpoint = 'accept-friend-request-email'
  return friendRequestByEmail && sendEmail(endpoint, body)
}

export const sendEmailVerificationRequest = (body) => {
  const endpoint = 'verify-email'
  return sendEmail(endpoint, body)
}

/**
 * This is now replaced by new email service
 */
// export const sendNewHostingsEmail = async (body) => {
//   const { invitesByEmail } = await getRecipientProfileSetting(body)
//   const endpoint = 'new-hostings-email'
//   return invitesByEmail && sendEmail(endpoint, body)
// }

export const sendUpdatedHostingsEmail = async (body) => {
  const { invitesByEmail } = await getRecipientProfileSetting(body)
  const endpoint = 'update-hostings-email'
  return invitesByEmail && sendEmail(endpoint, body)
}

export const sendResetPassword = (body) => {
  const endpoint = 'reset-password-email'
  return sendEmail(endpoint, body)
}

export const sendMatchmakingEmail = (body) => {
  const endpoint = 'send-matchmaking-email'
  return sendEmail(endpoint, body)
}

export const sendEndorsementEmail = (body) => {
  const endpoint = 'endorsement-posted-email'
  return sendEmail(endpoint, body)
}

export const sendLikeOnPostEmail = async (body) => {
  const { likesByEmail } = await getRecipientProfileSetting(body)
  const endpoint = 'new-like-posted-email'
  body.likeType = CommentLikeTargetType.ON_POST
  return likesByEmail && sendEmail(endpoint, body)
}

export const sendNewLikeOnCommentEmail = async (body) => {
  const { likesByEmail } = await getRecipientProfileSetting(body)
  const endpoint = 'new-like-posted-email'
  body.likeType = CommentLikeTargetType.ON_COMMENT
  return likesByEmail && sendEmail(endpoint, body)
}

export const sendNewCommentOnPostEmail = async (body) => {
  const { commentsByEmail } = await getRecipientProfileSetting(body)
  const endpoint = 'new-comment-posted-email'
  body.likeType = CommentLikeTargetType.ON_POST
  return commentsByEmail && sendEmail(endpoint, body)
}

export const sendNewCommentOnCommentEmail = async (body) => {
  const { commentsByEmail } = await getRecipientProfileSetting(body)
  const endpoint = 'new-comment-posted-email'
  body.likeType = CommentLikeTargetType.ON_COMMENT
  return commentsByEmail && sendEmail(endpoint, body)
}

export const sendReportMemberEmail = async (body) => {
  const endpoint = 'admin-report-member-email'
  return sendEmail(endpoint, body)
}

export const requestPrivateDatingProfile = async (body) => {
  const endpoint = 'dating-profile-private-request-email'
  return sendEmail(endpoint, body)
}

export const requestEmailDatingProfile = async (body) => {
  const endpoint = 'dating-profile-email'
  return sendEmail(endpoint, body)
}

export const requestDownloadDatingProfile = async (body) => {
  const endpoint = 'dating-profile-download'
  return sendEmail(endpoint, body)
}

export const acceptPrivateDatingProfileRequest = async (body) => {
  const endpoint = 'accept-dating-profile-private-request-email'
  return sendEmail(endpoint, body)
}

export const sendFlaggedContentEmail = async (body) => {
  const endpoint = 'admin-flagged-content-email'
  return sendEmail(endpoint, body)
}

export const sendNewProfileViewEmail = async (body) => {
  const endpoint = 'new-profile-view-email'
  return sendEmail(endpoint, body)
}

/**
 * Send email for a new message that has been unread.
 * API documentation: https://old.shabbat.com/Help/Api/POST-api-app-new-message-email
 * @param {*} body Params mentioned in the api documentation above + profileId(Recipient profile id)
 */
export const sendNewMessageEmail = async (body) => {
  const endpoint = 'new-message-email'
  const { profileId, ...mainBody } = body
  const { messagesByEmail } = await getRecipientProfileSetting({ profileId })
  if (messagesByEmail) {
    await sendEmail(endpoint, mainBody)
  }
}

/**
 * Send email for endorsement solicit.
 * API Documentation: https://old.shabbat.com/Help/Api/POST-api-app-endorsement-solicit-email
 * @param {*} body Params mentioned in the api documentation above
 */
export const sendEndorsementSolicitEmail = async (body) => {
  const endpoint = 'endorsement-solicit-email'
  return sendEmail(endpoint, body)
}
