import { deleteMedia } from 'Connectors/media'
import models from 'Models'

export const refineOcrResult = async () => {
  let count = 0
  const ocrCursor = models.OcrResult.find({ isTextAvatar: true }).cursor()

  for await (const candidate of ocrCursor) {
    console.log(
      candidate.originalUrl,
      candidate.originalUrl.endsWith('/google_avatar.jpeg')
    )
    if (candidate.originalUrl.endsWith('/google_avatar.jpeg')) {
      count++
      console.log(
        `${count}: Deleting ${candidate.profileHandle}'s avatar ${candidate.mediaId}`
      )
      await deleteMedia({ id: candidate.mediaId, keepOriginal: false })
      await candidate.remove()
      console.log(
        `${count}: Updated ${candidate.profileHandle}'s avatar ${candidate.mediaId}`
      )
    }
  }

  console.log(`Found possible ${count} text avatars`)
}
