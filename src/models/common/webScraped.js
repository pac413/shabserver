import mongoose from 'mongoose'

export const webScrapedThumbnail = new mongoose.Schema(
  {
    type: {
      type: String,
    },
    href: {
      type: String,
    },
    height: {
      type: Number,
    },
    width: {
      type: Number,
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

export const webScrapedIcon = new mongoose.Schema(
  {
    type: {
      type: String,
    },
    href: {
      type: String,
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

export const webScrapedPlayer = new mongoose.Schema(
  {
    type: {
      type: String,
    },
    html: {
      type: String,
    },
    url: {
      type: String,
    },
    aspect: {
      type: Number,
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

export const webScrapedSchema = new mongoose.Schema(
  {
    canonical: {
      type: String,
    },
    url: {
      type: String,
    },
    site: {
      type: String,
    },
    author: {
      type: String,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    thumbnails: [
      {
        type: webScrapedThumbnail,
      },
    ],
    icons: [
      {
        type: webScrapedIcon,
      },
    ],
    players: [
      {
        type: webScrapedPlayer,
      },
    ],
  },
  {
    timestamps: {},
  }
)
