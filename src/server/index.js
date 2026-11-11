import { runMigrate } from 'Import/migrate'
import { runMockImport } from 'Import/mock'
import { setupLogger } from 'Logger'
import { connectDb } from 'Models'

if (process.env.IMPORT || process.env.MIGRATE) {
  setupLogger('import')
} else {
  setupLogger('default')
}

connectDb(process.env.DB_URL).then(async () => {
  console.info('connected to the database!')
  if (!process.env.IMPORT && !process.env.MIGRATE) {
    require('./app')
    return
  }

  if (process.env.IMPORT) {
    await runMockImport()
  }
  if (process.env.MIGRATE) {
    await runMigrate()
  }

  const timeoutPromise = new Promise((resolve) => {
    // Exit the process after 30 seconds to allow some time for logs to be exported.
    setTimeout(() => {
      resolve()
    }, 30000)
  })
  await timeoutPromise

  process.exit(0)
})
