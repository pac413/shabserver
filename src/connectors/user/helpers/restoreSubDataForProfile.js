import { restoreConversations } from 'Connectors/conversations'
import { restoreFriendships } from 'Connectors/friends'
import { restoreHostings } from 'Connectors/hosting'
import { restoreMessages } from 'Connectors/message'
import { restoreNotifications } from 'Connectors/notification'
import {
  restorePostsPostedBy,
  restorePostComments,
  restorePostLikes,
  restorePostViews,
} from 'Connectors/post'
import { restoreEndorsements } from 'Connectors/endorsement'
import { restoreProfileViews } from 'Connectors/profileView'
import { restoreBlockings } from 'Connectors/blocking'
import { restoreFollowers } from 'Connectors/follower'
import { restoreMedias } from 'Connectors/media'
import { restoreProfileSettings } from 'Connectors/profileSettings'
import { restoreSponsoredPosts } from 'Connectors/sponsoredPost'
import { restoreReferences } from 'Connectors/reference'
import { restoreDatingMatches } from 'Connectors/datingMatch'
import { restoreRequests } from 'Connectors/request'
import { restoreFlaggedContents } from 'Connectors/flaggedContent'
import { restoreMutedConnections } from 'Connectors/mutedConnection'
import { restoreDatingProfiles } from 'Connectors/datingProfile'
import { restoreHostProfiles } from 'Connectors/hostProfile'
import { restoreGuestProfiles } from 'Connectors/guestProfile'

export const restoreSubDataForProfile = async (profileId) => {
  const promises = [
    restoreConversations(profileId),
    restoreFriendships(profileId),
    restoreHostings(profileId),
    restoreMessages(profileId),
    restoreNotifications(profileId),
    restorePostsPostedBy(profileId),
    restorePostComments(profileId),
    restorePostLikes(profileId),
    restorePostViews(profileId),
    restoreEndorsements(profileId),
    restoreProfileViews(profileId),
    restoreBlockings(profileId),
    restoreFollowers(profileId),
    restoreMedias(profileId),
    restoreProfileSettings(profileId),
    restoreSponsoredPosts(profileId),
    restoreReferences(profileId),
    restoreDatingMatches(profileId),
    restoreRequests(profileId),
    restoreFlaggedContents(profileId),
    restoreMutedConnections(profileId),
    restoreDatingProfiles(profileId),
    restoreHostProfiles(profileId),
    restoreGuestProfiles(profileId),
  ]
  await Promise.all(promises)
}
