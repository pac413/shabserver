import models from 'Models'

export const getAdminRecentMemberData = async (input) => {
  const { profileId } = input
  // Step 1: Get profile data
  const profile = await models.Profile.findById(profileId)

  // Step 2: Calculate total messages for the profile
  const totalMessages = await models.Message.countDocuments({
    sender: profile._id,
  })

  // Step 3: Get reports for the profile
  const reports = await models.Report.find({
    reportedUser: profileId,
  })
    .sort({ createdAt: -1 })
    .lean()

  // Exclude reports whose reporter or reportedUser is not available
  let reportsDataList = await Promise.all(
    reports.map(async (report) => {
      const {
        _id: id,
        reporter: reporterId,
        reason,
        additionalDetails,
        createdAt,
      } = report
      const reporter = await models.Profile.findById(reporterId)

      return {
        id,
        reason,
        additionalDetails,
        reporter,
        reportedUser: profile,
        createdAt,
      }
    })
  )
  reportsDataList = reportsDataList.filter(
    (report) => !!report && report.reporter && report.reportedUser
  )

  return {
    profile,
    totalMessages,
    reports: reportsDataList,
  }
}
