export const HostingType = Object.freeze({
  INVITATION: 'invitation',
  REQUEST: 'request',
})

export const HostingPart = Object.freeze({
  NIGHT: 'night',
  DAY: 'day',
  THIRD: 'third',
  MELAVE_MALKA: 'melave malka',
  LODGING: 'lodging',
})

// To discuss
// removing pending and adding requested extended
// add confirmed ( see notes in schema )
// add missed.
export const HostingStatus = Object.freeze({
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
})
