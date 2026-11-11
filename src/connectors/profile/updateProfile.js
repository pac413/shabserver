import {
  createAvatarUpdatedPost,
  updateAvatarUpdatedPost,
} from 'Connectors/post'
import { compareOriginalMedia } from 'Connectors/media'
import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'
import models from 'Models'
import { processLocation } from 'Services/location'
import { generateHandle } from 'Utils'

export default async function updateProfile(input, { profileId }) {
  const profileInput = { ...input }
  const oldProfile = await models.Profile.findById(profileId)

  // Check if firstName or lastName is changed. If so, update handle
  if (profileInput.firstName || profileInput.lastName) {
    const firstName = profileInput.firstName || oldProfile.firstName
    const lastName = profileInput.lastName || oldProfile.lastName
    if (
      firstName !== oldProfile.firstName ||
      lastName !== oldProfile.lastName
    ) {
      // generate handle again
      const handle = await generateHandle(
        firstName,
        lastName,
        oldProfile.handle
      )
      profileInput.handle = handle
    }
  }

  // Check if location should be updated
  if (profileInput.primaryLocation) {
    const location = {
      ...oldProfile.toJSON().location,
      ...profileInput.primaryLocation,
    }
    const locationResult = await processLocation(location)
    profileInput.location = {
      ...location,
      ...locationResult,
    }
  } else if (profileInput.location && !profileInput.location.geoLocation) {
    let location = {
      ...profileInput.location,
    }
    if (location.longitude && location.latitude) {
      location.geoLocation = {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
      }
      delete location.longitude
      delete location.latitude
    } else {
      const locationResult = await processLocation(location)
      location = {
        ...location,
        ...locationResult,
      }
    }
    profileInput.location = location
  } else if (
    // Set geo type if it's missing
    profileInput.location &&
    profileInput.location.geoLocation &&
    !profileInput.location.geoLocation.type
  ) {
    profileInput.location.geoLocation.type = 'Point'
  }
  await models.Profile.updateOne({ _id: profileId }, profileInput)

  // get updated profile
  const newProfile = await models.Profile.findById(profileId).lean()
  if (input.avatar) {
    // Check if user updated avatar
    // If it's a new avatar, should create a new post
    // If it's just an edited version of the previous avatar, shouldn't create a new post
    const shouldCreateNewPost = await (async () => {
      if (oldProfile.avatar) {
        const isAvatarEdited = await compareOriginalMedia([
          oldProfile.avatar,
          input.avatar,
        ])
        if (isAvatarEdited) {
          return false
        }
        return true
      }
      return true
    })()
    if (shouldCreateNewPost) {
      await createAvatarUpdatedPost(newProfile)
    } else {
      await updateAvatarUpdatedPost(newProfile)
    }
  }

  // clear SimpleProfileLoader cache for next load
  simpleProfileLoader.clear(profileId)
  return newProfile
}
