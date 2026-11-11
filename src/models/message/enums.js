export const MessageStatus = Object.freeze({
  PENDING: 'pending',
  SENT: 'sent',
  BLOCKED: 'blocked',
  DELIVERED: 'delivered',
  READ: 'read',
})

export const MessageFlaggedReason = Object.freeze({
  OffensiveLanguage: 'offensive language',
  ReligiousLanguge: 'religious language',
  OffensiveImage: 'offensive image',
})

export const MessageFlaggedSeverity = Object.freeze({
  Severe: 'severe',
  Moderate: 'moderate',
  Low: 'low',
})

export const MessageType = Object.freeze({
  TEXT: 'text',
  AUDIO: 'audio',
  VIDEO: 'video',
  IMAGE: 'image',
  NEW_FRIENDS: 'new_friends',
  NEW_HOSTING: 'new_host',
})
