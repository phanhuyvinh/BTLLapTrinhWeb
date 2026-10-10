/* ============================================================
   customer.js — Logic các trang customer/*.html
   ============================================================ */

/* ---------- products.html: danh sách + lọc + tìm kiếm ---------- */
function initProductsPage() {
    const listEl = document.getElementById("productList");
    if (!listEl) return;

    const q = getQuery("q").toLowerCase();
    const catParam = getQuery("cat");

    const state = {
        keyword: q,
        category: catParam,
        prices: [],
        sort: "default"
    };

    const $kw = document.getElementById("filterKeyword");
    if ($kw) $kw.value = q;

    // đánh dấu category đang chọn
    document.querySelectorAll("input[name='cat']").forEach(el => {
        if (el.value === catParam) el.checked = true;
    });
    document.querySelectorAll("input[name='price']").forEach(el => {
        el.addEventListener("change", () => {
            state.prices = [...document.querySelectorAll("input[name='price']:checked")]
                .map(x => x.value);
            render();
        });
    });
    document.querySelectorAll("input[name='cat']").forEach(el => {
        el.addEventListener("change", () => {
            state.category = el.checked ? el.value : "";
            render();
        });
    });
    if ($kw) $kw.addEventListener("input", () => { state.keyword = $kw.value.trim().toLowerCase(); render(); });
    const sortEl = document.getElementById("sortSelect");
    if (sortEl) sortEl.addEventListener("change", () => { state.sort = sortEl.value; render(); });

    function matchPrice(p) {
        if (!state.prices.length) return true;
        return state.prices.some(r => {
            if (r === "low") return p.price < 100000;
            if (r === "mid") return p.price >= 100000 && p.price <= 500000;
            if (r === "high") return p.price > 500000;
            return true;
        });
    }

    function render() {
        let data = DEMO_PRODUCTS.filter(p => {
            const okKw = !state.keyword ||
                p.name.toLowerCase().includes(state.keyword) ||
                (p.active || "").toLowerCase().includes(state.keyword);
            const okCat = !state.category || p.category === state.category;
            return okKw && okCat && matchPrice(p);
        });

        if (state.sort === "low") data.sort((a, b) => a.price - b.price);
        if (state.sort === "high") data.sort((a, b) => b.price - a.price);
        if (state.sort === "rating") data.sort((a, b) => b.rating - a.rating);

        if (!data.length) {
            listEl.innerHTML = `<p class="empty">Không tìm thấy sản phẩm phù hợp.</p>`;
            return;
        }
        listEl.innerHTML = data.map(p => `
            <article class="product">
                <div class="product-image">${p.icon}</div>
                <div class="product-body">
                    <span class="product-category">${escapeHtml(p.category)}</span>
                    <h3>${escapeHtml(p.name)}</h3>
                    <div class="rating">★ ${p.rating} · HC: ${escapeHtml(p.active || "—")}</div>
                    <div class="price">${formatPrice(p.price)}</div>
                    <div class="text-muted" style="font-size:12px;margin-bottom:8px">
                        Tồn kho: ${p.stock > 0 ? p.stock : "Hết hàng"}
                    </div>
                    <div style="display:flex;gap:6px">
                        <a class="btn ghost small" style="flex:1;text-align:center;text-decoration:none"
                           href="product-detail.html?id=${p.id}">Xem</a>
                        <button class="add-cart" style="flex:1"
                                onclick="addToCart(${p.id})"
                                ${p.stock === 0 ? "disabled" : ""}>
                            ${p.stock === 0 ? "Hết hàng" : "Thêm giỏ"}
                        </button>
                    </div>
                </div>
            </article>
        `).join("");
    }
    render();
}

/* ---------- product-detail.html ---------- */
function initProductDetailPage() {
    const box = document.getElementById("pdBox");
    if (!box) return;

    const id = Number(getQuery("id") || 1);
    const p = DEMO_PRODUCTS.find(x => x.id === id) || DEMO_PRODUCTS[0];

    document.getElementById("pdIcon").textContent = p.icon;
    document.getElementById("pdName").textContent = p.name;
    document.getElementById("pdCat").textContent = p.category;
    document.getElementById("pdActive").textContent = p.active || "—";
    document.getElementById("pdPrice").textContent = formatPrice(p.price);
    document.getElementById("pdStock").textContent = p.stock > 0 ? `${p.stock} ${p.unit || ""}` : "Hết hàng";
    document.getElementById("pdDesc").textContent = p.desc || "Đang cập nhật mô tả.";
    document.getElementById("pdUnit").textContent = p.unit || "Hộp";
    document.getElementById("pdSupplier").textContent = p.supplier || "—";

    const qtyInput = document.getElementById("pdQty");
    const btnMinus = document.getElementById("pdMinus");
    const btnPlus = document.getElementById("pdPlus");
    const btnAdd = document.getElementById("pdAdd");
    const btnBuy = document.getElementById("pdBuy");

    btnMinus.onclick = () => { qtyInput.value = Math.max(1, +qtyInput.value - 1); };
    btnPlus.onclick = () => { qtyInput.value = +qtyInput.value + 1; };
    btnAdd.onclick = () => addToCart(p.id, +qtyInput.value || 1);
    btnBuy.onclick = () => { addToCart(p.id, +qtyInput.value || 1); setTimeout(() => location.href = "/Customer/Cart", 300); };
}

/* ---------- cart.html ---------- */
function initCartPage() {
    const wrap = document.getElementById("cartWrap");
    if (!wrap) return;

    function render() {
        const cart = getCart();
        if (!cart.length) {
            wrap.innerHTML = `<p class="empty">Giỏ hàng trống. <a href="/Customer/Products">Mua sắm ngay</a></p>`;
            renderSummary({ subtotal: 0, shipping: 0, total: 0 });
            return;
        }
        wrap.innerHTML = cart.map(i => `
            <div class="cart-item" data-id="${i.id}">
                <div class="thumb">${i.icon || "💊"}</div>
                <div>
                    <div style="font-weight:600">${escapeHtml(i.name)}</div>
                    <div class="text-muted" style="font-size:13px">${formatPrice(i.price)} / ${i.unit || "Hộp"}</div>
                </div>
                <div class="qty">
                    <input type="number" min="1" value="${i.quantity}"
                           onchange="onCartQtyChange(${i.id}, this.value)">
                </div>
                <div style="font-weight:700;min-width:100px;text-align:right">
                    ${formatPrice(i.price * i.quantity)}
                </div>
                <button class="rm" title="Xóa" onclick="onCartRemove(${i.id})">✕</button>
            </div>
        `).join("");
        renderSummary(getCartTotals());
    }

    function renderSummary(t) {
        const sum = document.getElementById("cartSummary");
        if (!sum) return;
        sum.innerHTML = `
            <h3 style="margin-bottom:14px">Tóm tắt đơn hàng</h3>
            <div class="row"><span>Tạm tính</span><b>${formatPrice(t.subtotal)}</b></div>
            <div class="row"><span>Phí giao hàng</span><b>${t.shipping === 0 ? "Miễn phí" : formatPrice(t.shipping)}</b></div>
            <div class="total"><span>Tổng cộng</span><span>${formatPrice(t.total)}</span></div>
            <a class="primary-btn" style="display:block;text-align:center;text-decoration:none;margin-top:16px"
               href="/Customer/Checkout">Tiến hành đặt hàng</a>
            <button class="btn muted" style="width:100%;margin-top:8px" onclick="onCartClear()">Xóa giỏ hàng</button>
        `;
    }

    window.onCartQtyChange = (id, v) => { updateCartItem(id, +v); render(); };
    window.onCartRemove = (id) => { removeCartItem(id); showToast("Đã xóa sản phẩm"); render(); };
    window.onCartClear = () => { if (confirm("Xóa toàn bộ giỏ hàng?")) { clearCart(); render(); } };

    render();
}

/* ---------- checkout.html ---------- */
function initCheckoutPage() {
    const form = document.getElementById("checkoutForm");
    if (!form) return;

    // Render review
    const cart = getCart();
    const review = document.getElementById("orderReview");
    review.innerHTML = cart.length
        ? cart.map(i => `<div class="line"><span>${i.quantity}× ${escapeHtml(i.name)}</span><span>${formatPrice(i.price * i.quantity)}</span></div>`).join("")
        : `<p class="empty">Chưa có sản phẩm. <a href="products.html">Mua sắm</a></p>`;

    const t = getCartTotals();
    document.getElementById("ckSubtotal").textContent = formatPrice(t.subtotal);
    document.getElementById("ckShipping").textContent = t.shipping === 0 ? "Miễn phí" : formatPrice(t.shipping);
    document.getElementById("ckTotal").textContent = formatPrice(t.total);

    // File prescription
    const fileInput = document.getElementById("rxFile");
    const fileName = document.getElementById("rxFileName");
    fileInput.addEventListener("change", () => {
        if (fileInput.files.length) {
            fileName.textContent = "📎 " + fileInput.files[0].name;
        } else {
            fileName.textContent = "";
        }
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form));

        if (!data.name || !data.phone || !data.address || !data.city) {
            showToast("Vui lòng nhập đủ thông tin giao hàng", "error"); return;
        }
        if (!/^[0-9+\-\s()]{8,15}$/.test(data.phone)) {
            showToast("Số điện thoại không hợp lệ", "error"); return;
        }
        if (!cart.length) { showToast("Giỏ hàng trống", "error"); return; }

        /* Backend thật:
        const fd = new FormData();
        Object.entries(data).forEach(([k, v]) => fd.append(k, v));
        if (fileInput.files[0]) fd.append("prescription", fileInput.files[0]);
        await apiPost(API.ORDERS, fd);
        */

        // Demo: lưu đơn vào localStorage
        const orders = LS.get("medcare_orders", []);
        orders.unshift({
            id: "MC" + Date.now().toString().slice(-6),
            createdAt: new Date().toISOString(),
            customer: data,
            items: cart,
            total: t.total,
            status: "Chờ xử lý",
            hasPrescription: !!fileInput.files[0]
        });
        LS.set("medcare_orders", orders);
        clearCart();

        showToast("Đặt hàng thành công!");
        setTimeout(() => location.href = "/Customer/Orders", 600);
    });
}

/* ---------- orders.html ---------- */
function initOrdersPage() {
    const wrap = document.getElementById("ordersWrap");
    if (!wrap) return;

    const orders = LS.get("medcare_orders", []);
    if (!orders.length) {
        wrap.innerHTML = `<p class="empty">Bạn chưa có đơn hàng nào. <a href="products.html">Mua sắm ngay</a></p>`;
        return;
    }
    const badgeMap = {
        "Chờ xử lý": "warn",
        "Đang kiểm tra": "info",
        "Đã duyệt": "info",
        "Đang giao": "info",
        "Đã giao": "success",
        "Đã hủy": "danger"
    };
    wrap.innerHTML = orders.map(o => `
        <div class="order-card">
            <div class="head">
                <div>
                    <div class="code">#${escapeHtml(o.id)}</div>
                    <div class="text-muted" style="font-size:13px">${formatDateTime(o.createdAt)}</div>
                </div>
                <span class="badge ${badgeMap[o.status] || "muted"}">${escapeHtml(o.status)}</span>
            </div>
            <div class="items">
                ${o.items.map(i => `${i.quantity}× ${escapeHtml(i.name)}`).join(" · ")}
            </div>
            <div class="foot">
                <span class="text-muted">${o.hasPrescription ? "📎 Có đơn thuốc" : "Không có đơn thuốc"}</span>
                <span class="total">${formatPrice(o.total)}</span>
            </div>
        </div>
    `).join("");
}

/* ---------- prescription.html ---------- */
function initPrescriptionPage() {
    const list = document.getElementById("rxList");
    if (!list) return;

    const items = LS.get("medcare_prescriptions", []);
    render(items);

    function render(data) {
        if (!data.length) {
            list.innerHTML = `<p class="empty">Chưa có đơn thuốc nào được tải lên.</p>`;
            return;
        }
        list.innerHTML = data.map((rx, idx) => `
            <div class="rx-item">
                <div class="preview">${rx.type === "pdf" ? "📄" : "🖼️"}</div>
                <div style="font-weight:600">${escapeHtml(rx.name)}</div>
                <div class="text-muted" style="font-size:12px;margin-top:4px">${formatDateTime(rx.uploadedAt)}</div>
                <button class="btn danger small" style="margin-top:8px"
                        onclick="removeRx(${idx})">Xóa</button>
            </div>
        `).join("");
    }

    window.removeRx = (idx) => {
        const cur = LS.get("medcare_prescriptions", []);
        cur.splice(idx, 1);
        LS.set("medcare_prescriptions", cur);
        render(cur);
        showToast("Đã xóa đơn thuốc");
    };

    const input = document.getElementById("rxUpload");
    input.addEventListener("change", () => {
        const file = input.files[0];
        if (!file) return;
        const ext = (file.name.split(".").pop() || "").toLowerCase();
        if (!["png", "jpg", "jpeg", "pdf"].includes(ext)) {
            showToast("Chỉ hỗ trợ PNG, JPG, JPEG, PDF", "error"); return;
        }
        const cur = LS.get("medcare_prescriptions", []);
        cur.unshift({
            name: file.name,
            type: ext === "pdf" ? "pdf" : "image",
            uploadedAt: new Date().toISOString()
        });
        LS.set("medcare_prescriptions", cur);
        render(cur);
        showToast("Đã tải lên đơn thuốc");
        input.value = "";
    });
}

/* ---------- bootstrap auto-detect page ---------- */
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    const p = location.pathname.toLowerCase();
    if (p.includes("/customer/products")) initProductsPage();
    if (p.includes("/customer/productdetail")) initProductDetailPage();
    if (p.includes("/customer/cart")) initCartPage();
    if (p.includes("/customer/checkout")) initCheckoutPage();
    if (p.includes("/customer/orders")) initOrdersPage();
    if (p.includes("/customer/prescription")) initPrescriptionPage();
});