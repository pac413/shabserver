import { respondForbiddenError } from 'Errors/rest'
import { Parser } from 'json2csv'
import moment from 'moment'
import models from 'Models'
import { HostingStatus } from 'Models/hosting/enums'
import { FRONTEND_URL, Roles } from 'Utils/globals'

const getLocationDisplay = (location) => {
  if (!location) {
    return ''
  }
  const locationParts = location.city ? [location.city] : []
  if (location.country === 'United States' || location.country === 'Canada') {
    locationParts.push(location.state || location.country)
  } else if (location.country) {
    locationParts.push(location.country)
  }
  return locationParts.filter((part) => part).join(', ')
}

export function setupHostingRestApis(app) {
  /**
   * Download my confirmed guest list:
   *  GET /hostings/2022-11-05/guest-list/download
   * Download other profile's confirmed hosting guest list:
   *  GET /hostings/2022-11-05/guest-list/download?statuses=accepted&profileId=2fbf34a0-e86b-4e3a-91a1-3925fee8b1f3
   */
  app.get('/api/v2/hostings/:date/guest-list/download', async (req, res) => {
    const { role } = req.user
    if (role !== Roles.Admin) {
      respondForbiddenError(req, res)
      return
    }

    const profileId = req.query.profileId || req.user.profileId
    const statuses = req.query.statuses || [HostingStatus.ACCEPTED]
    const date = req.params.date
    const filter = {
      host: profileId,
      date,
      status: { $in: statuses },
    }
    const [profile, hostings] = await Promise.all([
      models.Profile.findById(profileId),
      models.Hosting.find(filter),
    ])
    const guestProfileIds = hostings.map((hosting) => hosting.guest)
    const profiles = await models.Profile.find({
      _id: { $in: guestProfileIds },
    })
      .select({
        _id: 1,
        firstName: 1,
        lastName: 1,
        handle: 1,
        email: 1,
        phone: 1,
        gender: 1,
        location: 1,
        createdAt: 1,
      })
      .lean()

    const data = profiles.map((profile) => {
      const hosting = hostings.find((hosting) => hosting.guest === profile._id)
      const hostingDate = hosting.date ? moment(hosting.date).toISOString() : ''
      return {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        url: `${FRONTEND_URL}/profile/${profile.handle}`,
        phone: profile.phone,
        gender: profile.gender,
        location: getLocationDisplay(profile.location),
        hostingDate,
        createdAt: moment(profile.createdAt).toISOString(),
      }
    })

    const parser = new Parser({
      fields: [
        { label: 'First Name', value: 'firstName' },
        { label: 'Last Name', value: 'lastName' },
        { label: 'Email', value: 'email' },
        { label: 'Url', value: 'url' },
        { label: 'Phone Number', value: 'phone' },
        { label: 'Gender', value: 'gender' },
        { label: 'Location', value: 'location' },
        { label: 'Shabbat Date', value: 'hostingDate' },
        { label: 'Date Created', value: 'createdAt' },
      ],
    })
    const csv = parser.parse(data)
    const fileName =
      `${profile.firstName} ${profile.lastName}'s` +
      ` ${date} shabbat guests` +
      ` - ${statuses.join(',')}` +
      '.csv'
    res.header('Content-Type', 'text/csv')
    res.attachment(fileName)
    res.send(csv)
  })
}
