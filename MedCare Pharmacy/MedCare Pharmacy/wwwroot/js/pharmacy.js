/* ============================================================
   pharmacy.js — Logic khu vực Dược sĩ
   ============================================================ */

/* ---------- POS ---------- */
let posInvoice = [];

function initPos() {
    const gridEl = document.getElementById("posGrid");
    if (!gridEl) return;
    renderPosGrid(DEMO_PRODUCTS);
    renderInvoice();

    document.getElementById("posSearch").addEventListener("input", (e) => {
        const kw = e.target.value.trim().toLowerCase();
        const data = DEMO_PRODUCTS.filter(p =>
            p.name.toLowerCase().includes(kw) ||
            (p.active || "").toLowerCase().includes(kw)
        );
        renderPosGrid(data);
    });

    document.getElementById("btnCheckout").onclick = doPosCheckout;
    document.getElementById("btnClearInvoice").onclick = () => {
        if (!posInvoice.length) return;
        if (confirm("Xóa toàn bộ hóa đơn?")) { posInvoice = []; renderInvoice(); }
    };
}

function renderPosGrid(data) {
    const gridEl = document.getElementById("posGrid");
    gridEl.innerHTML = data.map(p => `
        <div class="pos-card" onclick="posAdd(${p.id})">
            <div class="ic">${p.icon}</div>
            <div class="nm">${escapeHtml(p.name)}</div>
            <div class="pr">${formatPrice(p.price)}</div>
            <div class="st">Tồn: ${p.stock}</div>
        </div>
    `).join("");
}

function posAdd(id) {
    const p = DEMO_PRODUCTS.find(x => x.id === id);
    if (!p || p.stock === 0) { showToast("Sản phẩm hết hàng", "warn"); return; }
    const it = posInvoice.find(x => x.id === id);
    if (it) it.quantity++;
    else posInvoice.push({ id: p.id, name: p.name, price: p.price, quantity: 1 });
    renderInvoice();
}

function renderInvoice() {
    const listEl = document.getElementById("invList");
    const totEl = document.getElementById("invTotals");
    const cntEl = document.getElementById("invCount");
    if (!listEl) return;

    if (!posInvoice.length) {
        listEl.innerHTML = `<p class="empty">Chưa có sản phẩm trong hóa đơn.</p>`;
    } else {
        listEl.innerHTML = posInvoice.map(i => `
            <div class="inv-row">
                <div>
                    <div style="font-weight:600">${escapeHtml(i.name)}</div>
                    <div class="text-muted" style="font-size:12px">${formatPrice(i.price)}</div>
                </div>
                <div class="q">
                    <input type="number" min="1" value="${i.quantity}"
                           onchange="posQty(${i.id}, this.value)">
                </div>
                <button class="rm" onclick="posRemove(${i.id})">✕</button>
            </div>
        `).join("");
    }

    const subtotal = posInvoice.reduce((s, i) => s + i.price * i.quantity, 0);
    const vat = Math.round(subtotal * 0.05);
    const total = subtotal + vat;

    cntEl.textContent = posInvoice.reduce((s, i) => s + i.quantity, 0);
    totEl.innerHTML = `
        <div class="row"><span>Tạm tính</span><b>${formatPrice(subtotal)}</b></div>
        <div class="row"><span>VAT (5%)</span><b>${formatPrice(vat)}</b></div>
        <div class="row grand"><span>Khách phải trả</span><span>${formatPrice(total)}</span></div>
    `;
}

window.posQty = (id, v) => {
    const it = posInvoice.find(x => x.id === id);
    if (!it) return;
    const q = Math.max(1, +v || 1);
    it.quantity = q;
    renderInvoice();
};
window.posRemove = (id) => {
    posInvoice = posInvoice.filter(x => x.id !== id);
    renderInvoice();
};

async function doPosCheckout() {
    if (!posInvoice.length) { showToast("Hóa đơn trống", "error"); return; }
    const subtotal = posInvoice.reduce((s, i) => s + i.price * i.quantity, 0);
    const total = subtotal + Math.round(subtotal * 0.05);

    try {
        posInvoice.forEach(i => {
            const p = DEMO_PRODUCTS.find(x => x.id === i.id);
            if (p) p.stock = Math.max(0, p.stock - i.quantity);
        });

        showToast(`Thanh toán thành công ${formatPrice(total)}`);
        posInvoice = [];
        renderInvoice();
        renderPosGrid(DEMO_PRODUCTS);
    } catch (err) {
        showToast(err.message, "error");
    }
}

/* ---------- Online Orders ---------- */
const DEMO_ONLINE_ORDERS = [
    { id: "MC1001", customer: "Nguyễn Văn A", phone: "0901234567", items: "2× Paracetamol, 1× Vitamin C", total: 110000, createdAt: "2025-01-12T09:30:00", status: "Chờ xử lý", hasRx: true },
    { id: "MC1002", customer: "Trần Thị B", phone: "0912345678", items: "1× Omega 3", total: 220000, createdAt: "2025-01-12T10:15:00", status: "Đang kiểm tra", hasRx: false },
    { id: "MC1003", customer: "Lê Văn C", phone: "0938765432", items: "3× Siro ho trẻ em", total: 285000, createdAt: "2025-01-12T11:00:00", status: "Đã duyệt", hasRx: true }
];

function initOnlineOrders() {
    const tbody = document.getElementById("ordersBody");
    if (!tbody) return;
    const orders = LS.get("medcare_online_orders", DEMO_ONLINE_ORDERS);
    LS.set("medcare_online_orders", orders);
    renderOrders(orders);
}

function renderOrders(orders) {
    const tbody = document.getElementById("ordersBody");
    if (!orders.length) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty">Không có đơn hàng.</td></tr>`;
        return;
    }
    const badgeMap = {
        "Chờ xử lý": "warn",
        "Đang kiểm tra": "info",
        "Đã duyệt": "success",
        "Đã hủy": "danger",
        "Đang giao": "info",
        "Đã giao": "success"
    };
    tbody.innerHTML = orders.map((o, idx) => `
        <tr>
            <td><b>#${escapeHtml(o.id)}</b></td>
            <td>${escapeHtml(o.customer)}<br><span class="text-muted" style="font-size:12px">${escapeHtml(o.phone)}</span></td>
            <td>${escapeHtml(o.items)}</td>
            <td>${o.hasRx ? '<span class="badge info">📎 Có</span>' : '<span class="badge muted">Không</span>'}</td>
            <td>${formatPrice(o.total)}</td>
            <td>${formatDateTime(o.createdAt)}</td>
            <td><span class="badge ${badgeMap[o.status] || "muted"}">${escapeHtml(o.status)}</span></td>
            <td>
                <div class="actions">
                    ${o.hasRx ? `<button class="btn small ghost" onclick="viewRx(${idx})">Xem ĐT</button>` : ""}
                    <button class="btn small"        onclick="approveOrder(${idx})">Duyệt</button>
                    <button class="btn small danger" onclick="cancelOrder(${idx})">Hủy</button>
                </div>
            </td>
        </tr>
    `).join("");
}

window.viewRx = (idx) => {
    const list = LS.get("medcare_online_orders", []);
    const o = list[idx];
    if (!o) return;
    openModal(`
        <h3>Đơn thuốc — Đơn #${escapeHtml(o.id)}</h3>
        <div style="text-align:center;padding:30px;background:#f5faf8;border-radius:10px;font-size:60px">
            🖼️
        </div>
        <p class="text-muted mt-8" style="font-size:13px">Hình ảnh đơn thuốc do khách hàng tải lên (demo).</p>
    `, []);
};

window.approveOrder = (idx) => {
    const list = LS.get("medcare_online_orders", []);
    if (!list[idx]) return;
    list[idx].status = "Đã duyệt";
    LS.set("medcare_online_orders", list);
    renderOrders(list);
    showToast("Đã duyệt đơn " + list[idx].id);
};

window.cancelOrder = (idx) => {
    const list = LS.get("medcare_online_orders", []);
    if (!list[idx]) return;
    if (!confirm("Hủy đơn hàng này?")) return;
    list[idx].status = "Đã hủy";
    LS.set("medcare_online_orders", list);
    renderOrders(list);
    showToast("Đã hủy đơn " + list[idx].id);
};

/* ---------- Inventory Alerts ---------- */
const DEMO_ALERTS = {
    nearExpiry: [
        { name: "Paracetamol 500mg", lot: "LOT001", expiry: "2025-03-10", stock: 40 },
        { name: "Vitamin C 500mg", lot: "LOT023", expiry: "2025-04-02", stock: 25 }
    ],
    expired: [
        { name: "Siro ho trẻ em", lot: "LOT005", expiry: "2024-12-01", stock: 8 }
    ],
    outOfStock: [
        { name: "Nước rửa tay", stock: 0 }
    ],
    lowStock: [
        { name: "Omega 3", stock: 5 },
        { name: "Băng cá nhân", stock: 12 }
    ]
};

function initInventoryAlerts() {
    const root = document.getElementById("alertRoot");
    if (!root) return;
    root.innerHTML = `
        ${alertSection("Cận hạn", "warn", ["Tên thuốc", "Số lô", "Hạn dùng", "Tồn kho"],
        DEMO_ALERTS.nearExpiry.map(a => [a.name, a.lot, formatDate(a.expiry), a.stock]))}
        ${alertSection("Đã hết hạn", "danger", ["Tên thuốc", "Số lô", "Hạn dùng", "Tồn kho"],
            DEMO_ALERTS.expired.map(a => [a.name, a.lot, formatDate(a.expiry), a.stock]))}
        ${alertSection("Hết hàng", "danger", ["Tên thuốc", "Tồn kho"],
                DEMO_ALERTS.outOfStock.map(a => [a.name, a.stock]))}
        ${alertSection("Sắp hết hàng", "warn", ["Tên thuốc", "Tồn kho"],
                    DEMO_ALERTS.lowStock.map(a => [a.name, a.stock]))}
    `;
}

function alertSection(title, cls, cols, rows) {
    const headerRow = cols.map(c => `<th>${c}</th>`).join("");
    const bodyRows = rows.length
        ? rows.map(r => `<tr>${r.map(c => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`).join("")
        : `<tr><td colspan="${cols.length}" class="empty">Không có dữ liệu</td></tr>`;

    return `
        <div class="panel">
            <div class="panel-title">
                <span>${title}</span>
                <span class="badge ${cls}">${rows.length}</span>
            </div>
            <div class="table-wrap">
                <table class="tbl">
                    <thead><tr>${headerRow}</tr></thead>
                    <tbody>${bodyRows}</tbody>
                </table>
            </div>
        </div>
    `;
}

/* ---------- Auto-detect Page Routes ---------- */
document.addEventListener("DOMContentLoaded", () => {
    const p = location.pathname.toLowerCase();
    if (p.includes("/pharmacist/pos")) initPos();
    if (p.includes("/pharmacist/onlineorders")) initOnlineOrders();
    if (p.includes("/pharmacist/inventoryalert")) initInventoryAlerts();

    const dash = document.getElementById("dashStats");
    if (dash && (p.includes("/pharmacist/index") || p === "/pharmacist" || p === "/pharmacist/")) {
        document.getElementById("stRevenue").textContent = formatPrice(4850000);
        document.getElementById("stPosCount").textContent = "23";
        document.getElementById("stOnlineCount").textContent = "6";
        document.getElementById("stAlerts").textContent = "4";
    }
});

/* ---------- Shared modal ---------- */
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
    const actionsHtml = actions.map(a => `<button class="btn ${a.cls || ''}" onclick="${a.onclick || ''}">${a.label}</button>`).join("");
    body.innerHTML = html + `
        <div class="modal-actions">
            ${actionsHtml}
            <button class="btn muted" onclick="closeModal()">Đóng</button>
        </div>
    `;
    bd.classList.add("show");
}

function closeModal() {
    const bd = document.getElementById("globalModal");
    if (bd) bd.classList.remove("show");
}