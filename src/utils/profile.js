import { FRONTEND_URL } from './globals'

export const getProfileUrl = (profile) =>
  `${FRONTEND_URL}/profile/${profile.handle}`

export const calculateAge = (birthday) => {
  if (!birthday) return ''
  const birthDate = new Date(birthday)
  const ageDifMs = Date.now() - birthDate.getTime()
  const ageDate = new Date(ageDifMs)
  return Math.abs(ageDate.getUTCFullYear() - 1970)
}
