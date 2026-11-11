import models from 'Models'
import { sendMatchmakingEmail } from 'Services/email'
import { prepareDataForMatchmakingTemplate } from 'Utils/email'

export const createDatingMatch = async (input, { activeProfileId }) => {
  const { guy, girl, message, party } = input

  // api call to microservice endpoint: send-matchmaking-email
  const payload = await prepareDataForMatchmakingTemplate(
    activeProfileId,
    guy,
    girl,
    message,
    party
  )
  await sendMatchmakingEmail(payload)

  // create a new DatingMatch document
  const datingMatch = await models.DatingMatch.create({
    guy,
    girl,
    message,
    party,
    matchmaker: activeProfileId,
  })
  return datingMatch
}

export async function deleteDatingMatches(profileId, shouldHardDelete = false) {
  const whereOptions = {
    $or: [{ guy: profileId }, { girl: profileId }, { matchmaker: profileId }],
  }
  if (shouldHardDelete) {
    await models.DatingMatch.deleteMany(whereOptions)
  } else {
    await models.DatingMatch.delete(whereOptions).exec()
  }
}

export async function restoreDatingMatches(profileId) {
  const whereOptions = {
    $or: [{ guy: profileId }, { girl: profileId }, { matchmaker: profileId }],
  }
  await models.DatingMatch.restore(whereOptions).exec()
}
