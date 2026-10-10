/* ============================================================
   admin.js — Logic khu vực Admin
   (Đã cập nhật khớp chuẩn ASP.NET Core MVC Routes)
   ============================================================ */

/* ---------- Dashboard ---------- */
function initAdminDashboard() {
    const root = document.getElementById("adminStats");
    if (!root) return;
    document.getElementById("stRevenue").textContent = formatPrice(125800000);
    document.getElementById("stOrders").textContent = "482";
    document.getElementById("stProducts").textContent = DEMO_PRODUCTS.length;
    document.getElementById("stUsers").textContent = "156";
    document.getElementById("stAlerts").textContent = "4";
}

/* ---------- Medicines CRUD ---------- */
const MED_KEY = "medcare_medicines";
function getMedicines() {
    let list = LS.get(MED_KEY);
    if (!list) { list = [...DEMO_PRODUCTS]; LS.set(MED_KEY, list); }
    return list;
}
function saveMedicines(list) { LS.set(MED_KEY, list); }

function initMedicinesPage() {
    const tbody = document.getElementById("medBody");
    if (!tbody) return;

    render();
    document.getElementById("btnAddMed").onclick = () => openMedicineForm();

    function render() {
        const list = getMedicines();
        tbody.innerHTML = list.map(m => `
            <tr>
                <td>${m.id}</td>
                <td><b>${escapeHtml(m.name)}</b></td>
                <td>${escapeHtml(m.active || "—")}</td>
                <td>${formatPrice(m.price)}</td>
                <td>${m.stock}</td>
                <td>${escapeHtml(m.category)}</td>
                <td>${escapeHtml(m.supplier || "—")}</td>
                <td>
                    <div class="actions">
                        <button class="btn small ghost" onclick="editMed(${m.id})">Sửa</button>
                        <button class="btn small danger" onclick="deleteMed(${m.id})">Xóa</button>
                    </div>
                </td>
            </tr>
        `).join("");
    }

    window.openMedicineForm = (med = null) => {
        const cats = CATEGORIES.map(c => `<option ${med && med.category === c.id ? "selected" : ""}>${c.id}</option>`).join("");
        openModal(`
            <h3>${med ? "Sửa" : "Thêm"} thuốc</h3>
            <div class="form-grid">
                <div class="form-field full"><label>Tên thuốc</label><input id="mName" value="${med ? escapeHtml(med.name) : ""}"></div>
                <div class="form-field"><label>Hoạt chất</label><input id="mActive" value="${med ? escapeHtml(med.active || "") : ""}"></div>
                <div class="form-field"><label>Danh mục</label><select id="mCat">${cats}</select></div>
                <div class="form-field"><label>Giá (đ)</label><input id="mPrice" type="number" min="0" value="${med ? med.price : 0}"></div>
                <div class="form-field"><label>Tồn kho</label><input id="mStock" type="number" min="0" value="${med ? med.stock : 0}"></div>
                <div class="form-field"><label>Đơn vị</label><input id="mUnit" value="${med ? escapeHtml(med.unit || "Hộp") : "Hộp"}"></div>
                <div class="form-field"><label>Nhà cung cấp</label><input id="mSupplier" value="${med ? escapeHtml(med.supplier || "") : ""}"></div>
                <div class="form-field full"><label>Mô tả</label><textarea id="mDesc" rows="2">${med ? escapeHtml(med.desc || "") : ""}</textarea></div>
            </div>
            <div id="mError" class="error"></div>
        `, [{ label: med ? "Cập nhật" : "Thêm", cls: "", onclick: `saveMed(${med ? med.id : "null"})` }]);
    };

    window.saveMed = (id) => {
        const name = document.getElementById("mName").value.trim();
        const price = +document.getElementById("mPrice").value;
        const stock = +document.getElementById("mStock").value;
        if (!name) { showToast("Tên thuốc bắt buộc", "error"); return; }
        if (price < 0 || stock < 0) { showToast("Giá và tồn kho >= 0", "error"); return; }

        const data = {
            name,
            active: document.getElementById("mActive").value.trim(),
            category: document.getElementById("mCat").value,
            price, stock,
            unit: document.getElementById("mUnit").value.trim() || "Hộp",
            supplier: document.getElementById("mSupplier").value.trim(),
            desc: document.getElementById("mDesc").value.trim(),
            icon: "💊",
            rating: 4.8
        };

        const list = getMedicines();
        if (id) {
            const idx = list.findIndex(x => x.id === id);
            list[idx] = { ...list[idx], ...data };
        } else {
            data.id = Math.max(0, ...list.map(x => x.id)) + 1;
            list.push(data);
        }
        saveMedicines(list);
        closeModal();
        render();
        showToast("Đã lưu thuốc");
    };

    window.editMed = (id) => {
        const med = getMedicines().find(x => x.id === id);
        if (med) openMedicineForm(med);
    };
    window.deleteMed = (id) => {
        if (!confirm("Xóa thuốc này?")) return;
        const list = getMedicines().filter(x => x.id !== id);
        saveMedicines(list);
        render();
        showToast("Đã xóa thuốc");
    };
}

/* ---------- Categories ---------- */
const CAT_KEY = "medcare_categories_list";
function getCategoriesList() {
    let l = LS.get(CAT_KEY);
    if (!l) {
        l = CATEGORIES.map((c, i) => ({ id: i + 1, name: c.id, desc: "Nhóm " + c.id }));
        LS.set(CAT_KEY, l);
    }
    return l;
}
function initCategoriesPage() {
    const tbody = document.getElementById("catBody");
    if (!tbody) return;

    function render() {
        const list = getCategoriesList();
        tbody.innerHTML = list.map(c => `
            <tr>
                <td>${c.id}</td>
                <td><b>${escapeHtml(c.name)}</b></td>
                <td>${escapeHtml(c.desc || "")}</td>
                <td>${DEMO_PRODUCTS.filter(p => p.category === c.name).length}</td>
                <td>
                    <div class="actions">
                        <button class="btn small ghost" onclick="editCat(${c.id})">Sửa</button>
                        <button class="btn small danger" onclick="deleteCat(${c.id})">Xóa</button>
                    </div>
                </td>
            </tr>
        `).join("");
    }
    render();

    document.getElementById("btnAddCat").onclick = () => openCatForm();
    window.openCatForm = (c = null) => {
        openModal(`
            <h3>${c ? "Sửa" : "Thêm"} danh mục</h3>
            <div class="form-grid">
                <div class="form-field full"><label>Tên danh mục</label><input id="cName" value="${c ? escapeHtml(c.name) : ""}"></div>
                <div class="form-field full"><label>Mô tả</label><textarea id="cDesc" rows="2">${c ? escapeHtml(c.desc || "") : ""}</textarea></div>
            </div>
        `, [{ label: c ? "Cập nhật" : "Thêm", onclick: `saveCat(${c ? c.id : "null"})` }]);
    };
    window.saveCat = (id) => {
        const name = document.getElementById("cName").value.trim();
        const desc = document.getElementById("cDesc").value.trim();
        if (!name) { showToast("Tên bắt buộc", "error"); return; }
        const list = getCategoriesList();
        if (id) {
            const idx = list.findIndex(x => x.id === id);
            list[idx] = { ...list[idx], name, desc };
        } else {
            list.push({ id: Math.max(0, ...list.map(x => x.id)) + 1, name, desc });
        }
        LS.set(CAT_KEY, list);
        closeModal(); render(); showToast("Đã lưu danh mục");
    };
    window.editCat = (id) => openCatForm(getCategoriesList().find(x => x.id === id));
    window.deleteCat = (id) => {
        if (!confirm("Xóa danh mục này?")) return;
        LS.set(CAT_KEY, getCategoriesList().filter(x => x.id !== id));
        render(); showToast("Đã xóa");
    };
}

/* ---------- Suppliers ---------- */
const SUP_KEY = "medcare_suppliers";
const DEMO_SUPPLIERS = [
    { id: 1, name: "NCC Dược Hậu Giang", phone: "0901111111", email: "dhg@example.com", address: "Cần Thơ", status: "active" },
    { id: 2, name: "NCC Vitamin VN", phone: "0902222222", email: "vit@example.com", address: "TP.HCM", status: "active" },
    { id: 3, name: "NCC Y tế A", phone: "0903333333", email: "yta@example.com", address: "Hà Nội", status: "inactive" }
];
function getSuppliers() {
    let l = LS.get(SUP_KEY);
    if (!l) { l = [...DEMO_SUPPLIERS]; LS.set(SUP_KEY, l); }
    return l;
}
function initSuppliersPage() {
    const tbody = document.getElementById("supBody");
    if (!tbody) return;
    function render() {
        tbody.innerHTML = getSuppliers().map(s => `
            <tr>
                <td>${s.id}</td>
                <td><b>${escapeHtml(s.name)}</b></td>
                <td>${escapeHtml(s.phone)}</td>
                <td>${escapeHtml(s.email)}</td>
                <td>${escapeHtml(s.address || "")}</td>
                <td><span class="badge ${s.status === "active" ? "success" : "muted"}">${s.status === "active" ? "Hoạt động" : "Ngưng"}</span></td>
                <td>
                    <div class="actions">
                        <button class="btn small ghost" onclick="editSup(${s.id})">Sửa</button>
                        <button class="btn small danger" onclick="deleteSup(${s.id})">Xóa</button>
                    </div>
                </td>
            </tr>
        `).join("");
    }
    render();
    document.getElementById("btnAddSup").onclick = () => openSupForm();
    window.openSupForm = (s = null) => {
        openModal(`
            <h3>${s ? "Sửa" : "Thêm"} nhà cung cấp</h3>
            <div class="form-grid">
                <div class="form-field full"><label>Tên</label><input id="sName" value="${s ? escapeHtml(s.name) : ""}"></div>
                <div class="form-field"><label>SĐT</label><input id="sPhone" value="${s ? escapeHtml(s.phone) : ""}"></div>
                <div class="form-field"><label>Email</label><input id="sEmail" value="${s ? escapeHtml(s.email) : ""}"></div>
                <div class="form-field full"><label>Địa chỉ</label><input id="sAddress" value="${s ? escapeHtml(s.address || "") : ""}"></div>
                <div class="form-field full"><label>Trạng thái</label>
                    <select id="sStatus">
                        <option value="active"   ${s && s.status === "active" ? "selected" : ""}>Hoạt động</option>
                        <option value="inactive" ${s && s.status === "inactive" ? "selected" : ""}>Ngưng</option>
                    </select>
                </div>
            </div>
        `, [{ label: s ? "Cập nhật" : "Thêm", onclick: `saveSup(${s ? s.id : "null"})` }]);
    };
    window.saveSup = (id) => {
        const name = document.getElementById("sName").value.trim();
        if (!name) { showToast("Tên NCC bắt buộc", "error"); return; }
        const data = {
            name,
            phone: document.getElementById("sPhone").value.trim(),
            email: document.getElementById("sEmail").value.trim(),
            address: document.getElementById("sAddress").value.trim(),
            status: document.getElementById("sStatus").value
        };
        const list = getSuppliers();
        if (id) { const i = list.findIndex(x => x.id === id); list[i] = { ...list[i], ...data }; }
        else { data.id = Math.max(0, ...list.map(x => x.id)) + 1; list.push(data); }
        LS.set(SUP_KEY, list); closeModal(); render(); showToast("Đã lưu NCC");
    };
    window.editSup = (id) => openSupForm(getSuppliers().find(x => x.id === id));
    window.deleteSup = (id) => {
        if (!confirm("Xóa NCC này?")) return;
        LS.set(SUP_KEY, getSuppliers().filter(x => x.id !== id));
        render(); showToast("Đã xóa");
    };
}

/* ---------- Nhập kho (Tên hàm được đổi thành initNhapKhoPage) ---------- */
let purchaseDraft = [];
function initNhapKhoPage() {
    const tbody = document.getElementById("poBody");
    if (!tbody) return;
    render();
    document.getElementById("btnAddPoLine").onclick = addPoLine;
    document.getElementById("btnSavePo").onclick = savePo;

    function render() {
        tbody.innerHTML = purchaseDraft.length
            ? purchaseDraft.map((l, idx) => `
                <tr>
                    <td>${escapeHtml(l.medName)}</td>
                    <td>${escapeHtml(l.lot)}</td>
                    <td>${formatDate(l.mfgDate)}</td>
                    <td>${formatDate(l.expDate)}</td>
                    <td>${l.quantity}</td>
                    <td>${formatPrice(l.unitPrice)}</td>
                    <td>${formatPrice(l.quantity * l.unitPrice)}</td>
                    <td><button class="btn small danger" onclick="removePoLine(${idx})">Xóa</button></td>
                </tr>
            `).join("")
            : `<tr><td colspan="8" class="empty">Chưa có dòng nào trong phiếu.</td></tr>`;

        const totalQty = purchaseDraft.reduce((s, l) => s + l.quantity, 0);
        const totalAmt = purchaseDraft.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
        document.getElementById("poTotalQty").textContent = totalQty;
        document.getElementById("poTotalAmt").textContent = formatPrice(totalAmt);
    }

    function addPoLine() {
        const medId = +document.getElementById("poMed").value;
        const lot = document.getElementById("poLot").value.trim();
        const mfg = document.getElementById("poMfg").value;
        const exp = document.getElementById("poExp").value;
        const qty = +document.getElementById("poQty").value;
        const price = +document.getElementById("poPrice").value;

        if (!medId || !lot || !mfg || !exp || qty <= 0 || price < 0) {
            showToast("Vui lòng nhập đầy đủ thông tin lô", "error"); return;
        }
        if (new Date(mfg) >= new Date(exp)) {
            showToast("Ngày sản xuất phải trước hạn sử dụng", "error"); return;
        }
        const med = DEMO_PRODUCTS.find(m => m.id === medId);
        purchaseDraft.push({
            medId, medName: med.name, lot,
            mfgDate: mfg, expDate: exp, quantity: qty, unitPrice: price
        });
        ["poLot", "poQty", "poPrice"].forEach(id => document.getElementById(id).value = "");
        render();
    }
    window.removePoLine = (idx) => {
        purchaseDraft.splice(idx, 1); render();
    };

    async function savePo() {
        if (!purchaseDraft.length) { showToast("Phiếu trống", "error"); return; }
        try {
            purchaseDraft.forEach(l => {
                const m = DEMO_PRODUCTS.find(x => x.id === l.medId);
                if (m) m.stock += l.quantity;
            });
            showToast("Đã lưu phiếu nhập kho");
            purchaseDraft = []; render();
        } catch (err) { showToast(err.message, "error"); }
    }
}

/* ---------- Users ---------- */
const USR_KEY = "medcare_users";
const DEMO_USERS = [
    { id: 1, name: "Admin MedCare", phone: "0900000001", email: "admin@medcare.vn", role: "admin", status: "active" },
    { id: 2, name: "DS. Trần Văn B", phone: "0900000002", email: "pharma@medcare.vn", role: "pharmacist", status: "active" },
    { id: 3, name: "Nguyễn Văn A", phone: "0900000003", email: "a@example.com", role: "customer", status: "active" },
    { id: 4, name: "Trần Thị B", phone: "0900000004", email: "b@example.com", role: "customer", status: "locked" }
];
function getUsers() {
    let l = LS.get(USR_KEY);
    if (!l) { l = [...DEMO_USERS]; LS.set(USR_KEY, l); }
    return l;
}
function initUsersPage() {
    const tbody = document.getElementById("userBody");
    if (!tbody) return;
    function render() {
        tbody.innerHTML = getUsers().map(u => `
            <tr>
                <td>${u.id}</td>
                <td><b>${escapeHtml(u.name)}</b></td>
                <td>${escapeHtml(u.phone)}</td>
                <td>${escapeHtml(u.email)}</td>
                <td>
                    <span class="badge ${u.role === "admin" ? "danger" :
                u.role === "pharmacist" ? "warn" : "info"
            }">${u.role}</span>
                </td>
                <td><span class="badge ${u.status === "active" ? "success" : "muted"}">${u.status === "active" ? "Hoạt động" : "Đã khóa"}</span></td>
                <td>
                    <div class="actions">
                        <button class="btn small ghost" onclick="editUser(${u.id})">Sửa</button>
                        <button class="btn small muted" onclick="toggleUser(${u.id})">${u.status === "active" ? "Khóa" : "Mở"}</button>
                    </div>
                </td>
            </tr>
        `).join("");
    }
    render();
    document.getElementById("btnAddUser").onclick = () => openUserForm();

    window.openUserForm = (u = null) => {
        openModal(`
            <h3>${u ? "Sửa" : "Tạo"} tài khoản</h3>
            <div class="form-grid">
                <div class="form-field full"><label>Họ tên</label><input id="uName" value="${u ? escapeHtml(u.name) : ""}"></div>
                <div class="form-field"><label>SĐT</label><input id="uPhone" value="${u ? escapeHtml(u.phone) : ""}"></div>
                <div class="form-field"><label>Email</label><input id="uEmail" value="${u ? escapeHtml(u.email) : ""}"></div>
                <div class="form-field"><label>Vai trò</label>
                    <select id="uRole">
                        <option value="customer"   ${u && u.role === "customer" ? "selected" : ""}>Customer</option>
                        <option value="pharmacist" ${u && u.role === "pharmacist" ? "selected" : ""}>Pharmacist</option>
                        <option value="admin"      ${u && u.role === "admin" ? "selected" : ""}>Admin</option>
                    </select>
                </div>
                <div class="form-field"><label>Trạng thái</label>
                    <select id="uStatus">
                        <option value="active" ${u && u.status === "active" ? "selected" : ""}>Hoạt động</option>
                        <option value="locked" ${u && u.status === "locked" ? "selected" : ""}>Đã khóa</option>
                    </select>
                </div>
            </div>
        `, [{ label: u ? "Cập nhật" : "Tạo", onclick: `saveUser(${u ? u.id : "null"})` }]);
    };
    window.saveUser = (id) => {
        const name = document.getElementById("uName").value.trim();
        if (!name) { showToast("Họ tên bắt buộc", "error"); return; }
        const data = {
            name,
            phone: document.getElementById("uPhone").value.trim(),
            email: document.getElementById("uEmail").value.trim(),
            role: document.getElementById("uRole").value,
            status: document.getElementById("uStatus").value
        };
        const list = getUsers();
        if (id) { const i = list.findIndex(x => x.id === id); list[i] = { ...list[i], ...data }; }
        else { data.id = Math.max(0, ...list.map(x => x.id)) + 1; list.push(data); }
        LS.set(USR_KEY, list); closeModal(); render(); showToast("Đã lưu tài khoản");
    };
    window.editUser = (id) => openUserForm(getUsers().find(x => x.id === id));
    window.toggleUser = (id) => {
        const list = getUsers();
        const u = list.find(x => x.id === id);
        if (!u) return;
        u.status = u.status === "active" ? "locked" : "active";
        LS.set(USR_KEY, list); render(); showToast("Đã cập nhật trạng thái");
    };
}

/* ---------- Reports ---------- */
function initReportsPage() {
    const canvas = document.getElementById("revChart");
    if (!canvas) return;

    const data = [
        { d: "T2", v: 12 }, { d: "T3", v: 18 }, { d: "T4", v: 9 },
        { d: "T5", v: 22 }, { d: "T6", v: 30 }, { d: "T7", v: 25 },
        { d: "CN", v: 15 }
    ];
    const max = Math.max(...data.map(x => x.v));
    const n = data.length;
    canvas.innerHTML = data.map((x, i) => {
        const h = (x.v / max) * 200;
        const left = (i + 0.5) * (100 / n);
        return `<div class="bar" style="height:${h}px;left:calc(${left}% - 13px)">
                    <span>${x.v}tr</span>
                </div>
                <div class="x-label" style="left:calc(${left}% - 10px)">${x.d}</div>`;
    }).join("");

    const best = [
        { name: "Paracetamol 500mg", qty: 320 },
        { name: "Vitamin C 500mg", qty: 245 },
        { name: "Oresol", qty: 210 },
        { name: "Omega 3", qty: 132 },
        { name: "Siro ho trẻ em", qty: 98 }
    ];
    document.getElementById("bestSelling").innerHTML = best.map((b, i) => `
        <li>
            <span><span class="rank">${i + 1}</span>${escapeHtml(b.name)}</span>
            <b>${b.qty}</b>
        </li>
    `).join("");

    document.getElementById("btnFilter").onclick = () => {
        showToast("Đã áp dụng bộ lọc (demo)");
    };
}

/* ---------- Auto-detect Page Routes ---------- */
document.addEventListener("DOMContentLoaded", () => {
    const p = location.pathname.toLowerCase();
    if (p.includes("/admin/index") || p === "/admin" || p === "/admin/") initAdminDashboard();
    if (p.includes("/admin/medicines")) initMedicinesPage();
    if (p.includes("/admin/categories")) initCategoriesPage();
    if (p.includes("/admin/suppliers")) initSuppliersPage();
    if (p.includes("/admin/nhapkho")) initNhapKhoPage(); // Đã khớp tên với NhapKho.cshtml
    if (p.includes("/admin/users")) initUsersPage();
    if (p.includes("/admin/reports")) initReportsPage();
});