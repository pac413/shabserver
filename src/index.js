import fetchAwsSecrets from './server/awsFetch'

fetchAwsSecrets().then(async () => {
  require('./server/index')
})
