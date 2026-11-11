import phoneNumber from 'awesome-phonenumber'

export const getValidPhoneNumber = (value) => {
  if (!value) {
    return null
  }
  const pn = phoneNumber(value)
  if (pn.isPossible()) {
    return phoneNumber(value).getNumber('e164')
  }

  const usPn = phoneNumber(value, 'US')
  if (usPn.isPossible()) {
    return usPn.getNumber('e164')
  }

  return null
}

export const validatePhoneNumber = (value) => {
  if (!value) {
    return true
  }
  const pn = phoneNumber(value)
  if (pn.isPossible()) {
    return true
  }

  const usPn = phoneNumber(value, 'US')
  if (usPn.isPossible()) {
    return true
  }

  return false
}
