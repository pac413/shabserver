import {
  getGlobalFeatureFlags,
  getFeatureFlagsByProfileId,
} from 'Connectors/featureFlag'

export default {
  Query: {
    globalFeatureFlags: () => {
      return getGlobalFeatureFlags()
    },
    featureFlags: (_, __, context) => {
      return getFeatureFlagsByProfileId(context)
    },
  },
}
