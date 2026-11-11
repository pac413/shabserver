import moment from 'moment'
import models from 'Models'
import { HostingDateTypes } from 'Models/hostingDate/enums'

export const hostingDate = async (date) => {
  const hostingDate = (await upcomingHostingDates(1, date))[0]
  return { hostingDate }
}

export const allHostingDates = async (limit, date, local) => {
  const pd = await previousHostingDates(limit, date, local)
  const ud = await upcomingHostingDates(limit + 1, date, local)
  return {
    hostingDates: [...pd.reverse(), ...ud],
    upcomingInx: limit,
  }
}
export const previousHostingDates = async (limit, date, local) => {
  return await getHostingDates(
    limit || 10,
    date || moment().utc().toDate(),
    '$lt',
    -1,
    local
  )
}
export const upcomingHostingDates = async (limit, date, local) => {
  return await getHostingDates(
    limit || 10,
    date || moment().utc().toDate(),
    '$gte',
    1,
    local
  )
}

const getHostingDates = async (limit, date, op, direction, local) => {
  const filter = {
    date: { [op]: date },
  }
  if (local === 'IL') {
    filter['israel.type'] = [HostingDateTypes.SHABBAT, HostingDateTypes.YOMTOV]
  }
  const dates = await models.HostingDate.find(filter, null, {
    limit,
    sort: { date: direction },
  })

  return dates
}
