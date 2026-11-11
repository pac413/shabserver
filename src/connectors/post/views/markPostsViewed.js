import createView from './createView'

export default async function markPostsViewed(posts, context) {
  return Promise.all(posts.map((post) => createView(post, context)))
}
