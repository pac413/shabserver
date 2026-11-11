import { updateNotificationStatus } from 'Connectors/notification'

export default {
  updateNotificationStatus: async (_, { input }, { activeProfileId }) => {
    const result = await updateNotificationStatus(input, {
      activeProfileId,
    })
    return result
  },
}
