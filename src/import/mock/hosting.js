import Promise from 'bluebird'
import moment from 'moment'
import {
  previousHostingDates,
  upcomingHostingDates,
} from 'Connectors/hostingDate'
import { importHostings } from 'Import/common/hostings/importHostings'
import models from 'Models'

const hostsLastNames = ['Host1', 'Host2', 'Host3', 'Host4', 'Host5']

const guestLastNames = [
  'Guest1',
  'Guest2',
  'Guest3',
  'Guest4',
  'Guest5',
  'Guest6',
  'Guest7',
  'Guest8',
  'Guest9',
]

export const runHostingImport = async () => {
  await models.Hosting.deleteMany({})
  const guests = await models.Profile.find({
    lastName: guestLastNames,
  })

  const hosts = await models.Profile.find({
    lastName: hostsLastNames,
  })

  const hostingDates = [
    ...(await previousHostingDates(104)),
    ...(await upcomingHostingDates(5)),
  ]
  const importedAt = moment.utc().toDate()

  await Promise.map(
    hosts,
    (host) =>
      Promise.map(
        guests,
        async (guest) => {
          const hostings = hostingDates.map((hd) => ({
            host: host._id,
            guest: guest._id,
            date: hd.date,
          }))
          await importHostings(hostings, host._id, importedAt)
          console.log(
            `created hostings for host: ${host._id} guest: ${guest._id}`
          )
        },
        {
          concurrency: 1,
        }
      ),
    {
      concurrency: 1,
    }
  )
  console.log('faked Hosting')
}
