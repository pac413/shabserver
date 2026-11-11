import models from 'Models'

export const disposeExpiredRefreshTokens = async () => {
  console.log('disposing expired refresh tokens...')
  const result = await models.RefreshToken.deleteMany({
    expires: {
      $lt: new Date(),
    },
  })
  console.log(`disposed ${result.deletedCount} expired refresh tokens...`)
}
