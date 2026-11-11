const ERRORS_BY_CODE = {
  // Authentication related errors
  UNAUTHORISED: 'errors.global.unauthorised',
  FORBIDDEN: 'errors.global.forbidden',
  NOT_FOUND: 'errors.global.not-found',
  INTERNAL_SERVER_ERROR: 'errors.global.internal',

  INVALID_CREDENTIALS: 'errors.auth.invalid-credentials',
  INVALID_TOKEN: 'errors.auth.invalid-token',
  SUSPENDED: 'errors.auth.suspended',
  DELETED: 'errors.auth.deleted',
  USER_NOT_FOUND: 'errors.auth.not-found-user',
  RESET_PASSWORD_TOKEN_NOT_FOUND: 'errors.auth.not-found-reset-password-token',

  AUTH_FORBIDDEN_EMAIL: 'errors.auth.forbidden-email',
  AUTH_FORBIDDEN_PASSWORD: 'errors.auth.forbidden-password',
  AUTH_REGISTRATION_PAUSED: 'errors.auth.registration-paused',
  INVALID_FIRST_NAME: 'errors.auth.invalid-first-name',
  INVALID_LAST_NAME: 'errors.auth.invalid-last-name',
  INVALID_EMAIL: 'errors.auth.invalid-email',
  INVALID_PASSWORD_LENGTH: 'errors.auth.invalid-password-length',
  DUPLICATE_EMAIL: 'errors.auth.duplicate-email',
  EMAIL_ALREADY_CONFIRMED: 'errors.auth.email-already-confirmed',
  DIFFERENT_ACCOUNT: 'errors.auth.different-account',
  AUTH_ERROR: 'errors.auth.error',

  // Conversation related errors
  CONVERSATION_APPROVAL_FORBIDDEN: 'errors.conversation.approval-forbidden',
  CONVERSATION_REJECT_FORBIDDEN: 'errors.conversation.reject-forbidden',
  CONVERSATION_REJECT_NOT_PENDING: 'errors.conversation.reject-not-pending',
  INVALID_CONVERSATION_ID: 'errors.conversation.invalid-id',
  EMPTY_PARTICIPANTS_LIST: 'errors.conversation.empty-participants-list',
  BLOCKED_PARTICIPANTS_LIST: 'errors.conversation.blocked-participants-list',
  RESTRICTED_PARTICIPANTS_LIST:
    'errors.conversation.restricted-participants-list',
  FORBIDDEN_CREATE_BROADCAST_CONVERSATION:
    'errors.conversation.forbidden-create-broadcast-conversation',
  FORBIDDEN_ARCHIVE_BROADCAST_CONVERSATION:
    'errors.conversation.forbidden-archive-broadcast-conversation',

  // Endorsement related errors
  INVALID_ENDORSEE_SITE_ROLE: 'errors.endorse.invalid-endorsee-site-role',
  ENDORSE_BLOCKED: 'errors.endorse.endorsement-blocked',

  // Feed/Post related errors
  FEED_FORBIDDEN: 'errors.feed.forbidden',
  INVALID_FEED_ID: 'errors.feed.invalid-id',

  // Follower related errors
  INVALID_FOLLOWER_ID: 'errors.follower.invalid-follower-id',
  INVALID_FOLLOWER_PROFILE_ID: 'errors.follower.invalid-follower-profile-id',

  // Friend related errors
  INVALID_FRIEND_PROFILE_ID: 'errors.friend.invalid-friend-profile-id',
  BLOCKING_FRIEND_PROFILE_ID: 'errors.friend.blocking-friend-profile-id',
  FRIENDSHIP_ALREADY_EXISTS: 'errors.friend.frienship-already-exists',
  INVALID_FRIEND_REQUEST_ID: 'errors.friend.invalid-friend-request-id',
  APPROVE_FRIEND_REQUEST_FAILED: 'errors.friend.approve-request-failed',

  // Guest profile related issue
  UPDATE_GUEST_PROFILE_FORBIDDEN: 'errors.guest-profile.update-forbidden',

  // Hosting related errors
  ACCEPT_HOSTING_INVITATION_FORBIDDEN:
    'errors.hosting.accept-hosting-invitation-forbidden',
  ACCEPT_HOSTING_REQUEST_FORBIDDEN:
    'errors.hosting.accept-hosting-request-forbidden',
  REJECT_HOSTING_INVITATION_FORBIDDEN:
    'errors.hosting.reject-hosting-invitation-forbidden',
  REJECT_HOSTING_REQUEST_FORBIDDEN:
    'errors.hosting.reject-hosting-request-forbidden',
  REQUEST_HOSTING_FORBIDDEN: 'errors.hosting.request-hosting-forbidden',
  CREATE_INVITE_FORBIDDEN: 'errors.hosting.create-invite-forbidden',
  CREATE_INVITE_PRIVATE_INVITE_CODE_REQUIRED:
    'errors.hosting.create-invite-private-code-required',
  CREATE_INVITE_PRIVATE_INVITE_CODE_MISMATCH:
    'errors.hosting.create-invite-private-code-mismatch',
  PRIVATE_INVITE_NOT_ENABLED:
    'errors.hosting-profile.private-invite-not-enabled',
  NO_HOST_PROFILE_FOUND: 'errors.hosting.no-host-profile-found',

  // Media related errors
  INVALID_MEDIA_FEED_REFERENCE: 'erros.media.invalid-feed-reference',

  // Message related errors
  MESSAGE_PENDING_APPROVAL: 'errors.message.pending-approval',
  MESSAGE_FORBIDDEN_CONVERSATION_ID: 'errors.message.forbidden-conversation-id',

  // Notification related errors
  INVALID_NOTIFICATION_ID: 'errors.notification.invalid-id',
  UPDATE_NOTIFICATION_FORBIDDEN: 'errors.notification.update-forbidden',

  // Post related errors
  INVALID_POST_ID: 'errors.post.invalid-id',
  INVALID_POST_LIKE_ID: 'errors.post.invalid-like-id',
  INVALID_POST_COMMENT_ID: 'errors.post.invalid-comment-id',
  DELETE_POST_COMMENT_FORBIDDEN: 'errors.post.delete-comment-forbidden',
  UPDATE_POST_COMMENT_FORBIDDEN: 'errors.post.update-comment-forbidden',
  DELETE_POST_LIKE_FORBIDDEN: 'errors.post.delete-like-forbidden',

  // Profile related errors
  PROFILE_NOT_FOUND: 'errors.profile.not-found',
  INCOMPLETE_PROFILE: 'errors.profile.incomplete-profile',
  PROFILE_UPDATE_FORBIDDEN: 'errors.profile.update-forbidden',
  ADMIN_ONLY_ALLOWED: 'errors.admin.only-allowed',
  ALREADY_ADMIN: 'errors.admin.already-admin',
  NOT_ADMIN: 'errors.admin.not-admin',
  ALREADY_ZEALOT: 'errors.zealot.already-zealot',
  NOT_ZEALOT: 'errors.zealot.not-zealot',
  ALREADY_GREENLIGHT: 'errors.greenlight.already-greenlight',
  NOT_GREENLIGHT: 'errors.greenlight.not-greenlight',
  DATING_REQUEST_ALREADY_EXISTS: 'errors.dating.profile-already-request',
  CONTACTS_FORBIDDEN: 'errors.hosting.contacts-forbidden',

  // Reference related errors
  CREATE_REFERENCE_FORBIDDEN: 'errors.reference.create-forbidden',
  UPDATE_REFERENCE_FORBIDDEN: 'errors.reference.update-forbidden',
  REQUEST_ALREADY_EXISTS: 'errors.reference.request-exists',
  INVALID_REFERENCE_ID: 'errors.reference.invalid-id',
  INVALID_REFERENCE_RECIPIENT_ID:
    'errors.reference.invalid-recipient-profile-id',
  INVALID_REFERENCE_REQUESTOR_ID:
    'errors.reference.invalid-requestor-profile-id',

  // Flagging errors
  FLAGGING_INVALID_POST_ID: 'errors.flagging-content.invalid-post-id',
  FLAGGING_INVALID_POST_COMMENT_ID:
    'errors.flagging-content.invalid-post-comment-id',
  FLAGGING_INVALID_POST_COMMENT_REPLY_ID:
    'errors.flagging-content.invalid-post-comment-reply-id',
  FLAGGING_INVALID_PROFILE_AVATAR_ID:
    'errors.flagging-content.invalid-profile-avatar-id',
  FLAGGING_INVALID_PROFILE_PICTURE_ID:
    'errors.flagging-content.invalid-profile-picture-id',

  // Unreport errors
  REPORT_NOT_FOUND: 'errors.admin.report-not-found',

  // Mute connection related errors
  PROFILE_NOT_MUTED: 'errors.mute-connection.profile-not-muted',

  // Message reactions related errors
  MESSAGE_REACTION_INVALID_CONVERSATION_ID:
    'errors.message-reaction.invalid-conversation-id',
  MESSAGE_REACTION_INVALID_MESSAGE_ID:
    'errors.message-reaction.invalid-message-id',
  MESSAGE_REACTION_INVALID_MESSAGE_REACTION_ID:
    'errors.message-reaction.invalid-message-reaction-id',
}

export default ERRORS_BY_CODE
