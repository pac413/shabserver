import models from 'Models'
import moment from 'moment'

export const getAdminTotals = async () => {
  const totalProfiles = await models.Profile.find().lean()
  const totalUsers = totalProfiles.length

  const totalActiveLastSixMonths = (() => {
    const sixMonthBefore = moment().subtract(5, 'months').toDate()
    return totalProfiles.filter(
      (profile) => profile.dateActive > sixMonthBefore
    ).length
  })()
  const totalActiveLastYear = (() => {
    const oneYearBefore = moment().subtract(1, 'years').toDate()
    return totalProfiles.filter((profile) => profile.dateActive > oneYearBefore)
      .length
  })()
  const totalActiveSinceCovid = (() => {
    const covidStartedDate = new Date(2020, 1, 13)
    return totalProfiles.filter(
      (profile) => profile.dateActive > covidStartedDate
    ).length
  })()

  return {
    totalActiveLastSixMonths,
    totalActiveLastYear,
    totalActiveSinceCovid,
    totalUsers,
  }
}
