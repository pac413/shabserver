import Promise from 'bluebird'
import moment from 'moment'
import models from 'Models'
import { HostingDateTypes } from 'Models/hostingDate/enums'

const yt = HostingDateTypes.YOMTOV
const sh = HostingDateTypes.SHABBAT
const ch = HostingDateTypes.CHOL_HAMOED
const wd = HostingDateTypes.WEEKDAY

const getIsraelType = (date) => {
  const lastDays = ['Simchat Torah', 'Shavuot II', 'Passover VIII']
  if (date.isYomTovIsrael) {
    return yt
  }

  if (moment(date.date).day() === 6) {
    return sh
  }

  if (lastDays.includes(date.yomTov.enDiaspora)) {
    return wd
  }

  if (date.isYomTov) {
    return ch
  }
  throw new Error('can not determine date type')
}

export const importHostingDates = async () => {
  console.log({
    event: 'IMPORT_HOSTING_DATES',
    message: 'Starting to import all hosting dates',
  })

  await models.HostingDate.deleteMany({})
  const hostingDates = require('Import/common/data/hostingDates.json')
  await Promise.each(hostingDates, async (data) => {
    const israel = {
      type: getIsraelType(data),
      name: data.isYomTov ? data.yomTov.enIsrael : '',
      hebrewName: data.isYomTov ? data.yomTov.heIsrael : '',
      parsha: !data.isYomTov ? data.parsha.en : '',
      hebrewParsha: !data.isYomTov ? data.parsha.he : '',
    }

    const diaspora = {
      type: data.isYomTov ? yt : sh,
      name: data.isYomTov ? data.yomTov.enDiaspora : '',
      hebrewName: data.isYomTov ? data.yomTov.heDiaspora : '',
      parsha: !data.isYomTov ? data.parsha.en : '',
      hebrewParsha: !data.isYomTov ? data.parsha.he : '',
    }

    const hostingDate = await models.HostingDate.create({
      date: data.date,
      hebrewDate: data.hebrewDate.he,
      englishHebrewDate: data.hebrewDate.en,
      israel,
      diaspora,
    })

    console.log({
      event: 'HOSTING_DATE',
      message: `Created hosting date ${hostingDate.date}`,
    })
  })

  console.log({
    event: 'HOSTING_DATE',
    message: 'Completed to import all hosting dates',
  })
}
