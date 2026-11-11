import moment from 'moment'
import {
  prepareNewHostingEmail,
  prepareAcceptedDeclinedHostingEmail,
} from 'Connectors/hosting'
import { eventManager } from 'Events'
import models from 'Models'
import { sendNewHostingsEmail, sendUpdatedHostingsEmail } from 'Services/email'

export const checkIfActivelyLooking = async (hosting) => {
  const { guest, date } = hosting
  const requests = await models.Hosting.find({
    guest,
    date,
  })
  // We should consider adding a case where guest request in two consecutive weeks
  if (requests.length > 1) {
    const profile = await models.Profile.findOne({ _id: guest })
    profile.activelyLooking.guest = true
    // replace with utils function
    profile.activelyLooking.guestExpire = moment()
      .startOf('isoWeek')
      .add(2, 'week')
      .day('saturday')
      .utc()
      .toDate()
    await profile.save()
  }
}

export const notifyHosts = async (hosting) => {
  const { date, host, guest, sharedParts } = hosting
  const hostings = await models.Hosting.find({
    date,
    host: { $ne: host },
    guest,
  }).populate('guest')
  if (hostings.length > 0) {
    await Promise.all(
      hostings.map((h) => {
        const { firstName, lastName } = h.guest
        const { date } = h
        const details = msg(
          firstName,
          lastName,
          moment(date).format('dddd MMMM Do'),
          sharedParts
        )
        sendNotification(details)
        return details
      })
    )
  }
}

export const emailNewHosting = async (hosting) => {
  const body = await prepareNewHostingEmail(hosting._id)
  try {
    await sendNewHostingsEmail(body)
  } catch (e) {
    console.error('Email new hosting failed', e)
  }
}

export const sendAcceptedDeclinedHostingEmail = async (hosting) => {
  const body = await prepareAcceptedDeclinedHostingEmail(hosting._id)
  try {
    await sendUpdatedHostingsEmail(body)
  } catch (e) {
    console.error('Email updated hosting failed', e)
  }
}

const msg = (fn, ln, dt, ps) => {
  const lf = new Intl.ListFormat('en')
  return `Guest ${fn} ${ln} accepted elsewhere for ${dt} ${lf.format(ps)}`
}

const sendNotification = (details) => {
  eventManager.emit(eventManager.events.NEW_NOTIFICATION, {
    type: 'hosting',
    title: 'Guest Accepted',
    description: details,
    details,
  })
}
