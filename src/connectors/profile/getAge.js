export default function getAge(profile) {
  const ageDifMs = Date.now() - profile.birthday
  const ageDate = new Date(ageDifMs) // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970)
}
