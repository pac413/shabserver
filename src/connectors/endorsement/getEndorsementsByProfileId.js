import models from 'Models'

export const getEndorsementsByProfileId = async (
  profileId,
  onSiteRole,
  offset,
  limit
) => {
  const [endorsements, total] = await Promise.all([
    models.Endorsement.find(
      onSiteRole
        ? {
            profile: profileId,
            onSiteRole,
          }
        : { profile: profileId }
    )
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit),
    models.Endorsement.countDocuments(
      onSiteRole
        ? {
            profile: profileId,
            onSiteRole: onSiteRole,
          }
        : { profile: profileId }
    ),
  ])
  return { endorsements, total }
}
