import { deleteConversations } from 'Connectors/conversations'
import { deleteFriendships } from 'Connectors/friends'
import { deleteHostings } from 'Connectors/hosting'
import { deleteMessages } from 'Connectors/message'
import { deleteNotifications } from 'Connectors/notification'
import {
  deletePostsPostedBy,
  deletePostComments,
  deletePostLikes,
  deletePostViews,
} from 'Connectors/post'
import { deleteEndorsements } from 'Connectors/endorsement'
import { deleteProfileViews } from 'Connectors/profileView'
import { deleteBlockings } from 'Connectors/blocking'
import { deleteFollowers } from 'Connectors/follower'
import { deleteMedias } from 'Connectors/media'
import { deleteProfileSettings } from 'Connectors/profileSettings'
import { deleteSponsoredPosts } from 'Connectors/sponsoredPost'
import { deleteReferences } from 'Connectors/reference'
import { deleteDatingMatches } from 'Connectors/datingMatch'
import { deleteRequests } from 'Connectors/request'
import { deleteFlaggedContents } from 'Connectors/flaggedContent'
import { deleteMutedConnections } from 'Connectors/mutedConnection'
import { deleteDatingProfiles } from 'Connectors/datingProfile'
import { deleteHostProfiles } from 'Connectors/hostProfile'
import { deleteGuestProfiles } from 'Connectors/guestProfile'

export const deleteSubDataForProfile = async (profileId, shouldHardDelete) => {
  const promises = [
    deleteConversations(profileId, shouldHardDelete),
    deleteFriendships(profileId, shouldHardDelete),
    deleteHostings(profileId, shouldHardDelete),
    deleteMessages(profileId, shouldHardDelete),
    deleteNotifications(profileId, shouldHardDelete),
    deletePostsPostedBy(profileId, shouldHardDelete),
    deletePostComments(profileId, shouldHardDelete),
    deletePostLikes(profileId, shouldHardDelete),
    deletePostViews(profileId, shouldHardDelete),
    deleteEndorsements(profileId, shouldHardDelete),
    deleteProfileViews(profileId, shouldHardDelete),
    deleteBlockings(profileId, shouldHardDelete),
    deleteFollowers(profileId, shouldHardDelete),
    deleteMedias(profileId, shouldHardDelete),
    deleteProfileSettings(profileId, shouldHardDelete),
    deleteSponsoredPosts(profileId, shouldHardDelete),
    deleteReferences(profileId, shouldHardDelete),
    deleteDatingMatches(profileId, shouldHardDelete),
    deleteRequests(profileId, shouldHardDelete),
    deleteFlaggedContents(profileId, shouldHardDelete),
    deleteMutedConnections(profileId, shouldHardDelete),
    deleteDatingProfiles(profileId, shouldHardDelete),
    deleteHostProfiles(profileId, shouldHardDelete),
    deleteGuestProfiles(profileId, shouldHardDelete),
  ]
  await Promise.all(promises)
}
