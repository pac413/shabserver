import mailchimp from '@mailchimp/mailchimp_marketing'
import {
  MAILCHIMP_KEY,
  MAILCHIMP_SERVER,
  MAILCHIMP_AUDIENCE_ID,
} from 'Utils/globals'

mailchimp.setConfig({
  apiKey: MAILCHIMP_KEY,
  server: MAILCHIMP_SERVER,
})

export async function addUserToMailchimp({
  email,
  firstName,
  lastName,
  address,
  city,
  state,
  country,
  zip,
  birthday,
}) {
  if (birthday) {
    birthday = new Date(birthday).toLocaleDateString('eu-US', {
      month: '2-digit',
      day: '2-digit',
    })
  }
  const payload = {
    email_address: email,
    status: 'subscribed',
    merge_fields: {
      FNAME: firstName,
      LNAME: lastName,
      BIRTHDAY: birthday,
      ADDRESS: {
        addr1: address || '-',
        city: city || '-',
        state: state || '-',
        zip: zip || '-',
        country: country || '-',
      },
    },
  }
  try {
    const response = await mailchimp.lists.addListMember(
      MAILCHIMP_AUDIENCE_ID,
      payload
    )
    console.log('A new user was added to mailchimp', response)
  } catch (e) {
    console.error('Failed to add a new user to mailchimp', payload, e)
  }
}
