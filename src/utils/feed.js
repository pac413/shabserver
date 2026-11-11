import { truncateWords } from './string'

export const parseContent = (content) => {
  if (typeof content === `string`) {
    return { content }
  }
  if (typeof content.name === `string`) {
    return {
      name: content.name,
      variables: content.variables,
    }
  }
  return {
    content: content.content,
  }
}

export const prepareContent = (post) => {
  let content = post.content.content

  if (post.webScraped) {
    content = post.webScraped.title
  }

  if (post.hasMedia) {
    content = 'uploaded picture/video'
  }

  return content ? truncateWords(content, 10) : ''
}
