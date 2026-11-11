import axios from 'axios'
import { IFRAMELY_URL, IFRAMELY_KEY } from 'Utils/globals'

const callIframely = async (url) => {
  const iframelyUrl = `${IFRAMELY_URL}?url=${encodeURIComponent(
    url
  )}&api_key=${encodeURIComponent(IFRAMELY_KEY)}`
  const response = await axios.get(iframelyUrl)
  return response
}

const mapWebScrapedData = (preview) => {
  const result = {
    canonical: preview.meta.canonical,
    site: preview.meta.site,
    author: preview.meta.author,
    title: preview.meta.title || '',
    description: preview.meta.description || '',
  }

  if (preview.links) {
    if (preview.links.thumbnail) {
      result.thumbnails = (preview.links.thumbnail || []).map((item) => ({
        height: item.media.height,
        width: item.media.width,
        href: item.href,
        type: item.type,
      }))
    }

    if (preview.links.icon) {
      result.icons = (preview.links.icon || []).map((item) => ({
        href: item.href,
        type: item.type,
      }))
    }

    if (preview.links.player) {
      result.players = (preview.links.player || []).map((item) => ({
        html: item.html,
        href: item.href,
        type: item.type,
        aspect: item.media['aspect-ratio'],
      }))
    }
  }

  return result
}

/**
 * It will return webScrapedSchema complaint object
 * @param {string} url
 */
export const fetchWebScrapedData = async (url) => {
  const response = await callIframely(url)

  if (!response.error && response.data && response.data.meta) {
    return mapWebScrapedData(response.data)
  }

  return null
}
