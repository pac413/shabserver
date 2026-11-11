import Promise from 'bluebird'
import { importMessage } from './importMessage'

export const importMessages = async (messages, profileId, importedAt) => {
  console.log({
    event: 'IMPORT_MESSAGES',
    message: `Importing ${messages.length} messages for ${profileId}`,
    profileId,
  })
  await Promise.map(
    messages,
    async (message) => importMessage(message, profileId, importedAt),
    {
      concurrency: 10,
    }
  )
}
