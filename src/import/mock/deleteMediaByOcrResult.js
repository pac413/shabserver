import models from 'Models'

export const refineOcrResult = async () => {
  const candidates = await models.OcrResult.find({ isTextImage: true }).lean()
  candidates.forEach()
}
