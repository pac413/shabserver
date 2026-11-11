import models from 'Models'

export const deleteAll = async () => {
  console.info({
    event: 'DELETE_ALL',
    message: 'Starting to delete all data in our database',
  })
  await Promise.all([
    models.Blocking.deleteMany(),
    models.Conversation.deleteMany(),
    models.DatingMatch.deleteMany(),
    models.DatingProfile.deleteMany(),
    models.Endorsement.deleteMany(),
    models.FlaggedContent.deleteMany(),
    models.Follower.deleteMany(),
    models.Friendship.deleteMany(),
    models.GuestProfile.deleteMany(),
    models.HostingDate.deleteMany(),
    models.Hosting.deleteMany(),
    models.HostProfile.deleteMany(),
    models.Journal.deleteMany(),
    models.Media.deleteMany(),
    models.Message.deleteMany(),
    models.Notification.deleteMany(),
    models.Occupation.deleteMany(),
    models.Post.deleteMany(),
    models.PostView.deleteMany({}),
    models.PostComment.deleteMany({}),
    models.PostLike.deleteMany({}),
    models.Profile.deleteMany(),
    models.ProfileSettings.deleteMany(),
    models.ProfileView.deleteMany(),
    models.Reference.deleteMany(),
    models.RefreshToken.deleteMany(),
    models.Report.deleteMany(),
    models.Request.deleteMany(),
    models.SponsoredPost.deleteMany(),
    models.User.deleteMany(),
  ])
  console.info({
    event: 'DELETE_ALL',
    message: 'Completed to delete all data in our database',
  })
}
