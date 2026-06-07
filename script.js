/* =============================================
   app.js — Lógica del sitio STEPZ
   ============================================= */

// ── Estado del carrito ──────────────────────
let cart = JSON.parse(localStorage.getItem('stepz-cart')) || [];

// ── DOM Referencias ─────────────────────────
const cartCount    = document.getElementById('cartCount');
const cartBtn      = document.getElementById('cartBtn');
const cartDropdown = document.getElementById('cartDropdown');
const cartClose    = document.getElementById('cartClose');
const cartOverlay  = document.getElementById('cartOverlay');
const cartItems    = document.getElementById('cartItems');
const cartFooter   = document.getElementById('cartFooter');
const cartTotal    = document.getElementById('cartTotal');
const toast        = document.getElementById('toast');
const hamburger    = document.getElementById('hamburger');
const navLinks     = document.getElementById('navLinks');
const navbar       = document.getElementById('navbar');

// ── Navbar: scroll effect ────────────────────
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ── Navbar: hamburger mobile ─────────────────
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Cerrar menú al hacer click en un link
navLinks.querySelectorAll('.navbar__link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// ── Carrito: abrir/cerrar ────────────────────
cartBtn.addEventListener('click', () => {
  cartDropdown.classList.add('open');
  cartOverlay.classList.add('active');
});

function closeCart() {
  cartDropdown.classList.remove('open');
  cartOverlay.classList.remove('active');
}
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// ── Carrito: renderizar ──────────────────────
function renderCart() {
  // Actualizar badge
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = totalItems;

  // Animación badge
  cartCount.classList.add('bump');
  setTimeout(() => cartCount.classList.remove('bump'), 300);

  // Guardar en localStorage
  localStorage.setItem('stepz-cart', JSON.stringify(cart));

  // Renderizar items
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <span>🛒</span>
        <p>Tu carrito está vacío</p>
      </div>`;
    cartFooter.style.display = 'none';
    return;
  }

  cartFooter.style.display = 'block';

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img
        src="${item.img}"
        alt="${item.name}"
        class="cart-item__img"
        onerror="this.src='https://via.placeholder.com/56x56/1a1a1a/gold?text=👟'"
      />
      <div class="cart-item__info">
        <p class="cart-item__name">${item.name}</p>
        <p class="cart-item__price">$${(item.price * item.qty).toFixed(2)}</p>
        <div class="cart-item__qty">
          <button class="qty-minus" data-id="${item.id}">−</button>
          <span>${item.qty}</span>
          <button class="qty-plus"  data-id="${item.id}">+</button>
        </div>
      </div>
      <button class="cart-item__remove" data-id="${item.id}" title="Eliminar">✕</button>
    </div>
  `).join('');

  // Total
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartTotal.textContent = `$${total.toFixed(2)}`;

  // Botones de cantidad y eliminar
  cartItems.querySelectorAll('.qty-minus').forEach(btn => {
    btn.addEventListener('click', () => changeQty(btn.dataset.id, -1));
  });
  cartItems.querySelectorAll('.qty-plus').forEach(btn => {
    btn.addEventListener('click', () => changeQty(btn.dataset.id, 1));
  });
  cartItems.querySelectorAll('.cart-item__remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
  });
}

// ── Carrito: agregar producto ────────────────
function addToCart(id, name, price, img) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price: parseFloat(price), img, qty: 1 });
  }
  renderCart();
  showToast(`✅ "${name}" añadido al carrito`);
}

// ── Carrito: cambiar cantidad ────────────────
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
  renderCart();
}

// ── Carrito: eliminar ────────────────────────
function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
  showToast('🗑️ Producto eliminado');
}

// ── Botones "Añadir al carrito" (event delegation) ──
document.getElementById('productsGrid').addEventListener('click', (e) => {
  const btn = e.target.closest('.add-to-cart');
  if (!btn) return;
  e.preventDefault();
  const { id, name, price, img } = btn.dataset;
  addToCart(id, name, price, img);
  cartDropdown.classList.add('open');
  cartOverlay.classList.add('active');
});

// ── Filtro de categorías ─────────────────────
function applyFilter(filter) {
  document.querySelectorAll('.product-card').forEach(card => {
    const cats = card.dataset.category || '';
    const show = filter === 'todos' || cats.includes(filter);
    card.classList.toggle('hidden', !show);
  });
}

document.querySelectorAll('.pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('pill--active'));
    pill.classList.add('pill--active');
    applyFilter(pill.dataset.filter);
  });
});

// ── Render de producto desde API ─────────────
function renderProductCard(p) {
  const tag = p.tag ? `<span class="product-card__tag product-card__tag--${p.tagType || 'new'}">${p.tag}</span>` : '';
  const oldPrice = p.oldPrice ? `<span class="product-card__price--old">$${parseFloat(p.oldPrice).toFixed(2)}</span>` : '';
  const rating = p.rating || 5;
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  const img = p.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80';

  return `
    <article class="product-card" data-category="${p.category || ''}">
      <div class="product-card__image-wrapper">
        ${tag}
        <img src="${img}" alt="${p.name}" class="product-card__image" loading="lazy" />
        <div class="product-card__overlay">
          <button class="btn btn--gold btn--sm add-to-cart"
            data-id="${p.id}" data-name="${p.name}"
            data-price="${p.price}" data-img="${img}">
            🛒 Añadir al carrito
          </button>
        </div>
      </div>
      <div class="product-card__info">
        <p class="product-card__brand">${p.brand || ''}</p>
        <h3 class="product-card__name">${p.name}</h3>
        <div class="product-card__rating">
          <div class="stars">${stars}</div>
          <span class="product-card__reviews">(${p.reviews || 0})</span>
        </div>
        <div class="product-card__pricing">
          <span class="product-card__price">$${parseFloat(p.price).toFixed(2)}</span>
          ${oldPrice}
        </div>
      </div>
    </article>`;
}

// ── Cargar productos desde la API ─────────────
async function loadProducts() {
  try {
    const res = await fetch('/api/products');
    if (!res.ok) return;
    const items = await res.json();
    if (!items || !items.length) return;

    const grid = document.getElementById('productsGrid');
    grid.innerHTML = items.map(renderProductCard).join('');

    const activeFilter = document.querySelector('.pill--active')?.dataset?.filter || 'todos';
    applyFilter(activeFilter);
  } catch { /* keep static fallback */ }
}

loadProducts();

// ── Toast ────────────────────────────────────
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── Newsletter ───────────────────────────────
document.getElementById('newsletterForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = e.target.querySelector('input');
  if (input.value) {
    showToast('🎉 ¡Suscrito! Revisa tu correo para tu 10% de descuento');
    input.value = '';
  }
});

// ── Inicializar carrito desde localStorage ───
renderCart();