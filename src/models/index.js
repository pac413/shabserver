import Promise from 'bluebird'
import mongoose from 'mongoose'
import mongooseDelete from 'mongoose-delete'
import AdminNoteSchema from './adminNote'
import BlockingSchema from './blocking'
import ConversationSchema from './conversation'
import DatingProfileSchema from './datingProfile'
import EndorsementSchema from './endorsement'
import FollowerSchema from './follower'
import GuestProfileSchema from './guestProfile'
import HostingSchema from './hosting'
import HostingDateSchema from './hostingDate'
import HostProfileSchema from './hostProfile'
import MediaSchema from './media'
import MessageSchema from './message'
import NotificationSchema from './notification'
import OcrResultSchema from './ocrResult'
import PostSchema from './post'
import PostCommentSchema from './postComment'
import PostLikeSchema from './postLike'
import MessageReactionSchema from './messageReaction'
import PostViewSchema from './postView'
import ProfileSchema from './profile'
import ProfileSettingsSchema from './profileSettings'
import ProfileViewSchema from './profileView'
import SponsoredPostSchema from './sponsoredPost'
import ReferenceSchema from './reference'
import RefreshTokenSchema from './refreshToken'
import UserSchema from './user'
import OccupationSchema from './occupation'
import FriendshipSchema from './friendship'
import DatingMatchSchema from './datingMatch'
import RequestSchema from './request'
import ResetPasswordSchema from './resetPassword'
import JournalSchema from './journal'
import FlaggedContentSchema from './flaggedContent'
import ReportSchema from './report'
import MutedConnection from './mutedConnection'
import MobileAppVersionSchema from './mobileAppVersion'

const connectDb = (mongodbUrl) => {
  return mongoose
    .connect(mongodbUrl, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then((mongoose) => {
      return (mongoose.Promise = Promise)
    })
    .catch((err) => {
      console.error(`DB Connection Error: ${err.message}`)
      throw err
    })
}

// Use mongoose-delete as a global plugin
mongoose.plugin(mongooseDelete, {
  deleted: true,
  deletedAt: true,
  indexFields: ['deleted'],
  overrideMethods: ['count', 'countDocuments', 'find', 'findOne'],
})

const models = {
  AdminNote: mongoose.model('AdminNote', AdminNoteSchema),
  Blocking: mongoose.model('Blocking', BlockingSchema),
  Conversation: mongoose.model('Conversation', ConversationSchema),
  DatingProfile: mongoose.model('DatingProfile', DatingProfileSchema),
  Endorsement: mongoose.model('Endorsement', EndorsementSchema),
  Follower: mongoose.model('Follower', FollowerSchema),
  GuestProfile: mongoose.model('GuestProfile', GuestProfileSchema),
  HostProfile: mongoose.model('HostProfile', HostProfileSchema),
  HostingDate: mongoose.model('hostingDate', HostingDateSchema),
  Hosting: mongoose.model('hosting', HostingSchema),
  Occupation: mongoose.model('Occupation', OccupationSchema),
  Media: mongoose.model('Media', MediaSchema),
  Message: mongoose.model('Message', MessageSchema),
  Notification: mongoose.model('Notification', NotificationSchema),
  OcrResult: mongoose.model('OcrResult', OcrResultSchema),
  Post: mongoose.model('Post', PostSchema),
  PostComment: mongoose.model('PostComment', PostCommentSchema),
  PostLike: mongoose.model('PostLike', PostLikeSchema),
  MessageReaction: mongoose.model('MessageReaction', MessageReactionSchema),
  PostView: mongoose.model('PostView', PostViewSchema),
  Profile: mongoose.model('Profile', ProfileSchema),
  ProfileSettings: mongoose.model('ProfileSettings', ProfileSettingsSchema),
  ProfileView: mongoose.model('ProfileView', ProfileViewSchema),
  SponsoredPost: mongoose.model('SponsoredPost', SponsoredPostSchema),
  Reference: mongoose.model('Reference', ReferenceSchema),
  RefreshToken: mongoose.model('RefreshToken', RefreshTokenSchema),
  User: mongoose.model('User', UserSchema),
  Friendship: mongoose.model('Friendship', FriendshipSchema),
  DatingMatch: mongoose.model('DatingMatch', DatingMatchSchema),
  Request: mongoose.model('Request', RequestSchema),
  ResetPassword: mongoose.model('ResetPassword', ResetPasswordSchema),
  Journal: mongoose.model('Journal', JournalSchema),
  FlaggedContent: mongoose.model('FlaggedContent', FlaggedContentSchema),
  Report: mongoose.model('Report', ReportSchema),
  MutedConnection: mongoose.model('MutedConnection', MutedConnection),
  MobileAppVersion: mongoose.model('MobileAppVersion', MobileAppVersionSchema),
}

export { connectDb }

export default models
