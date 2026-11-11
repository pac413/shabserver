import axios from 'axios'
import qs from 'qs'

export const migrateApi = {
  profile: {
    // https://old.shabbat.com/Help/Api/GET-api-shabbat-migrate-profiles
    loadBulk: async (offset, limit, params = {}) => {
      const { data } = await axios({
        method: 'get',
        url: 'https://old.shabbat.com/api/shabbat-migrate-profiles',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: qs.stringify({
          skip: offset,
          take: limit,
          ...params,
        }),
      })
      return data
    },
    // https://old.shabbat.com/Help/Api/GET-api-shabbat-migrate-profile-id_handle
    loadSingle: async (id) => {
      const { data } = await axios.get(
        `https://old.shabbat.com/api/shabbat-migrate-profile/${id}`
      )
      return data
    },
    loadProfileIds: async () => {
      const { data } = await axios.get(
        'https://old.shabbat.com/api/shabbat-migrate-testing-all-valid-ids'
      )
      return data
    },
  },

  profileSettings: {
    // https://old.shabbat.com/Help/Api/GET-api-shabbat-migrate-profile-settings-userId
    loadSingle: async (profileId) => {
      const { data } = await axios.get(
        `https://old.shabbat.com/api/shabbat-migrate-profile-settings/${profileId}`
      )
      return data
    },
  },

  endorsements: {
    // https://old.shabbat.com/Help/Api/GET-api-shabbat-migrate-endorsements
    loadSingle: async (userid, params = {}) => {
      const { data } = await axios({
        method: 'get',
        url: 'https://old.shabbat.com/api/shabbat-migrate-endorsements',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: qs.stringify({
          userid,
          ...params,
        }),
      })
      return data
    },
  },

  profileViews: {
    // https://old.shabbat.com/Help/Api/GET-api-shabbat-migrate-profile-views
    loadSingle: async (userid, params = {}) => {
      const { data } = await axios({
        method: 'get',
        url: 'https://old.shabbat.com/api/shabbat-migrate-profile-views',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: qs.stringify({
          userid,
          ...params,
        }),
      })
      return data
    },
  },

  references: {
    // https://old.shabbat.com/Help/Api/GET-api-shabbat-migrate-references
    loadSingle: async (userid, params = {}) => {
      const { data } = await axios({
        method: 'get',
        url: 'https://old.shabbat.com/api/shabbat-migrate-references',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: qs.stringify({
          userid,
          ...params,
        }),
      })
      return data
    },
  },

  friendships: {
    // https://old.shabbat.com/Help/Api/GET-api-shabbat-migrate-profile-friends
    loadSingle: async (userid, params = {}) => {
      const { data } = await axios({
        method: 'get',
        url: 'https://old.shabbat.com/api/shabbat-migrate-profile-friends',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: qs.stringify({
          userid,
          ...params,
        }),
      })
      return data
    },
  },

  hostings: {
    // https://old.shabbat.com/Help/Api/GET-api-shabbat-migrate-hostings
    loadSingle: async (userid, params = {}) => {
      const { data } = await axios({
        method: 'get',
        url: 'https://old.shabbat.com/api/shabbat-migrate-hostings',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: qs.stringify({
          userid,
          ...params,
        }),
      })
      return data
    },
  },

  conversations: {
    // https://old.shabbat.com/Help/Api/GET-api-shabbat-migrate-conversations
    loadSingle: async (userid, params = {}) => {
      const { data } = await axios({
        method: 'get',
        url: 'https://old.shabbat.com/api/shabbat-migrate-conversations',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: qs.stringify({
          userid,
          ...params,
        }),
      })
      return data
    },
  },

  messages: {
    // https://old.shabbat.com/Help/Api/GET-api-shabbat-migrate-messages
    loadSingle: async (userid, params = {}) => {
      const { data } = await axios({
        method: 'get',
        url: 'https://old.shabbat.com/api/shabbat-migrate-messages',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: qs.stringify({
          userid,
          ...params,
        }),
      })
      return data
    },
  },

  posts: {
    // https://old.shabbat.com/Help/Api/GET-api-shabbat-migrate-posts
    loadPaginatedPosts: async (userid, params = {}) => {
      const { data } = await axios({
        method: 'get',
        url: 'https://old.shabbat.com/api/shabbat-migrate-posts',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: qs.stringify({
          userid,
          ...params,
        }),
      })
      return data
    },
    loadAllPostsByProfileId: async (userid, params = {}) => {
      let skip = 0
      const posts = []
      console.log({
        event: 'API_POSTS',
        message: `Loading posts for ${userid}`,
        profileId: userid,
      })
      while (1) {
        const result = await migrateApi.posts.loadPaginatedPosts(userid, {
          skip,
          take: 30,
          ...params,
        })
        console.log({
          event: 'API_POSTS',
          message: `Loaded ${result.PostsReturned} posts from ${skip} out of ${result.TotalProfilePosts}`,
          profileId: userid,
        })
        skip += result.PostsReturned
        posts.push(...result.posts)
        if (skip >= result.TotalProfilePosts) {
          return posts
        }
      }
    },
  },

  postViews: {
    // https://old.shabbat.com/Help/Api/GET-api-shabbat-migrate-post-views-id
    loadForSinglePost: async (postId) => {
      const { data } = await axios.get(
        `https://old.shabbat.com/api/shabbat-migrate-post-views/${postId}`
      )
      return data
    },
    loadCountForSinglePost: async (postId) => {
      const { data } = await axios.get(
        `https://old.shabbat.com/api/shabbat-migrate-post-views-totals/${postId}`
      )
      return data
    },
  },
}
