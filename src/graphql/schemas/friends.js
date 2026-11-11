import { gql } from 'apollo-server-express'

export default gql`
  """
  enums should be all caps
  """
  enum FriendsType {
    mutual
    all
    pending
  }
  """
  enums should be all caps
  """
  enum FriendsOrderBy {
    mutual
    dateActive
  }
  """
  enums should be all caps
  """
  enum FriendResponseStatus {
    friends
    pending
  }

  type Friendship {
    status: FriendResponseStatus
    id: ID
    requester: ID
  }
  """
  to get my friend set targetProfileId to activeProfileId
  """
  input FriendsInput {
    """
    the name type is confusing - it is not a type but a query parameter
    """
    type: FriendsType!
    """
    Use ID not String
    """
    targetProfileId: String
    orderBy: FriendsOrderBy
    limit: Int = 10
    offset: Int = 0
  }

  type FriendsPayload {
    profiles: [Profile]
    """
    totalCount is never null so it should have !
    """
    totalCount: Int
    """
    When getting activeProfiles friends mutualCount is null otherwise it
    contains a count. The payload structure is dependent on the input
    and that should indicate that the query should be split up
    """
    mutualCount: Int
  }

  type FriendsV2Payload {
    profiles: [SimpleProfile]
    """
    totalCount is never null so it should have !
    """
    totalCount: Int
    """
    When getting activeProfiles friends mutualCount is null otherwise it
    contains a count. The payload structure is dependent on the input
    and that should indicate that the query should be split up
    """
    mutualCount: Int
  }

  extend type Query {
    """
    Queries should be semantic. I should be able to look at the query and
    immediately understand what it returns. The friends query below is not
    semantic because what it returns (friends or friend requests) is dependent
    on the input.
    This query needs to be split up into
    myFriends ( or friends )
    profileFriends
    pendingReceivedFriendRequests
    pendingSendFriendRequests
    """
    friends(input: FriendsInput!): FriendsPayload
    friendsV2(input: FriendsInput!): FriendsV2Payload
  }

  input AddFriendInput {
    profileId: ID!
  }

  type AddFriendPayload {
    id: ID!
    status: FriendResponseStatus!
    profile: Profile!
  }

  input RemoveFriendInput {
    requestId: ID!
  }

  input CancelFriendRequestInput {
    requestId: ID!
  }

  input ApproveFriendRequestInput {
    requestId: ID!
  }

  type ApproveFriendRequestPayload {
    status: FriendResponseStatus!
    profile: Profile!
  }

  input RejectFriendRequestInput {
    requestId: ID!
  }

  type RejectFriendRequestPayload {
    profile: Profile!
  }

  extend type Mutation {
    addFriend(input: AddFriendInput!): AddFriendPayload!
    removeFriend(input: RemoveFriendInput!): Boolean!
    cancelRequest(input: CancelFriendRequestInput!): Boolean!

    approveRequest(
      input: ApproveFriendRequestInput!
    ): ApproveFriendRequestPayload!
    rejectRequest(input: RejectFriendRequestInput!): RejectFriendRequestPayload!
  }
`
