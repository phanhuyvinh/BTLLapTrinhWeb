/* ============================================================
   main.js — Tiện ích dùng chung toàn hệ thống
   Bao gồm: format, toast, escape HTML, query params, storage.
   ============================================================ */

/* --------- Format --------- */
function formatPrice(v) {
    return Number(v || 0).toLocaleString("vi-VN") + "đ";
}
function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("vi-VN");
}
function formatDateTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleString("vi-VN");
}

/* --------- Escape HTML (chống XSS khi render từ dữ liệu) --------- */
function escapeHtml(s) {
    return String(s ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

/* --------- Toast --------- */
function ensureToastEl() {
    let el = document.getElementById("toast");
    if (!el) {
        el = document.createElement("div");
        el.id = "toast";
        el.className = "toast";
        document.body.appendChild(el);
    }
    return el;
}
function showToast(message, type = "info") {
    const el = ensureToastEl();
    el.textContent = message;
    el.style.background =
        type === "error" ? "#b91c1c" :
        type === "warn"  ? "#b45309" :
        "#16352d";
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 2400);
}

/* --------- Query string --------- */
function getQuery(name) {
    return new URLSearchParams(location.search).get(name) || "";
}

/* --------- localStorage helpers --------- */
const LS = {
    get(key, fallback = null) {
        try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
        catch { return fallback; }
    },
    set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
    remove(key) { localStorage.removeItem(key); }
};

/* --------- Danh mục dùng chung --------- */
const CATEGORIES = [
    { id: "Thuốc",              icon: "💊" },
    { id: "Vitamin",            icon: "🍊" },
    { id: "Dược mỹ phẩm",       icon: "🧴" },
    { id: "Thiết bị y tế",      icon: "🩺" },
    { id: "Chăm sóc cá nhân",   icon: "🧼" },
    { id: "Mẹ & Bé",            icon: "👶" }
];

/* --------- Sản phẩm demo (dùng chung khi chưa có backend) --------- */
const DEMO_PRODUCTS = [
    { id: 1, name: "Paracetamol 500mg", category: "Thuốc",            active: "Paracetamol",   price: 25000,  stock: 120, icon: "💊", rating: 4.9, unit: "Hộp",   supplier: "NCC Dược Hậu Giang", desc: "Giảm đau, hạ sốt." },
    { id: 2, name: "Vitamin C 500mg",   category: "Vitamin",          active: "Acid ascorbic", price: 60000,  stock: 85,  icon: "🍊", rating: 4.8, unit: "Hộp",   supplier: "NCC Vitamin VN",   desc: "Bổ sung vitamin C, tăng đề kháng." },
    { id: 3, name: "Nhiệt kế điện tử",  category: "Thiết bị y tế",    active: "—",             price: 85000,  stock: 30,  icon: "🌡️", rating: 4.7, unit: "Cái",   supplier: "NCC Thiết bị y tế", desc: "Đo nhiệt độ cơ thể nhanh, chính xác." },
    { id: 4, name: "Kem dưỡng ẩm",       category: "Dược mỹ phẩm",     active: "Glycerin",      price: 145000, stock: 45,  icon: "🧴", rating: 4.8, unit: "Tuýp",  supplier: "NCC Mỹ phẩm",     desc: "Dưỡng ẩm cho da khô." },
    { id: 5, name: "Nước rửa tay",       category: "Chăm sóc cá nhân", active: "—",             price: 42000,  stock: 0,   icon: "🧼", rating: 4.6, unit: "Chai",  supplier: "NCC Gia dụng",    desc: "Sát khuẩn tay nhanh." },
    { id: 6, name: "Siro ho trẻ em",    category: "Mẹ & Bé",          active: "Cao lá thường xuân", price: 95000, stock: 22, icon: "🍼", rating: 4.9, unit: "Chai",  supplier: "NCC Mẹ & Bé",     desc: "Giảm ho cho trẻ từ 2 tuổi." },
    { id: 7, name: "Băng cá nhân",       category: "Thiết bị y tế",    active: "—",             price: 18000,  stock: 200, icon: "🩹", rating: 4.7, unit: "Hộp",   supplier: "NCC Y tế A",      desc: "Băng vết thương nhỏ." },
    { id: 8, name: "Omega 3",            category: "Vitamin",          active: "Omega 3-6-9",   price: 220000, stock: 12,  icon: "💚", rating: 4.8, unit: "Hộp",   supplier: "NCC Vitamin VN",  desc: "Hỗ trợ tim mạch, não bộ." }
];

/* --------- Sản phẩm demo cho trang chủ --------- */
function renderHomeProducts() {
    const listEl = document.getElementById("productList");
    if (!listEl) return;

    const sortEl = document.getElementById("sortSelect");
    let data = [...DEMO_PRODUCTS];

    if (sortEl) {
        if (sortEl.value === "low")  data.sort((a, b) => a.price - b.price);
        if (sortEl.value === "high") data.sort((a, b) => b.price - a.price);
    }
    data = data.slice(0, 8);

    listEl.innerHTML = data.map(p => `
        <article class="product">
            <div class="product-image">${p.icon}</div>
            <div class="product-body">
                <span class="product-category">${escapeHtml(p.category)}</span>
                <h3>${escapeHtml(p.name)}</h3>
                <div class="rating">★ ${p.rating}</div>
                <div class="price">${formatPrice(p.price)}</div>
                <button class="add-cart" onclick="addToCart(${p.id})">Thêm vào giỏ</button>
            </div>
        </article>
    `).join("");
}


/* ---------- Modal dùng chung ---------- */
function openModal(html, actions = []) {
    let bd = document.getElementById("globalModal");
    if (!bd) {
        bd = document.createElement("div");
        bd.id = "globalModal";
        bd.className = "modal-backdrop";
        bd.innerHTML = `<div class="modal" id="globalModalBody"></div>`;
        bd.addEventListener("click", e => { if (e.target === bd) closeModal(); });
        document.body.appendChild(bd);
    }
    const body = document.getElementById("globalModalBody");
    body.innerHTML = html + `
        <div class="modal-actions">
            ${actions.map(a => `<button class="btn ${a.cls || ''}" onclick="${a.onclick || ''}">${a.label}</button>`).join("")}
            <button class="btn muted" onclick="closeModal()">Đóng</button>
        </div>
    `;
    bd.classList.add("show");
}
function closeModal() {
    const bd = document.getElementById("globalModal");
    if (bd) bd.classList.remove("show");
}