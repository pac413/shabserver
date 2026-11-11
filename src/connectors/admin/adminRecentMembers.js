import models from 'Models'
import { ProfileStatuses } from 'Models/profile/enums'
import { HIGH_MIN_FRAUD_SCORE } from 'Utils/globals'

export const getAdminRecentMembers = async (input) => {
  const { limit, offset, filter } = input
  const where = {
    $and: [],
  }

  if (filter.handle) {
    where.handle = filter.handle
  }
  if (filter.q) {
    const term = { $regex: filter.q + '.*' }
    where.$and.push({
      $or: [
        { firstName: term },
        { lastName: term },
        { email: term },
        { handle: term },
      ],
    })
  }
  if (filter.type) {
    switch (filter.type) {
      case 'active':
        where.accountStatus = ProfileStatuses.ACTIVE
        where.$and.push({
          $or: [
            { 'riskAssessment.minFraudRiskScore': { $exists: false } },
            {
              'riskAssessment.minFraudRiskScore': { $lt: HIGH_MIN_FRAUD_SCORE },
            },
          ],
        })
        break
      case 'deleted':
        where.accountStatus = ProfileStatuses.DELETED
        break
      case 'suspended':
        where.accountStatus = ProfileStatuses.ADMIN_SUSPENDED
        break
      case 'incomplete':
        where.accountStatus = ProfileStatuses.INCOMPLETE
        break
      case 'highrisk':
        where['riskAssessment.minFraudRiskScore'] = {
          $gte: HIGH_MIN_FRAUD_SCORE,
        }
        where.accountStatus = ProfileStatuses.ACTIVE
        break
      case 'restricted':
        where.$and.push({
          restrictions: { $exists: true },
          $or: [
            { 'restrictions.messaging': true },
            { 'restrictions.actions': true },
            { 'restrictions.feed': true },
          ],
        })
        where.accountStatus = ProfileStatuses.ACTIVE
        break
      case 'reported':
        where.accountStatus = ProfileStatuses.ACTIVE
        break
      case 'olami':
        where.olamiContactMe = true
        break
      case 'all':
      default:
        break
    }
  }

  // empty array for $and will cause an error
  if (!where.$and.length) {
    delete where.$and
  }

  const shouldCheckReports =
    !!filter.type && !['all', 'highrisk', 'restricted'].includes(filter.type)
  const aggregatePipelines = [
    { $match: where },
    ...(shouldCheckReports
      ? [
          {
            $lookup: {
              from: 'reports',
              let: {
                profileId: '$_id',
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$reportedUser', '$$profileId'],
                    },
                    deleted: false,
                  },
                },
              ],
              as: 'reports',
            },
          },
          {
            $match:
              filter.type === 'reported'
                ? {
                    reports: { $exists: true, $not: { $size: 0 } },
                  }
                : {
                    $or: [
                      { reports: { $exists: false } },
                      { reports: { $size: 0 } },
                    ],
                  },
          },
        ]
      : []),
    { $sort: { createdAt: -1 } },
    { $limit: offset + limit },
    { $skip: offset },
  ]
  let profiles = await models.Profile.aggregate(aggregatePipelines)
  if (filter.type === 'reported') {
    profiles = profiles
      .map((p) => ({
        ...p,
        lastReportedAt: p.reports[p.reports.length - 1]?.createdAt,
      }))
      .sort((a, b) => b.lastReportedAt - a.lastReportedAt)
  }
  return { profiles }
}
