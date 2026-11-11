import { PostType } from 'Models/post/enums'

export function bumpPostIfNeeded(post, date) {
  const createdAt = new Date(post.createdAt).getTime()
  const today = new Date().getTime()
  if (
    [
      PostType.DEFAULT,
      PostType.AVATAR_UPDATED,
      PostType.PICTURE_ADDED,
    ].includes(post.type)
  ) {
    const halfYear = 15768000000 // 182.5 * 24 * 60 * 60 * 1000
    // if the post is not older than 6 months - bump it
    if (today < createdAt + halfYear) {
      post.lastActivityAt = date
    }
  }
}
