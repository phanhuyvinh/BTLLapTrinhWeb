/* ============================================================
   cart.js — Giỏ hàng demo (localStorage)
   LƯU Ý: localStorage chỉ mô phỏng frontend.
   Khi tích hợp backend thật, giỏ hàng phải quản lý ở server
   (session / DB) thông qua /api/cart.
   ============================================================ */

const CART_KEY = "medcare_cart";

function getCart() {
    return LS.get(CART_KEY, []);
}
function saveCart(cart) {
    LS.set(CART_KEY, cart);
    updateCartCount();
}
function updateCartCount() {
    const el = document.getElementById("cartCount");
    if (!el) return;
    const cart = getCart();
    el.textContent = cart.reduce((s, i) => s + i.quantity, 0);
}
function addToCart(productId, quantity = 1) {
    const p = DEMO_PRODUCTS.find(x => x.id === productId);
    if (!p) return;

    const cart = getCart();
    const item = cart.find(x => x.id === productId);
    if (item) item.quantity += quantity;
    else cart.push({
        id: p.id, name: p.name, price: p.price,
        icon: p.icon, unit: p.unit || "Hộp",
        quantity
    });

    saveCart(cart);
    showToast(`Đã thêm "${p.name}" vào giỏ hàng`);
}
function updateCartItem(id, quantity) {
    const cart = getCart();
    const it = cart.find(x => x.id === id);
    if (!it) return;
    if (quantity <= 0) return removeCartItem(id);
    it.quantity = quantity;
    saveCart(cart);
}
function removeCartItem(id) {
    saveCart(getCart().filter(x => x.id !== id));
}
function clearCart() { saveCart([]); }

function getCartTotals({ shipping = 30000, freeThreshold = 300000 } = {}) {
    const cart = getCart();
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const fee = subtotal >= freeThreshold || subtotal === 0 ? 0 : shipping;
    return { subtotal, shipping: fee, total: subtotal + fee, count: cart.length };
}