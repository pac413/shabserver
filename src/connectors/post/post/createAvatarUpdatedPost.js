import { v4 as uuid } from 'uuid'
import { createMediaForProfileAvatarPost } from 'Connectors/media'
import { PostType } from 'Models/post/enums'
import { createPost } from './createPost'

export async function createAvatarUpdatedPost(profile) {
  console.info(`Creating AVATAR_UPDATED post for ${profile._id}`)
  if (!profile.avatar) {
    return
  }
  const { firstName, lastName } = profile
  const postId = uuid()
  const media = await createMediaForProfileAvatarPost(profile, postId)
  if (!media) {
    console.error(
      'Cannot create media for AVATAR_UPDATED Post',
      profile._id,
      profile.avatar
    )
    return
  }
  const post = await createPost(
    {
      _id: postId,
      content: {
        name: 'post.avatar-updated',
        variables: { firstName, lastName },
      },
      type: PostType.AVATAR_UPDATED,
      hasMedia: true,
      readonly: true,
    },
    { activeProfileId: profile._id }
  )
  if (!post) {
    console.error(
      'Cannot create post for AVATAR_UPDATED Post',
      profile._id,
      profile.avatar
    )
    return
  }

  console.info(`Created AVATAR_UPDATED post for ${profile._id}`, post._id)

  return post
}
