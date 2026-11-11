import { UserInputError } from 'apollo-server-errors'

export const validatePostIdInput = (input, postIdField = 'postId') => {
  const postId = input[postIdField] || input.feedItemId
  if (!postId) {
    throw new UserInputError(`${postIdField} or feedItemId must be provided`)
  }
  input.feedItemId = postId
  input[postIdField] = postId
}
