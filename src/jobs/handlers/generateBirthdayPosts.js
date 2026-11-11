import Promise from 'bluebird'
import { createPost } from 'Connectors/post'
import models from 'Models'
import { PostType } from 'Models/post/enums'
import { buildContext } from 'Utils/auth'
import { Roles } from 'Utils/globals'

export const generateBirthdayPosts = async () => {
  const profiles = await models.Profile.aggregate([
    {
      $addFields: {
        birthDayOfYear: {
          $dayOfYear: {
            date: '$birthday',
          },
        },
      },
    },
    {
      $addFields: {
        currentDayOfYear: {
          $dayOfYear: {
            date: '$$NOW',
          },
        },
      },
    },
    {
      $match: {
        $expr: {
          $eq: ['$currentDayOfYear', '$birthDayOfYear'],
        },
      },
    },
  ])
  Promise.map(profiles, async (p) => {
    console.log(`send ${p._id} birthday post`)
    const postPayload = {
      // need to i18n this
      content: `${p.firstName} ${p.lastName} is celebrating a birthday today.`,
      type: PostType.BIRTHDAY_TODAY,
      readonly: true,
    }

    const context = await buildContext({
      activeProfileId: p._id,
      activeUserId: p.user,
      role: Roles.Admin,
    })

    return createPost(postPayload, context)
  })
}
