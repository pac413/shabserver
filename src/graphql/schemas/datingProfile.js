import { gql } from 'apollo-server-express'

export default gql`
  type DatingProfileEndorsements {
    endorsements: [Endorsement]!
    total: Int!
  }

  type DatingProfile {
    id: ID!
    aboutMe: String
    amCohen: Boolean
    amConvert: Boolean
    amSmoker: Boolean
    bodyType: DatingProfileBodyType
    childrenAgeFrom: Int
    childrenAgeTo: Int
    childrenAtHome: Boolean
    completeness: Int
    coveringHair: Boolean
    datingEmploymentStatus: EmploymentStatus
    datingJewishEducation: JewishEducation
    datingKeepKosher: KeepKosher
    datingSecularEducation: SecularEducation
    ethnicBackground: EthnicBackground
    hashkafa: Hashkafa
    haveShadchan: Boolean
    height: Int
    isPrivate: Boolean
    livingIsrael: Importance
    locationUpbringing: String
    lookingFor: String
    maritalStatus: MaritalStatus
    prayer: Frequency
    primaryLanguage: Language
    primaryPersonalityTrait: PersonalityTrait
    secondaryLanguage: Language
    secondaryPersonalityTrait: PersonalityTrait
    shadchanEmail: String
    shadchanInfo: String
    shadchanName: String
    torahLearning: Frequency
    torahObservantSince: Date
    wearSkirts: Boolean
    endorsements: [Endorsement]!
      @deprecated(reason: "use datingEndorsements field & endorsements query")
    datingEndorsements: DatingProfileEndorsements!
    references(input: ReferencesInput): [Reference]
  }

  input UpdateDatingProfileInput {
    id: ID!
    aboutMe: String
    amCohen: Boolean
    amConvert: Boolean
    amSmoker: Boolean
    bodyType: DatingProfileBodyType
    childrenAgeFrom: Int
    childrenAgeTo: Int
    childrenAtHome: Boolean
    coveringHair: Boolean
    datingEmploymentStatus: EmploymentStatus
    datingJewishEducation: JewishEducation
    datingKeepKosher: KeepKosher
    datingSecularEducation: SecularEducation
    ethnicBackground: EthnicBackground
    hashkafa: Hashkafa
    haveShadchan: Boolean
    height: Int
    isPrivate: Boolean
    livingIsrael: Importance
    locationUpbringing: String
    lookingFor: String
    maritalStatus: MaritalStatus
    prayer: Frequency
    primaryLanguage: Language
    primaryPersonalityTrait: PersonalityTrait
    secondaryLanguage: Language
    secondaryPersonalityTrait: PersonalityTrait
    shadchanEmail: String
    shadchanInfo: String
    shadchanName: String
    torahLearning: Frequency
    torahObservantSince: Date
    wearSkirts: Boolean
  }

  input DatingProfileActionInput {
    profileId: String
    requestId: String
  }

  type UpdateDatingProfilePayload {
    errors: [Error]
    datingProfile: DatingProfile
  }

  type DatingProfileActionPayload {
    success: Boolean
    data: String
    errors: [Error]
  }

  extend type Mutation {
    updateDatingProfile(
      input: UpdateDatingProfileInput!
    ): UpdateDatingProfilePayload!
    requestDatingProfile(
      input: DatingProfileActionInput!
    ): DatingProfileActionPayload!
    emailDatingProfile(
      input: DatingProfileActionInput!
    ): DatingProfileActionPayload!
    downloadDatingProfile(
      input: DatingProfileActionInput!
    ): DatingProfileActionPayload!
    acceptDatingProfileRequest(
      input: DatingProfileActionInput!
    ): DatingProfileActionPayload!
  }
`
