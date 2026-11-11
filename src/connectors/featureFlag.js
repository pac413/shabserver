import { Roles } from 'Utils/globals'

export const getGlobalFeatureFlags = () => ({
  postViewEnabled: process.env.POST_VIEW_ENABLED === 'true' || false,
  broadcastMessaingEnabled:
    (process.env.BROADCAST_MESSAGING_ENABLED === 'true') | false,
})

export const getFeatureFlagsByProfileId = ({ role }) => {
  const featureFlags = getGlobalFeatureFlags()
  return {
    postViewEnabled: featureFlags.postViewEnabled,
    broadcastMessaingEnabled:
      featureFlags.broadcastMessaingEnabled && role === Roles.Admin,
  }
}
