import models from 'Models'

export const updateParticipantStatus = (conversation, participant, status) => {
  const matchingParticipant = conversation.participants.find(
    (p) => p.participant === participant
  )
  if (!matchingParticipant) {
    return false
  }
  matchingParticipant.status = status
  return true
}

export const validateParticipants = async (ids) => {
  const participantProfileCount = await models.Profile.countDocuments({
    _id: { $in: ids },
    'restrictions.messaging': {
      $ne: true,
    },
  })
  return participantProfileCount === ids.length
}

export const getIdsByHandles = async (handles) => {
  const ids = await models.Profile.find({ handle: { $in: handles } })
    .select({ _id: 1 })
    .lean()

  return ids.map((item) => item._id)
}
