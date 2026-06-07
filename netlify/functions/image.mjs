import { getStore } from '@netlify/blobs'

export default async (req) => {
  const url = new URL(req.url)
  const key = url.pathname.replace('/api/images/', '')

  if (!key) return new Response('No encontrado', { status: 404 })

  const store = getStore('images')
  const result = await store.getWithMetadata(key, { type: 'arrayBuffer' })

  if (!result) return new Response('Imagen no encontrada', { status: 404 })

  const contentType = result.metadata?.contentType || 'image/jpeg'

  return new Response(result.data, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  })
}

export const config = {
  path: '/api/images/*'
}
