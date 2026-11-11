import models from 'Models'

export default async function getSponsoredPostByType({ type }) {
  return models.SponsoredPost.find({ type })
}
