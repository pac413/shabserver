import { addSiteRole, updateProfile } from 'Connectors/profile'
import {
  Genders,
  ProfileStatuses,
  ReligiousAffiliations,
  SiteRoles,
  Title,
} from 'Models/profile/enums'
import models from 'Models'
import { addUserToMailchimp } from 'Services/mailchimp'
import { sendOlamiOrgEmail } from 'Services/email'
import { ADD_NEW_USERS_TO_MAILCHIMP, HIGH_MIN_FRAUD_SCORE } from 'Utils/globals'
import { calculateAge } from 'Utils/profile'
import { getLocationDisplay } from 'Utils/location'

export default async function completeRegister(input, context) {
  const {
    siteRoles,
    languageCode,
    primaryLocale,
    emailOptIn,
    ...profilePayload
  } = input
  const { activeProfileId } = context

  const activeProfile = await models.Profile.findById(activeProfileId)

  // Create siteRole profiles with `guest` profile added by default
  if (!siteRoles.includes(SiteRoles.GUEST)) {
    siteRoles.push(SiteRoles.GUEST)
  }
  await Promise.all(
    siteRoles.map((siteRole) => addSiteRole(siteRole, activeProfileId))
  )

  // Update profile
  if (input.title) {
    profilePayload.gender = [Title.MRS, Title.MS].includes(input.title)
      ? Genders.FEMALE
      : Genders.MALE
  }
  if (input.occupationId) {
    const occupation = await models.Occupation.findOne({
      occupationId: input.occupationId,
      lang: 'en',
    })
    if (occupation) {
      profilePayload.occupation = occupation.name
    }
  }
  profilePayload.accountStatus = ProfileStatuses.ACTIVE
  profilePayload.olamiContactMe = emailOptIn

  // Apply restrictions if minFraudRiskScore is greater than HIGH_MIN_FRAUD_SCORE
  if (
    activeProfile.riskAssessment &&
    activeProfile.riskAssessment.minFraudRiskScore > HIGH_MIN_FRAUD_SCORE
  ) {
    console.log(
      `Applying auto restrictions due to minFraudRiskScore(${activeProfile.riskAssessment.minFraudRiskScore}) is greater than ${HIGH_MIN_FRAUD_SCORE}`
    )
    profilePayload.restrictions = {
      messaging: true,
      actions: true,
      feed: true,
      search: true,
    }
  }

  const updatedProfile = await updateProfile(
    {
      ...profilePayload,
      religiousAffiliation:
        profilePayload.religiousAffiliation || ReligiousAffiliations.ORTHODOX,
      primaryLocale: primaryLocale || languageCode || 'en',
    },
    {
      profileId: activeProfileId,
    }
  )

  if (ADD_NEW_USERS_TO_MAILCHIMP) {
    addUserToMailchimp({
      firstName: updatedProfile.firstName,
      lastName: updatedProfile.lastName,
      email: updatedProfile.email,
      address: updatedProfile.location?.address,
      city: updatedProfile.location?.city,
      state: updatedProfile.location?.state,
      zip: updatedProfile.location?.zipcode,
      country: updatedProfile.location?.country,
      birthday: updatedProfile.birthday,
    })
  }

  if (emailOptIn) {
    sendOlamiOrgEmail({
      email: updatedProfile.email,
      firstName: updatedProfile.firstName,
      lastName: updatedProfile.lastName,
      location: getLocationDisplay(updatedProfile.location),
      age: calculateAge(updatedProfile.birthday),
    })
  }

  return { profile: updatedProfile }
}
