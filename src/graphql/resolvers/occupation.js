import models from 'Models'

export default {
  Query: {
    occupations: async (parent, { lang }) => {
      return await models.Occupation.find({
        lang,
      })
    },
  },
  Occupation: {
    id: (parent, _, __) => parent.occupationId,
  },
}
