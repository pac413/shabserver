import { gql } from 'apollo-server-express'
import { countryCode } from './country'
import { flags } from './flags'
import { profileSettings } from './profileSettings'
const enums = gql`
  enum DatingProfileBodyType {
    A_FEW_EXTRA_POUNDS
    ATHLETIC_FIT
    AVERAGE_MEDIUM_BUILD
    FIRM_TONED
    LARGE_BROAD_BUILD
    LEAN_SLENDER
    MUSCULAR
    PETITE
    PROPORTIONAL
  }

  enum ConversationParticipantStatus {
    PENDING
    APPROVED
    REJECTED
    ARCHIVED
    BLOCKED
  }

  enum EmploymentStatus {
    FULL_TIME
    PART_TIME
    SELF_EMPLOYED
    UNEMPLOYED
    HOMEMAKER
    RETIRED
    WORKS_AT_HOME
    STUDENT
  }

  enum EthnicBackground {
    ASHKENAZ
    SEPHARDIC
  }

  enum Frequency {
    DAILY
    SEVERAL_TIMES_WEEKLY
    WEEKLY
    OCCASIONALLY
    INFREQUENTLY
  }

  enum Gender {
    MALE
    FEMALE
  }

  enum GuestProfileStatus {
    AVAILABLE
    ACTIVELY_LOOKING
    UNAVAILABLE_THIS_WEEK
    UNAVAILABLE
  }

  enum Hashkafa {
    YESHIVISH
    CHASSIDISH
    MO_MACHMIR
    LIBERAL_MODERN
    TRADITIONAL
    CHABAD
  }

  enum HostingDateType {
    CHOL_HAMOED
    SHABBAT
    YOMTOV
    WEEKDAY
  }

  enum HostingPart {
    NIGHT
    DAY
    THIRD
    MELAVE_MALKA
    LODGING
  }

  enum HostingType {
    INVITATION
    REQUEST
  }

  enum HostingRole {
    HOST
    GUEST
  }

  enum HostingStatus {
    PENDING
    ACCEPTED
    DECLINED
  }

  enum HostingViewStatus {
    ALL
    ACCEPTED
    DECLINED
    PENDING
    PENDING_ACCEPTED
  }

  enum HostingViewType {
    ALL
    INVITATION
    REQUEST
  }

  enum HostProfileStatus {
    AVAILABLE
    ACTIVELY_LOOKING
    UNAVAILABLE_THIS_WEEK
    UNAVAILABLE
  }

  enum HostReserveBy {
    SUNDAY
    MONDAY
    TUESDAY
    WEDNESDAY
    THURSDAY
    FRIDAY
    LAST_MINUTE
  }

  enum Importance {
    NOT_IMPORTANT
    IMPORTANT
    VERY_IMPORTANT
    NOT_AN_OPTION
    A_POSSIBILITY
  }

  enum JewishEducation {
    YESHIVA_OR_SEMINARY
    SHIURIM_CHAVRUSA
    ORTHODOX_DAY_SCHOOL
    HEBREW_SCHOOL
    READING
    NONE
  }

  enum KeepKosher {
    COMPLETELY
    IN_THE_HOME_ONLY
    KOSHER_MEAT_ONLY
    I_DO_NOT_KEEP_KOSHER
  }

  enum Language {
    en
    he
    es
    yi
    ru
    fr
    fa
    ar
    bg
    ch
    hr
    cs
    da
    nl
    fi
    de
    el
    hi
    hu
    it
    jp
    ko
    no
    pl
    pt
    pa
    ro
    sv
    th
    uk
  }

  enum MaritalStatus {
    NEVER_MARRIED
    DIVORCED
    WIDOWED
  }

  enum MessageType {
    TEXT
    AUDIO
    VIDEO
    IMAGE
    NEW_FRIENDS
    NEW_HOSTING
  }

  enum MessageStatus {
    PENDING
    SENT
    BLOCKED
    DELIVERED
    READ
  }

  enum NotificationType {
    PROFILE_VIEW
    FRIEND_REQUEST
    FRIEND_REQUEST_APPROVED
    FRIEND_REQUEST_REJECTED
    NEW_MESSAGE
    MESSAGE_REQUEST
    MESSAGE_REQUEST_APPROVED
    MESSAGE_REQUEST_REJECTED
    POST_LIKED
    POST_COMMENTED
    POST_COMMENT_LIKED
    POST_COMMENT_COMMENTED
    HOSTING_REQUEST
    HOSTING_REQUEST_APPROVED
    HOSTING_REQUEST_REJECTED
    INVITE_REQUEST
    INVITE_REQUEST_APPROVED
    INVITE_REQUEST_REJECTED
    PROFILE_ENDORSED
    DATING_PROFILE_REQUEST
    POST_PICTURE_PROCESSED
    POST_VIDEO_PROCESSED
    PROFILE_FOLLOW
    HOST_ENDORSEMENT_REQUEST
    GUEST_ENDORSEMENT_REQUEST
    MESSAGE_REACTION
  }

  enum NotificationStatus {
    DISMISSED
    VIEWED
    READ
    NEW
  }

  enum NotificationActionStyle {
    PRIMARY
    SECONDARY
    LINK
    DANGER
    WARNING
    SUCCESS
    INFO
    LIGHT
    DARK
  }

  enum NotificationActionType {
    VIEW_PROFILE
    VIEW_MESSAGE
    VIEW_POST
    ACCEPT_FRIEND_REQUEST
    DELETE_FRIEND_REQUEST
    ACCEPT_DATING_REQUEST
    ACCEPT_HOSTING_REQUEST
    DELETE_HOSTING_REQUEST
    RESPOND_HOSTING_REQUEST
    ACCEPT_INVITE_REQUEST
    DELETE_INVITE_REQUEST
    RESPOND_INVITE_REQUEST
    ACCEPT_MESSAGE_REQUEST
    DELETE_MESSAGE_REQUEST
    ACCEPT_HOST_ENDORSEMENT_REQUEST
    DELETE_HOST_ENDORSEMENT_REQUEST
    ACCEPT_GUEST_ENDORSEMENT_REQUEST
    DELETE_GUEST_ENDORSEMENT_REQUEST
    VIEW_ENDORSEMENT
    ENDORSE_BACK
  }

  enum PersonalityTrait {
    ADVENTUROUS
    EASYGOING
    GO_GETTER
    INTENSE
    METICULOUS
    NURTURING
    PEOPLE_PERSON
    PRACTICAL
    QUIET
    SENSITIVE
  }

  enum ReferenceRelationship {
    FRIEND
    COLLEAGUE
    MENTOR
    NEIGHBOR
    RABBI
  }

  enum ReligiousAffiliation {
    CONSERVATIVE
    CONSERVADOX
    CONVERSION
    GENTILE
    ORTHODOX
    REFORM
    RENEWAL
    RECONSTRUCTIONIST
    UNAFFILIATED
  }

  enum Role {
    HOST
    GUEST
  }

  enum SiteRole {
    DATING
    GUEST
    HOST
    MATCHMAKING
  }

  enum Title {
    MR
    MRS
    MS
    DOCTOR
    RABBI
  }

  enum SecularEducation {
    ELEMENTARY
    HIGH_SCHOOL
    SOME_COLLEGE
    VOCATIONAL_TECHNICAL_TRAINING
    ASSOCIATES_DEGREE
    BACHELORS_DEGREE
    MASTERS_DEGREE
    LAW_DEGREE
    MEDICAL_DEGREE
    DOCTORAL_PHD
  }

  enum SuggestedProfilesCriteria {
    OCCUPATION
  }

  enum WhoCanFriendValues {
    EVERYONE
    NO_ONE
    NOT_NEEDED
  }

  enum MatchParty {
    GUY
    GIRL
    BOTH
  }
  enum ProfileFriendStatus {
    """
    current friend
    """
    FRIEND
    """
    request is not needed. can be unilaterally befriended
    """
    FRIENDABLE
    """
    request is needed
    """
    REQUEST
    """
    request is pending profiles acceptance
    """
    REQUESTED
    """
    request is pending your acceptance
    """
    ACCEPT
  }

  enum ProfileMessageStatus {
    MESSAGEABLE
    UN_MESSAGEABLE
    REQUEST
  }

  enum SponsoredPostType {
    DEFAULT
  }

  enum SponsoredPostStatus {
    ACTIVE
    PENDING
  }

  enum PostType {
    DEFAULT
    DATING_PROFILE_UPDATED
    BIRTHDAY_TODAY
    SECURED_HOSTING
    POSTED_ENDORSEMENT
    ENDORSMENT_ADDED_TO_PROFILE
    AVATAR_UPDATED
    AVATAR_DELETED
    PICTURE_ADDED
    JOB_POSTING
  }

  enum FeedItemStatus {
    PENDING
    ACTIVE
  }

  enum FeedEvent {
    FEED_ITEM_CREATED
    FEED_ITEM_UPDATED
    FEED_ITEM_DELETED
    FEED_ITEM_MEDIA_UPLOADED
    FEED_ITEM_MEDIA_PROCESSED
  }

  enum MediaType {
    PICTURE
    VIDEO
    AUDIO
    PDF
    WORD
  }

  enum MediaSubType {
    ORIGINAL
    AVATAR
    WALLPAPER
    MESSAGE
    PROFILE
    POST
    COMMENT
    COMMENT_REPLY
  }

  enum MediaStatus {
    UPLOADED
    PROCESSING
    COMPLETED
  }

  enum VideoOrientation {
    PORTRAIT
    LANDSCAPE
  }

  enum UserAccountDeleteReason {
    ADVERTISING
    LEWD_CONTENT
    IRRELEVANT_CONTENT
    BAD_DATING_EXPERIENCE
    BAD_HOST_EXPERIENCE
    BAD_GUEST_EXPERIENCE
  }

  enum AdminAccountDeleteReason {
    MISSIONARY
    LEWD_CONTENT
    DATING_COMPLAINTS
    BAD_HOST_EXPERIENCE
    BAD_GUEST_EXPERIENCE
  }

  enum FlaggedContentType {
    POST
    COMMENT
    COMMENT_REPLY
    MEDIA_PROFILE_PICTURE
    MEDIA_AVATAR
    ENDORSEMENT
  }

  enum Locale {
    de
    en
    es
    fr
    he
    pt
    ru
  }
`

export default gql`
  ${enums}
  ${countryCode}
  ${flags}
  ${profileSettings}
`
