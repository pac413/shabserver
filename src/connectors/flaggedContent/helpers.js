export const resolveCommentResourceId = (resourceId) => {
  const segments = resourceId.split('__')
  // Comment Reply
  if (segments.length === 3) {
    return {
      id: segments[2],
      postId: segments[0],
      commentId: segments[1],
    }
  } else if (segments.length === 2) {
    return {
      id: segments[1],
      postId: segments[0],
    }
  }

  throw new Error('INVALID_FLAG_POST_RESOURCE_ID', { resourceId })
}
