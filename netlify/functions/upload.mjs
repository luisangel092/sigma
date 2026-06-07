import { getStore } from '@netlify/blobs'

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Método no permitido', { status: 405 })
  }

  const adminKey = req.headers.get('x-admin-key')
  const expectedKey = Netlify.env.get('ADMIN_KEY') || 'sigma-admin-2025'

  if (adminKey !== expectedKey) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  let formData
  try {
    formData = await req.formData()
  } catch {
    return Response.json({ error: 'Datos de formulario inválidos' }, { status: 400 })
  }

  const file = formData.get('image')
  if (!file || !(file instanceof File)) {
    return Response.json({ error: 'No se proporcionó imagen' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return Response.json({ error: 'El archivo debe ser una imagen' }, { status: 400 })
  }

  const store = getStore('images')
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const key = `${Date.now()}-${safeName}`
  const buffer = await file.arrayBuffer()

  await store.set(key, buffer, {
    metadata: { contentType: file.type }
  })

  return Response.json({
    key,
    url: `/api/images/${key}`,
    name: file.name,
    size: file.size,
    type: file.type
  })
}

export const config = {
  path: '/api/upload'
}
