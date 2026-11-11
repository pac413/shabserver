import { gql } from 'apollo-server-express'

export default gql`
  type WebScrapedThumbnail {
    # mime of thumbnail
    type: String
    href: String
    height: Int
    width: Int
  }

  type WebScrapedIcon {
    # mime of icon
    type: String
    href: String
  }

  type WebScrapedPlayer {
    type: String
    html: String
    href: String
    # proportion of width and height
    aspect: Float
  }

  type WebScrapedPost {
    canonical: String
    site: String
    # original url user used in tne post
    url: String
    author: String
    title: String!
    description: String!
    thumbnails: [WebScrapedThumbnail]
    icons: [WebScrapedIcon]!
    players: [WebScrapedPlayer]
  }

  input WebScrapedPostInput {
    canonical: String
    url: String
    site: String
    author: String
    title: String!
    description: String!
    thumbnails: [WebScrapedThumbnailInput]
    icons: [WebScrapedIconInput]!
    players: [WebScrapedPlayerInput]
  }

  input WebScrapedThumbnailInput {
    # mime of thumbnail
    type: String
    href: String
    height: Int
    width: Int
  }

  input WebScrapedIconInput {
    # mime of icon
    type: String
    href: String
    height: Int
    width: Int
  }

  input WebScrapedPlayerInput {
    type: String
    html: String
    href: String
    # proportion of width and height
    aspect: Float
  }

  type WebScrapedBasic {
    canonical: String
    site: String
    url: String
    title: String!
    thumbnails: [WebScrapedThumbnail]
  }

  input WebScrapedBasicInput {
    canonical: String
    site: String
    url: String
    title: String!
    thumbnails: [WebScrapedThumbnailInput]
  }
`
