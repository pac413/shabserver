import getSponsoredPostByType from './getSponsoredPostByType'
import createSponsoredPost from './createSponsoredPost'
import deleteSponsoredPost from './deleteSponsoredPost'
import updateSponsoredPost from './updateSponsoredPost'
import createCommentOnSponsoredPost from './comments/createCommentOnSponsoredPost'
import createReplyOnSponsoredPostComment from './comments/createReplyOnSponsoredPostComment'
import updateCommentOnSponsoredPost from './comments/updateCommentOnSponsoredPost'
import updateReplyOnSponsoredPostComment from './comments/updateReplyOnSponsoredPostComment'
import deleteCommentOnSponsoredPost from './comments/deleteCommentOnSponsoredPost'
import deleteReplyOnSponsoredPostComment from './comments/deleteReplyOnSponsoredPostComment'
import createLikeOnSponsoredPost from './likes/createLikeOnSponsoredPost'
import deleteLikeOnSponsoredPost from './likes/deleteLikeOnSponsoredPost'
import createViewOnSponsoredPost from './views/createViewOnSponsoredPost'

export * from './deleteSponsoredPosts'
export * from './restoreSponsoredPosts'
export {
  getSponsoredPostByType,
  createSponsoredPost,
  deleteSponsoredPost,
  updateSponsoredPost,
  createCommentOnSponsoredPost,
  createReplyOnSponsoredPostComment,
  updateCommentOnSponsoredPost,
  updateReplyOnSponsoredPostComment,
  deleteCommentOnSponsoredPost,
  deleteReplyOnSponsoredPostComment,
  createLikeOnSponsoredPost,
  deleteLikeOnSponsoredPost,
  createViewOnSponsoredPost,
}
