import { CronJob } from 'cron'
import { jobQueue } from 'Jobs/jobQueue'

const tasks = {
  local: [
    new CronJob('0 0 * * * SAT', async () => await resetActivelyLooking()),
    new CronJob('0 0 0 * * *', async () => await generateBirthdayPosts()),
    // Dispose expired refresh-tokens in every hour
    new CronJob('0 0 * * * *', async () => await disposeExpiredRefreshTokens()),
    new CronJob(
      '0 0 12 * * SUN',
      async () => await remindHostingEndorsements()
    ),
  ],

  development: [
    new CronJob('0 0 * * * SAT', async () => await resetActivelyLooking()),
    new CronJob('0 0 0 * * *', async () => await generateBirthdayPosts()),
    // Dispose expired refresh-tokens in every hour
    new CronJob('0 0 * * * *', async () => await disposeExpiredRefreshTokens()),
    new CronJob(
      // Every sunday 12:00 PM UTC
      '0 0 12 * * SUN',
      async () => await remindHostingEndorsements()
    ),
  ],

  staging: [
    new CronJob('0 0 * * * SAT', async () => await resetActivelyLooking()),
    new CronJob('0 0 0 * * *', async () => await generateBirthdayPosts()),
    // Dispose expired refresh-tokens in every hour
    new CronJob('0 0 * * * *', async () => await disposeExpiredRefreshTokens()),
    new CronJob(
      // Every sunday 12:00 PM UTC
      '0 0 12 * * SUN',
      async () => await remindHostingEndorsements()
    ),
  ],

  uat: [
    new CronJob('0 0 * * * SAT', async () => await resetActivelyLooking()),
    new CronJob('0 0 0 * * *', async () => await generateBirthdayPosts()),
    // Dispose expired refresh-tokens in every hour
    new CronJob('0 0 * * * *', async () => await disposeExpiredRefreshTokens()),
    new CronJob(
      // Every sunday 12:00 PM UTC
      '0 0 12 * * SUN',
      async () => await remindHostingEndorsements()
    ),
  ],

  production: [
    new CronJob('0 0 * * * SAT', async () => await resetActivelyLooking()),
    // TODO: Recover this in the future
    // Commenting this out as part of https://shabbat.atlassian.net/browse/SC-8648
    // new CronJob('0 0 0 * * *', async () => await generateBirthdayPosts()),
    // Dispose expired refresh-tokens in every hour
    new CronJob('0 0 * * * *', async () => await disposeExpiredRefreshTokens()),
    new CronJob(
      // Every sunday 12:00 PM UTC
      '0 0 12 * * SUN',
      async () => await remindHostingEndorsements()
    ),
  ],

  test: [],
}

const resetActivelyLooking = async () => {
  console.info('enqueued reset actively looking')
  await jobQueue.add(jobQueue.jobs.ResetActivelyLooking)
}

const generateBirthdayPosts = async () => {
  console.log('enqueued birthday posts')
  await jobQueue.add(jobQueue.jobs.GenerateBirthdayPosts)
}

const disposeExpiredRefreshTokens = async () => {
  console.log('enqueued refresh token disposal')
  await jobQueue.add(jobQueue.jobs.DisposeExpiredRefreshToken)
}

const startTasks = () => {
  disposeExpiredRefreshTokens()
  tasks[process.env.NODE_ENV].map((task) => task.start())
}

const remindHostingEndorsements = async () => {
  console.log('enqueuing reminding hosting endorsements')
  await jobQueue.add(jobQueue.jobs.RemindHostingEndorsements)
}

export default startTasks
