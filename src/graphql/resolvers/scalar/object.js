const { GraphQLScalarType } = require('graphql')
const { Kind } = require('graphql/language')

export const ObjectScalarType = new GraphQLScalarType({
  name: 'Object',
  description: 'Arbitrary object',
  parseValue: (value) => toObject(value),
  serialize: (value) => toObject(value),
  parseLiteral: (ast) => {
    switch (ast.kind) {
      case Kind.STRING:
        return JSON.parse(ast.value)
      default:
        return null
    }
  },
})

function toObject(value) {
  if (typeof value === 'object') {
    return value
  }
  if (typeof value === 'string') {
    return JSON.parse(value)
  }
  return null
}
