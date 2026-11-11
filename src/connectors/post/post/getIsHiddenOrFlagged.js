/**
 * Calculates `isHiddenOrFlagged` of post collection
 * This field is used in general/profile feed query
 */
export function getIsHiddenOrFlagged(post) {
  const { hidden, flagged } = post

  return hidden || (flagged && flagged.length > 0)
}

export function getIsHiddenOrFlaggedComment(postComment) {
  const { hidden, flagged } = postComment

  return hidden || (flagged && flagged.length > 0)
}
