import { ProfileFlags, ProfileFlagScopes } from './enums'

export function setFlags(next) {
  this.flags = []
  if (!this.phone) {
    this.flags.push({
      code: ProfileFlags.MISSING_PHONE_NUMBER,
      scopes: [ProfileFlagScopes.HOSTING],
    })
  }
  // profile primary location should not be embedded
  // location validation should take place in location model
  if (
    this.location.address.length < 2 ||
    this.location.city.length < 2 ||
    (this.location.state < 2 &&
      ['United States', 'Canada'].includes(this.location.country))
  ) {
    this.flags.push({
      code: ProfileFlags.INCOMPLETE_ADDRESS,
      scopes: [ProfileFlagScopes.HOSTING],
    })
  }
  next()
}
