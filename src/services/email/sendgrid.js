import sgMail from '@sendgrid/mail'
import {
  NO_REPLY_EMAIL,
  OLAMI_EMAIL,
  SENDGRID_API_KEY,
  SENDGRID_EMAIL_TEMPLATES,
} from 'Utils/globals'
import {
  adjustRecipientEmail,
  buildDate,
  buildPartsText,
  getRecipientProfileSetting,
} from './helpers'

const sendEmail = async (msg) => {
  sgMail.setApiKey(SENDGRID_API_KEY)
  return sgMail.send(msg)
}

/**
 * This is a Node.js version of an existing microservice that sends a hosting email
 * @param data
 */
export const sendNewHostingsEmail = async (data) => {
  const { invitesByEmail } = await getRecipientProfileSetting(data)
  if (!invitesByEmail) {
    return
  }

  const displayDate = buildDate(data.date)
  const parts = buildPartsText(data.hostParts)

  let note = ''
  let subject = ''
  let mainSentence = ''
  let detailSentence = ''
  if (data.note) {
    note =
      '<br><br>' +
      data.senderFullName +
      ' included the following message:<br><br><b>' +
      data.note +
      '</b><br><br>'
  }
  if (data.type === 'INVITATION') {
    subject = 'New invite from Shabbat.com' // "You've been invited for " + CalUtils.Display_Word_Shabbos(sm.Date) + ".";
    mainSentence =
      'Greetings ' +
      data.recipientFirstName +
      ',<br><br>' +
      data.senderFullName +
      ' has invited you for' +
      ' ' +
      displayDate +
      '.' +
      parts +
      note
    detailSentence =
      'Please respond to this invite below. You can accept, decline, or simply send a message.'
  } else {
    // REQUEST
    subject = 'New hosting request from Shabbat.com'
    mainSentence =
      'Greetings ' +
      data.recipientFirstName +
      ',<br><br>' +
      "<a href='" +
      data.senderProfileUrl +
      "' >" +
      data.senderFullName +
      '</a> is requesting hosting for ' +
      ' ' +
      displayDate +
      '.' +
      parts +
      note
    detailSentence =
      'Please respond to this request below. You can accept, decline, or simply send a message.'
  }
  const recipientEmail = adjustRecipientEmail(data.recipientEmail)

  await sendEmail({
    from: {
      email: NO_REPLY_EMAIL,
      name: 'Shabbat.com',
    },
    templateId: SENDGRID_EMAIL_TEMPLATES.HOSTING,
    personalizations: [
      {
        to: { email: recipientEmail },
        dynamicTemplateData: {
          subject,
          mainSentence,
          detailSentence,
          profileLink: data.senderProfileUrl,
          imageSrc: data.senderAvatarUrl,
          displayName: data.senderFullName,
          location: data.senderLocation,
          respondLinkTitle: 'Please Respond &nbsp; &rarr;',
          respondLink: data.respondActionRedirectUrl,
          copyrightDate: new Date().getFullYear(),
        },
      },
    ],
  })
}

export const sendOlamiOrgEmail = async (data) => {
  const { email, firstName, lastName, location, age } = data
  const recipientEmail = adjustRecipientEmail(OLAMI_EMAIL)

  await sendEmail({
    from: {
      email: NO_REPLY_EMAIL,
      name: 'Shabbat.com',
    },
    templateId: SENDGRID_EMAIL_TEMPLATES.OLAMI,
    personalizations: [
      {
        to: { email: recipientEmail },
        subject: 'New Jewish learning prospect from Shabbat.com',
        dynamicTemplateData: {
          firstName,
          lastName,
          email,
          location,
          age,
        },
      },
    ],
  })
}
