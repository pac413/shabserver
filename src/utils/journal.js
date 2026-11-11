import models from 'Models'

export const write = async (message, context, tags) => {
  return await models.Journal.create({
    message,
    tags,
    context,
  })
}
