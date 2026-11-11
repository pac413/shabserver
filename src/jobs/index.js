import fetchAwsSecrets from 'Server/awsFetch'

fetchAwsSecrets().then(() => {
  require('./worker')
})
