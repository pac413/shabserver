import { MaxMind } from 'Services'
import {
  HIGH_MIN_FRAUD_SCORE,
  IP_RISK_SCORE,
  SCAMMER_DOMAIN_EXTENSIONS,
  SCAMMER_PASSWORD_PHRASES,
  SCAMMER_COUNTRY_SOURCE_IP,
} from 'Utils/globals'

export const isForbiddenByRiskAssessment = (riskAssessment) => {
  if (riskAssessment) {
    const { minFraudRiskScore, ipRiskScore } = riskAssessment
    if (minFraudRiskScore && minFraudRiskScore > HIGH_MIN_FRAUD_SCORE) {
      return true
    }
    if (ipRiskScore && ipRiskScore > IP_RISK_SCORE) {
      return true
    }
  }
  return false
}

export const isForbiddenByEmail = (email) => {
  if (email) {
    const domain = MaxMind.getDomainFromEmail(email).toUpperCase()
    if (SCAMMER_DOMAIN_EXTENSIONS.includes(domain)) {
      return true
    }
  }
  return false
}

export const isForbiddenByPassword = (password) => {
  return !!(password && SCAMMER_PASSWORD_PHRASES.includes(password))
}

export const isForbiddenByCountry = (country) => {
  return !!(
    country && SCAMMER_COUNTRY_SOURCE_IP.includes(country.toLowerCase())
  )
}

export const getRiskAssessment = async ({ req, email }) => {
  const userAgent = req.get('User-Agent')
  const ipAddress =
    req.headers['x-forwarded-for'] || req.connection.remoteAddress
  const riskAssessment = {
    userAgent,
    ipAddress,
  }
  // Disable MaxMind for non-prod environments
  const isProd = process.env.NODE_ENV === 'production'
  if (!isProd) {
    riskAssessment.ipRiskScore = 0
    riskAssessment.minFraudRiskScore = 0
    return
  }
  try {
    const score = await MaxMind.getScore({
      ipAddress,
      userAgent,
      email,
    })
    riskAssessment.ipRiskScore = score.ipAddress?.risk
    riskAssessment.minFraudRiskScore = score.riskScore
  } catch (error) {
    console.error('Cannot get score from MaxMind', error)
  }

  try {
    const ipInsight = await MaxMind.getIpInsights(ipAddress)
    riskAssessment.location = {
      country: ipInsight.country?.names.en,
      countryConfidence: ipInsight.country?.confidence,
      city: ipInsight.city?.names.en,
      cityConfidence: ipInsight.city?.confidence,
    }
  } catch (error) {
    console.error('Cannot get ip insight from MaxMind', error)
  }

  return riskAssessment
}
