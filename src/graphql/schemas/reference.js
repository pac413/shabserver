import { gql } from 'apollo-server-express'

export default gql`
  type Reference {
    id: ID!
    name: String!
    siteRole: SiteRole!
    phone: String
    email: String
    relationship: [ReferenceRelationship]
  }

  input ReferencesInput {
    siteRole: SiteRole
    offset: Int!
    limit: Int!
  }

  input AddReferenceInput {
    profileId: ID
    name: String!
    siteRole: SiteRole!
    phone: String
    email: String
    relationship: [ReferenceRelationship]
  }

  type AddReferencePayload {
    errors: [Error]
    reference: Reference
  }

  input DeleteReferenceInput {
    id: ID!
  }

  type DeleteReferencePayload {
    errors: [Error]
    deleted: Boolean
  }

  input UpdateReferenceInput {
    id: ID!
    name: String!
    siteRole: SiteRole!
    phone: String
    email: String
    relationship: [ReferenceRelationship]
  }

  type UpdateReferencePayload {
    errors: [Error]
    reference: Reference
  }

  input RequestReferenceInput {
    profileId: ID!
  }

  type RequestReferencePayload {
    errors: [Error]
    requested: Boolean
  }

  input ApproveReferencesRequestInput {
    requestId: ID!
  }

  type ApproveReferencesRequestPayload {
    errors: [Error]
    success: Boolean
    profile: Profile
  }

  extend type Mutation {
    addReference(input: AddReferenceInput!): AddReferencePayload!
    updateReference(input: UpdateReferenceInput!): UpdateReferencePayload!
    deleteReference(input: DeleteReferenceInput!): DeleteReferencePayload!
    requestReference(input: RequestReferenceInput!): RequestReferencePayload!
    approveReferencesRequest(
      input: ApproveReferencesRequestInput!
    ): ApproveReferencesRequestPayload!
  }
`
