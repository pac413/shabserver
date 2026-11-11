/* eslint-disable no-undef */
db.createUser({
  user: 'api',
  pwd: 'api',
  roles: [
    {
      role: 'readWrite',
      db: 'shabbat_com_development',
    },
  ],
})
db.adminCommand({ setFeatureCompatibilityVersion: '4.4' })
rs.initiate()
