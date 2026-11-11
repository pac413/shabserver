import models from 'Models'

export async function upsertFollower(profileId, followerProfileId, type) {
  const existingFollower = await models.Follower.findOne({
    profileId,
    followerProfileId,
  })

  if (!existingFollower) {
    const newFollower = await models.Follower.create({
      profileId,
      followerProfileId,
      type: [type],
    })
    return { existing: false, follower: newFollower }
  }

  if (existingFollower.type.includes(type)) {
    return { existing: true, follower: existingFollower }
  }

  existingFollower.type.push(type)
  await existingFollower.save()

  return { existing: true, follower: existingFollower }
}
