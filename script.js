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

// ── Botones "Añadir al carrito" ──────────────
document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const { id, name, price, img } = btn.dataset;
    addToCart(id, name, price, img);
    // Abrir carrito automáticamente
    cartDropdown.classList.add('open');
    cartOverlay.classList.add('active');
  });
});

// ── Filtro de categorías ─────────────────────
document.querySelectorAll('.pill').forEach(pill => {
  pill.addEventListener('click', () => {
    // Actualizar pills activos
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('pill--active'));
    pill.classList.add('pill--active');

    const filter = pill.dataset.filter;
    const cards  = document.querySelectorAll('.product-card');

    cards.forEach(card => {
      const cats = card.dataset.category || '';
      const show = filter === 'todos' || cats.includes(filter);
      card.classList.toggle('hidden', !show);
    });
  });
});

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