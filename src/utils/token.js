import jwt from 'jsonwebtoken'
import moment from 'moment'
import randtoken from 'rand-token'
import { v4 as uuid } from 'uuid'
import models from 'Models'
import {
  JWT_EXPIRES,
  JWT_SECRET,
  MICROSERVICE_JWT_SECRET,
  MICROSERVICE_JWT_EXPIRES,
  Roles,
} from 'Utils/globals'
import { getLocal } from 'Utils/location'

export const createAccessToken = async (user, profile) => {
  const { id: userId, email, isAdmin } = user
  const { id: profileId, username, location, accountStatus } = profile
  const accessTokenId = uuid()

  const payload = {
    accessTokenId,
    userId,
    profileId,
    username,
    email,
    role: isAdmin ? Roles.Admin : Roles.Member,
    local: location ? getLocal(location.country) : null,
    accountStatus,
  }
  const accessToken = await jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  })

  return {
    accessTokenId,
    accessToken,
    accessTokenExpiresAt: moment().add(JWT_EXPIRES, 'seconds').unix(),
  }
}

export const createRefreshToken = async (userId, userAgent, ipAddress) => {
  const expires = moment().add(process.env.REFRESH_TOKEN_EXPIRE, 'days')
  const currentDate = moment.utc().toDate()

  const existingToken = await models.RefreshToken.findOne({
    user: userId,
    userAgent,
    ipAddress,
    expires: {
      $gt: currentDate,
    },
  })
  if (existingToken) {
    existingToken.expires = expires
    await existingToken.save()
    return existingToken.token
  }

  const refreshToken = await models.RefreshToken.create({
    token: randtoken.uid(256),
    user: userId,
    userAgent: userAgent,
    ipAddress,
    expires,
  })
  return refreshToken.token
}

export const verifyRefreshToken = async (token) => {
  const expires = moment().add(process.env.REFRESH_TOKEN_EXPIRE, 'days')
  const currentDate = moment.utc().toDate()
  const refreshToken = await models.RefreshToken.findOne({
    token,
    expires: {
      $gt: currentDate,
    },
  })
  if (refreshToken) {
    refreshToken.expires = expires
    await refreshToken.save()
    return refreshToken
  }
  return false
}

export const createTokenForMicroservice = async () => {
  return await jwt.sign({}, MICROSERVICE_JWT_SECRET, {
    expiresIn: MICROSERVICE_JWT_EXPIRES,
  })
}
