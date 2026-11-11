import { v4 as uuid } from 'uuid'
import { createMediaForPictureAddedPost } from 'Connectors/media'
import { PostType } from 'Models/post/enums'
import { createPost } from './createPost'

export async function createPictureAddedPost(profile, media) {
  console.info(
    `Creating PICTURE_ADDED post for ${profile._id} for ${media._id} Picture`
  )
  const { firstName, lastName } = profile
  const postId = uuid()
  const postMedia = await createMediaForPictureAddedPost({
    postId,
    media,
  })
  if (!postMedia) {
    console.error(
      'Cannot create media for PICTURE_ADDED Post',
      profile._id,
      media._id
    )
    return
  }
  const post = await createPost(
    {
      _id: postId,
      content: {
        name: 'post.new-picture-added',
        variables: { firstName, lastName },
      },
      type: PostType.PICTURE_ADDED,
      hasMedia: true,
      readonly: true,
    },
    { activeProfileId: profile._id }
  )
  if (!post) {
    console.error(
      'Cannot create post for PICTURE_ADDED Post',
      profile._id,
      profile.avatar
    )
    return
  }

  console.info(`Created PICTURE_ADDED post for ${profile._id}`, post._id)

  return post
}
