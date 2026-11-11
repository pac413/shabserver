module.exports = function (api) {
  api.cache(true)

  const presets = [
    [
      '@babel/preset-env',
      {
        targets: {
          esmodules: true,
        },
      },
    ],
  ]

  const plugins = [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          Connectors: './src/connectors',
          DataLoaders: './src/dataLoaders',
          Errors: './src/errors',
          Events: './src/events',
          Graphql: './src/graphql',
          Import: './src/import',
          Jobs: './src/jobs',
          Locales: './src/locales',
          Logger: './src/logger',
          Models: './src/models',
          Server: './src/server',
          Services: './src/services',
          Resolvers: './src/resolvers',
          Subscriptions: './src/subscriptions',
          Tasks: './src/tasks',
          Utils: './src/utils',
        },
      },
    ],
  ]

  return {
    presets,
    plugins,
  }
}
