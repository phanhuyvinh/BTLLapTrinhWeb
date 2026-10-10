/* ============================================================
   auth.js — Đăng nhập / Đăng ký (Đã cập nhật chuẩn ASP.NET Core MVC)
   ============================================================ */

const AUTH_KEY = "medcare_user";
const TOKEN_KEY = "medcare_token";

function saveAuth(user, token = "demo-token") {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
}

function getCurrentUser() {
    return LS.get(AUTH_KEY);
}

function logout() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(TOKEN_KEY);
}

/* ---------------- Đăng xuất ---------------- */
function handleLogout(e) {
    if (e) e.preventDefault();
    if (!confirm("Bạn có chắc muốn đăng xuất?")) return;
    logout();
    showToast("Đã đăng xuất");
    setTimeout(() => {
        location.href = "/Home/Index";
    }, 500);
}

/* ----- Trả về Route Bảng điều khiển tương ứng với Role ----- */
function dashboardHrefFor(role) {
    if (role === "admin") return "/Admin/Index";
    if (role === "pharmacist") return "/Pharmacist/Index";
    return "/Customer/Products";
}

function syncFooterStaffLinks(user) {
    const staff = document.getElementById("footerStaffLinks");
    if (!staff) return;
    staff.style.display = (user && user.role === "customer") ? "none" : "";
}

/* ----- Render vùng tài khoản ở header ----- */
function renderAuthArea() {
    const el = document.getElementById("authArea");
    if (!el) return;

    const u = getCurrentUser();
    syncFooterStaffLinks(u);

    if (!u) {
        el.innerHTML = `<a href="/Customer/Login" class="link-btn">👤 Đăng nhập</a>`;
        return;
    }

    el.innerHTML = `
        <div class="user-menu">
            <button type="button" class="link-btn user-btn user-chip" onclick="toggleUserMenu(event)">
                👤 ${escapeHtml(u.name || u.email)}
                <span class="caret">▾</span>
            </button>
            <div class="user-dropdown" id="userDropdown">
                <div class="ud-head">
                    <div class="ud-name">${escapeHtml(u.name || "Người dùng")}</div>
                    <div class="ud-email">${escapeHtml(u.email || "")}</div>
                    <span class="badge ${u.role === "admin" ? "danger" :
            u.role === "pharmacist" ? "warn" : "info"
        }" style="margin-top:6px;display:inline-block">${escapeHtml(u.role || "customer")}</span>
                </div>
                ${u.role === "admin" ? `<a href="/Admin/Index">Bảng điều khiển</a>` : ""}
                <a href="/Customer/Orders">Đơn hàng của tôi</a>
                <a href="/Account/Profile">Tài khoản của tôi</a>
                <a href="#" onclick="handleLogout(event)" class="danger">Đăng xuất</a>
            </div>
        </div>
    `;
}

/* ----- Bật/tắt dropdown ----- */
function toggleUserMenu(e) {
    if (e) e.stopPropagation();
    const d = document.getElementById("userDropdown");
    if (d) d.classList.toggle("show");
}

document.addEventListener("click", () => {
    const d = document.getElementById("userDropdown");
    if (d) d.classList.remove("show");
});

document.addEventListener("DOMContentLoaded", renderAuthArea);

function requireLogin(redirect = "/Customer/Login") {
    if (!getCurrentUser()) {
        location.href = redirect + "?next=" + encodeURIComponent(location.pathname);
        return false;
    }
    return true;
}

/* ----------------- Bảo vệ trang theo vai trò ----------------- */
function requireRole(role) {
    const user = getCurrentUser();

    if (!user) {
        const back = encodeURIComponent(location.pathname);
        location.href = `/Customer/Login?role=${role}&next=${back}`;
        return false;
    }

    const allowed = user.role === role || user.role === "admin";
    if (!allowed) {
        showToast("Bạn không có quyền truy cập khu vực này", "error");
        setTimeout(() => location.href = "/Home/Index", 900);
        return false;
    }

    return true;
}

function requireRoleAny(roles = []) {
    const user = getCurrentUser();
    if (!user) {
        location.href = `/Customer/Login?role=${roles[0] || "customer"}`;
        return false;
    }
    if (!roles.includes(user.role) && user.role !== "admin") {
        showToast("Bạn không có quyền truy cập khu vực này", "error");
        setTimeout(() => location.href = "/Home/Index", 900);
        return false;
    }
    return true;
}

/* ----------------- Đăng nhập (phân quyền theo ?role=) ----------------- */
async function handleLoginSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value;

    const requiredRole = (getQuery("role") || "customer").toLowerCase();

    if (!email || !password) {
        showToast("Vui lòng nhập đầy đủ thông tin", "error");
        return;
    }

    try {
        let actualRole = "customer";
        if (email.startsWith("admin")) actualRole = "admin";
        else if (email.startsWith("pharma")) actualRole = "pharmacist";

        const isAllowed =
            requiredRole === "customer" ||
            actualRole === requiredRole ||
            actualRole === "admin";

        if (!isAllowed) {
            showToast(
                requiredRole === "admin"
                    ? "Tài khoản này không có quyền Quản trị"
                    : "Tài khoản này không phải Dược sĩ",
                "error"
            );
            setTimeout(() => location.href = "/Customer/Products", 900);
            return;
        }

        saveAuth({ name: email.split("@")[0] || "Người dùng", email, role: actualRole });

        if (actualRole === "admin") {
            showToast("Đăng nhập Quản trị thành công");
            setTimeout(() => location.href = "/Admin/Index", 600);
        } else if (actualRole === "pharmacist") {
            showToast("Đăng nhập Dược sĩ thành công");
            setTimeout(() => location.href = "/Pharmacist/Index", 600);
        } else {
            showToast("Đăng nhập thành công");
            const next = getQuery("next");
            setTimeout(() => location.href = next || "/Customer/Products", 600);
        }
    } catch (err) {
        showToast(err.message || "Đăng nhập thất bại", "error");
    }
}

/* ----------------- Đăng ký ----------------- */
async function handleRegisterSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const email = form.email.value.trim();
    const pass = form.password.value;
    const pass2 = form.passwordConfirm.value;

    if (!name || !phone || !pass) { showToast("Nhập đủ họ tên, SĐT, mật khẩu", "error"); return; }
    if (!/^[0-9+\-\s()]{8,15}$/.test(phone)) { showToast("Số điện thoại không hợp lệ", "error"); return; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast("Email không hợp lệ", "error"); return; }
    if (pass.length < 6) { showToast("Mật khẩu tối thiểu 6 ký tự", "error"); return; }
    if (pass !== pass2) { showToast("Mật khẩu xác nhận không khớp", "error"); return; }

    try {
        showToast("Đăng ký thành công, hãy đăng nhập");
        setTimeout(() => location.href = "/Customer/Login", 700);
    } catch (err) {
        showToast(err.message || "Đăng ký thất bại", "error");
    }
}