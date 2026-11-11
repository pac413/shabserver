import {
  addReference,
  deleteReference,
  updateReference,
  requestReference,
  approveReferencesRequest,
} from 'Connectors/reference'

export default {
  Query: {},

  Mutation: {
    addReference: async (_, { input }, context) => {
      const response = await addReference(input, context)
      return response
    },
    updateReference: async (_, { input }, context) => {
      const response = await updateReference(input, context)
      return response
    },
    deleteReference: async (_, { input }, context) => {
      const response = await deleteReference(input, context)
      return response
    },
    requestReference: async (_, { input }, { activeProfileId }) => {
      const requestPayload = await requestReference(activeProfileId, input)
      return requestPayload
    },

    approveReferencesRequest: async (_, { input }, { activeProfileId }) => {
      const approveRequestPayload = await approveReferencesRequest(
        activeProfileId,
        input
      )
      return approveRequestPayload
    },
  },
  Reference: {
    id: (parent) => parent._id || parent.id,
  },
}
