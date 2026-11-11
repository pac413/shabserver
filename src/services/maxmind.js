import { WebServiceClient } from '@maxmind/geoip2-node'
import { Client, Device, Transaction, Email } from '@maxmind/minfraud-api-node'
import { MAXMIND_ID, MAXMIND_KEY } from 'Utils/globals'

export const geo2ip = new WebServiceClient(MAXMIND_ID, MAXMIND_KEY)
export const minFraud = new Client(MAXMIND_ID, MAXMIND_KEY)

export function getScore({ ipAddress, userAgent, email }) {
  const transaction = new Transaction({
    device: new Device({
      ipAddress,
      userAgent,
    }),
    email: new Email({
      address: email,
      domain: getDomainFromEmail(email),
    }),
  })

  return minFraud.score(transaction)
}

export function getDomainFromEmail(email) {
  if (email) {
    return email.split('@').pop()
  }
}

export function getIpInsights(ip) {
  return geo2ip.insights(ip)
}
