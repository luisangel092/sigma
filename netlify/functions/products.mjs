import { getStore } from '@netlify/blobs'

const DEFAULT_PRODUCTS = [
  {
    id: '1',
    brand: 'Nike',
    name: 'Air Max Pro',
    price: 85.00,
    category: 'hombre deportivo',
    tagType: 'new',
    tag: 'Nuevo',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
    rating: 5,
    reviews: 128
  },
  {
    id: '2',
    brand: 'Adidas',
    name: 'Cloud Runner Mujer',
    price: 72.00,
    oldPrice: 90.00,
    category: 'mujer casual',
    tagType: 'sale',
    tag: '-20%',
    imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80',
    rating: 4,
    reviews: 94
  },
  {
    id: '3',
    brand: 'Puma',
    name: 'Classic Street',
    price: 65.00,
    category: 'hombre casual',
    tagType: '',
    tag: '',
    imageUrl: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=500&q=80',
    rating: 4,
    reviews: 57
  },
  {
    id: '4',
    brand: 'New Balance',
    name: '550 Classic',
    price: 78.00,
    oldPrice: 111.00,
    category: 'mujer oferta',
    tagType: 'sale',
    tag: '-30%',
    imageUrl: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=500&q=80',
    rating: 5,
    reviews: 203
  },
  {
    id: '5',
    brand: 'Jordan',
    name: 'Retro High OG',
    price: 120.00,
    category: 'hombre deportivo oferta',
    tagType: 'hot',
    tag: '🔥 Hot',
    imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&q=80',
    rating: 5,
    reviews: 341
  },
  {
    id: '6',
    brand: 'Vans',
    name: 'Old Skool Platform',
    price: 58.00,
    category: 'mujer casual',
    tagType: 'new',
    tag: 'Nuevo',
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80',
    rating: 4,
    reviews: 88
  }
]

function getAdminKey() {
  return Netlify.env.get('ADMIN_KEY') || 'sigma-admin-2025'
}

async function fetchCatalog() {
  const store = getStore('products')
  return await store.get('catalog', { type: 'json' })
}

async function saveCatalog(products) {
  const store = getStore('products')
  await store.setJSON('catalog', products)
}

export default async (req) => {
  const url = new URL(req.url)
  const method = req.method

  if (method === 'GET') {
    let products = await fetchCatalog()
    if (!products || products.length === 0) {
      products = DEFAULT_PRODUCTS
      await saveCatalog(products)
    }
    return Response.json(products)
  }

  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== getAdminKey()) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  if (method === 'POST') {
    const product = await req.json()
    const products = (await fetchCatalog()) || []
    product.id = Date.now().toString()
    products.push(product)
    await saveCatalog(products)
    return Response.json(product, { status: 201 })
  }

  if (method === 'PUT') {
    const id = url.searchParams.get('id')
    const updates = await req.json()
    const products = (await fetchCatalog()) || []
    const idx = products.findIndex(p => p.id === id)
    if (idx === -1) return Response.json({ error: 'No encontrado' }, { status: 404 })
    products[idx] = { ...products[idx], ...updates }
    await saveCatalog(products)
    return Response.json(products[idx])
  }

  if (method === 'DELETE') {
    const id = url.searchParams.get('id')
    const products = (await fetchCatalog()) || []
    await saveCatalog(products.filter(p => p.id !== id))
    return new Response(null, { status: 204 })
  }

  return new Response('Método no permitido', { status: 405 })
}

export const config = {
  path: '/api/products'
}
