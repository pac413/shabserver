import models from 'Models'
export default async function deleteSponsoredPost({ postId }) {
  const post = await models.SponsoredPost.findOne({ _id: postId })
  if (!post) {
    throw new Error(`No sponsored post related with _id: ${postId}`)
  }

  // TODO: Only allow admin to remove posts

  await models.Post.deleteOne({ _id: postId })

  return { postId }
}
