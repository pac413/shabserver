import { UserAccountDeleteReasons } from 'Models/adminNote/enums'
import { ConversationParticipantStatus } from 'Models/conversation/enums'
import { MatchParty } from 'Models/datingMatch/enums'
import {
  DatingProfileBodyType,
  EmploymentStatus,
  EthnicBackground,
  Frequency,
  Hashkafa,
  Importance,
  JewishEducation,
  KeepKosher,
  Language,
  MaritalStatus,
  PersonalityTrait,
  SecularEducation,
} from 'Models/datingProfile/enums'
import { EndorsableSiteRoles } from 'Models/endorsement/enums'
import { FlaggedContentType } from 'Models/flaggedContent/enums'
import { GuestProfileStatus } from 'Models/guestProfile/enums'
import { HostingPart, HostingStatus, HostingType } from 'Models/hosting/enums'
import { HostingDateTypes } from 'Models/hostingDate/enums'
import {
  HostProfileReserveBy,
  HostProfileStatus,
} from 'Models/hostProfile/enums'
import {
  MediaStatus,
  MediaSubType,
  MediaType,
  VideoOrientation,
} from 'Models/media/enums'
import { MessageStatus, MessageType } from 'Models/message/enums'
import {
  NotificationActionStyle,
  NotificationActionType,
  NotificationStatus,
  NotificationType,
} from 'Models/notification/enums'
import { PostStatus, PostType, SubscribeToPostType } from 'Models/post/enums'
import {
  Genders,
  ProfileFlags,
  ProfileFlagScopes,
  ReligiousAffiliations,
  SiteRoles,
  SupportedLocales,
  Title,
  WhoCanFriendValues,
} from 'Models/profile/enums'
import {
  FeedContentSetting,
  MessagingPrivacyTiers,
  PostPrivacySetting,
} from 'Models/profileSettings/enums'
import { ReferenceRelationship } from 'Models/reference/enums'
import {
  SponsoredPostStatus,
  SponsoredPostType,
} from 'Models/sponsoredPost/enums'
import { EVENTS } from 'Subscriptions'

export default {
  BooleanProfileSetting: {
    ANONYMOUS_BROWSING: 'anonymousBrowsing',
    FRIEND_REQUEST_NEEDED: 'friendRequestNeeded',
    HIDE_ALL_MEDIA: 'hideAllMedia',
    MESSAGES_BY_EMAIL: 'messagesByEmail',
    MESSAGES_BY_PUSH: 'messagesByPush',
    INVITES_BY_EMAIL: 'invitesByEmail',
    INVITES_BY_PUSH: 'invitesByPush',
    PROFILE_VIEWS_BY_EMAIL: 'profileViewsByEmail',
    PROFILE_VIEWS_BY_PUSH: 'profileViewsByPush',
    NEW_FRIENDS_BY_EMAIL: 'newFriendsByEmail',
    NEW_FRIENDS_BY_PUSH: 'newFriendsByPush',
    LIKES_BY_EMAIL: 'likesByEmail',
    LIKES_BY_PUSH: 'likesByPush',
    COMMENTS_BY_EMAIL: 'commentsByEmail',
    COMMENTS_BY_PUSH: 'commentsByPush',
    FRIEND_REQUEST_BY_EMAIL: 'friendRequestByEmail',
    FRIEND_REQUEST_BY_PUSH: 'friendRequestByPush',
    WEEKLY_ACTIVITY_SUMMARY_EMAIL: 'weeklyActivitySummaryEmail',
    PAGINATED_SEARCH_RESULT: 'paginatedSearchResult',
  },
  ConversationParticipantStatus,
  DatingProfileBodyType,
  EmploymentStatus,
  EndorsementSiteRole: EndorsableSiteRoles,
  EthnicBackground,
  FeedContentSetting,
  FeedEvent: {
    FEED_ITEM_CREATED: EVENTS.POST.CREATED,
    FEED_ITEM_UPDATED: EVENTS.POST.UPDATED,
    FEED_ITEM_DELETED: EVENTS.POST.DELETED,
    FEED_ITEM_MEDIA_UPLOADED: EVENTS.POST.MEDIA_UPLOADED,
    FEED_ITEM_MEDIA_PROCESSED: EVENTS.POST.MEDIA_PROCESSED,
  },
  FeedItemStatus: PostStatus,
  FlagCode: ProfileFlags,
  FlagScope: ProfileFlagScopes,
  Gender: Genders,
  GuestProfileStatus,
  FlaggedContentType,
  Frequency,
  Hashkafa,
  HostingDateType: HostingDateTypes,
  HostingRole: {
    HOST: SiteRoles.HOST,
    GUEST: SiteRoles.GUEST,
  },
  HostingPart,
  HostingStatus,
  HostingType,
  HostProfileStatus,
  HostReserveBy: HostProfileReserveBy,
  Importance,
  JewishEducation,
  KeepKosher,
  Language,
  Locale: SupportedLocales,
  MaritalStatus,
  MatchParty,
  MediaSubType,
  MediaStatus,
  MediaType,
  MessageStatus,
  MessageType,
  MessagingPrivacyTier: MessagingPrivacyTiers,
  NotificationActionStyle,
  NotificationActionType,
  NotificationStatus,
  NotificationType,
  PersonalityTrait,
  PostPrivacySetting,
  PostType,
  ReferenceRelationship,
  ReligiousAffiliation: ReligiousAffiliations,
  SecularEducation,
  SiteRole: SiteRoles,
  SponsoredPostStatus,
  SponsoredPostType,
  SubscribeToFeedType: SubscribeToPostType,
  Title,
  UserAccountDeleteReason: UserAccountDeleteReasons,
  VideoOrientation,
  WhoCanFriendValues,
}
