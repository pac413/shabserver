import randtoken from 'rand-token'

export const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export const truncateWords = (str, maxWords) => {
  return str
    .split(' ')
    .splice(0, maxWords || 10)
    .join(' ')
}

export const generateRandomFourDigits = () => {
  return randtoken.generate(4, '0123456789')
}
