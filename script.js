/* script.js — Vadaf Joyeria
   - Admin credentials: VadafJoyeria / DaniVadafj
   - Products stored in localStorage key: "vjd_products"
   - Contacts stored in localStorage key: "vjd_contacts"
   - Hidden admin access:
       PC -> Ctrl + Shift + A
       Mobile -> double-tap (2 quick taps) on logo (id="logo")
*/

// Storage keys
const PRODUCTS_KEY = "vjd_products";
const CONTACTS_KEY = "vjd_contacts";
const ADMIN_FLAG = "vjd_isAdmin";

// Default contacts
const DEFAULT_CONTACTS = {
  phone: "+34 643064075",
  whatsapp: "+34 643064075",
  instagram: "https://www.instagram.com/joyeria_vadaf?igsh=ZjN4ZHdqdmFxdjVp",
  email: "servicioalclientevadaf@gmail.com"
};

// Basic helpers
const qs = (s) => document.querySelector(s);
const qsa = (s) => Array.from(document.querySelectorAll(s));
const safeParse = (k) => JSON.parse(localStorage.getItem(k) || "null");
const saveJSON = (k,v) => localStorage.setItem(k, JSON.stringify(v));

// Ensure contacts default
if (!safeParse(CONTACTS_KEY)) saveJSON(CONTACTS_KEY, DEFAULT_CONTACTS);

// --- DOMContentLoaded init ---
document.addEventListener("DOMContentLoaded", () => {
  // set footer years
  const y = new Date().getFullYear();
  if (qs("#year")) qs("#year").textContent = y;
  if (qs("#year-catalog")) qs("#year-catalog").textContent = y;
  if (qs("#year-admin")) qs("#year-admin").textContent = y;

  // contact panel bind
  initContactPanel();

  // load contacts into UI (public pages and admin inputs)
  loadContactsToUI();

  // hidden admin access (keyboard + double-tap)
  bindHiddenAdminAccess();

  // render catalog on catalog page
  if (qs("#catalogGrid")) renderCatalogPublic();

  // admin page init (login, forms, etc.)
  if (qs("#loginSection") || qs("#adminPanel")) initAdminPage();
});

// ---------------- Contact Panel ----------------
function initContactPanel(){
  const toggle = qs("#contactToggle");
  const panel = qs("#contactPanel");
  const closeBtn = qs("#contactClose");
  if (!toggle || !panel) return;
  toggle.addEventListener("click", () => {
    panel.style.display = panel.style.display === "block" ? "none" : "block";
    panel.setAttribute("aria-hidden", panel.style.display === "none" ? "true" : "false");
  });
  if (closeBtn) closeBtn.addEventListener("click", () => { panel.style.display = "none"; panel.setAttribute("aria-hidden","true"); });
}

// ---------------- Contacts ----------------
function loadContactsToUI(){
  const contacts = safeParse(CONTACTS_KEY) || DEFAULT_CONTACTS;
  // public panel
  const phoneEl = qs("#c-phone");
  const waLink = qs("#c-wa-link");
  const emailEl = qs("#c-email");
  const instaEl = qs("#c-insta");
  if (phoneEl) phoneEl.textContent = contacts.phone || DEFAULT_CONTACTS.phone;
  if (waLink) waLink.href = (contacts.whatsapp && contacts.whatsapp.includes("wa.me")) ? contacts.whatsapp : `https://wa.me/${contacts.whatsapp.replace(/\D/g,"")}`;
  if (waLink) waLink.textContent = contacts.whatsapp || DEFAULT_CONTACTS.whatsapp;
  if (emailEl) { emailEl.href = `mailto:${contacts.email || DEFAULT_CONTACTS.email}`; emailEl.textContent = contacts.email || DEFAULT_CONTACTS.email; }
  if (instaEl) { instaEl.href = contacts.instagram || DEFAULT_CONTACTS.instagram; instaEl.textContent = (contacts.instagram||DEFAULT_CONTACTS.instagram).replace(/^https?:\/\//,""); }

  // admin inputs
  if (qs("#inputPhone")) qs("#inputPhone").value = contacts.phone || DEFAULT_CONTACTS.phone;
  if (qs("#inputWhats")) qs("#inputWhats").value = contacts.whatsapp || DEFAULT_CONTACTS.whatsapp;
  if (qs("#inputInsta")) qs("#inputInsta").value = contacts.instagram || DEFAULT_CONTACTS.instagram;
  if (qs("#inputEmail")) qs("#inputEmail").value = contacts.email || DEFAULT_CONTACTS.email;
}

function saveContactsFromAdmin(){
  const phone = qs("#inputPhone").value.trim();
  const whatsapp = qs("#inputWhats").value.trim();
  const instagram = qs("#inputInsta").value.trim();
  const email = qs("#inputEmail").value.trim();
  const obj = {
    phone: phone || DEFAULT_CONTACTS.phone,
    whatsapp: whatsapp || DEFAULT_CONTACTS.whatsapp,
    instagram: instagram || DEFAULT_CONTACTS.instagram,
    email: email || DEFAULT_CONTACTS.email
  };
  saveJSON(CONTACTS_KEY, obj);
  loadContactsToUI();
  alert("Contactos guardados.");
}

// ---------------- Hidden Admin Access ----------------
function bindHiddenAdminAccess(){
  // keyboard (PC): Ctrl + Shift + A
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
      // open admin page
      window.location.href = "admin.html";
    }
  });

  // mobile: double-tap (2 quick taps) on logo
  const logo = qs("#logo");
  if (!logo) return;
  let lastTap = 0;
  logo.addEventListener("touchend", (ev) => {
    const now = Date.now();
    if (now - lastTap <= 400) {
      // double tap detected
      window.location.href = "admin.html";
    }
    lastTap = now;
  });

  // desktop double click also convenient
  logo.addEventListener("dblclick", () => window.location.href = "admin.html");
}

// ---------------- Products storage helpers ----------------
function getProducts(){
  return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || "[]");
}
function setProducts(arr){
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(arr));
}

// ---------------- Render public catalog ----------------
function renderCatalogPublic(){
  const grid = qs("#catalogGrid");
  if (!grid) return;
  const products = getProducts();
  // ensure most recent first
  products.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
  grid.innerHTML = "";
  if (!products.length) {
    grid.innerHTML = `<div class="card"><p class="muted">No hay publicaciones todavía.</p></div>`;
    return;
  }
  products.forEach(p => {
    const art = document.createElement("article");
    art.className = "card producto-card";
    art.innerHTML = `
      <img src="${p.img}" alt="${escapeHtml(p.name)}">
      <div class="producto-title">${escapeHtml(p.name)}</div>
      <div class="producto-desc">${escapeHtml(p.desc)}</div>
    `;
    grid.appendChild(art);
  });
}

// basic escape for insertion
function escapeHtml(str){
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, (s) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

// ---------------- Admin page logic ----------------
function initAdminPage(){
  // elements
  const loginSection = qs("#loginSection");
  const adminPanel = qs("#adminPanel");
  const btnLogin = qs("#btnLogin");
  const btnLogout = qs("#btnLogout");
  const productForm = qs("#productForm");
  const adminList = qs("#adminList");
  const btnRefresh = qs("#btnRefresh");
  const btnSaveContacts = qs("#btnSaveContacts");
  const btnLoadContacts = qs("#btnLoadContacts");

  // show/hide depending on auth flag
  const isAdmin = localStorage.getItem(ADMIN_FLAG) === "true";
  if (isAdmin) {
    showAdmin();
  } else {
    showLogin();
  }

  // login handler
  if (btnLogin) {
    btnLogin.addEventListener("click", () => {
      const u = qs("#adminUser").value.trim();
      const p = qs("#adminPass").value;
      if (u === "VadafJoyeria" && p === "DaniVadafj") {
        localStorage.setItem(ADMIN_FLAG, "true");
        showAdmin();
      } else {
        alert("Usuario o contraseña incorrectos");
      }
    });
  }

  // logout
  if (btnLogout) btnLogout.addEventListener("click", () => {
    localStorage.removeItem(ADMIN_FLAG);
    showLogin();
  });

  // product submission
  if (productForm) {
    productForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const name = qs("#productName").value.trim();
      const desc = qs("#productDesc").value.trim();
      const fileEl = qs("#productImage");
      const file = fileEl?.files?.[0];
      if (!name || !desc || !file) {
        alert("Completa los campos del producto.");
        return;
      }
      const reader = new FileReader();
      reader.onload = function(e) {
        const arr = getProducts();
        const p = {
          id: Date.now(),
          name,
          desc,
          img: e.target.result,
          createdAt: Date.now()
        };
        arr.unshift(p); // add most recent first
        setProducts(arr);
        productForm.reset();
        renderAdminList();
        alert("Publicación agregada.");
      };
      reader.readAsDataURL(file);
    });
  }

  if (btnRefresh) btnRefresh.addEventListener("click", renderAdminList);

  if (btnSaveContacts) btnSaveContacts.addEventListener("click", saveContactsFromAdmin);
  if (btnLoadContacts) btnLoadContacts.addEventListener("click", () => {
    saveJSON(CONTACTS_KEY, DEFAULT_CONTACTS);
    loadContactsToUI();
    alert("Valores predeterminados cargados.");
  });

  // functions to show/hide
  function showAdmin(){
    if (loginSection) loginSection.style.display = "none";
    if (adminPanel) adminPanel.style.display = "block";
    renderAdminList();
    loadContactsToUI();
  }
  function showLogin(){
    if (loginSection) loginSection.style.display = "block";
    if (adminPanel) adminPanel.style.display = "none";
  }

  // render admin list
  function renderAdminList(){
    const arr = getProducts();
    arr.sort((a,b)=> (b.createdAt||0) - (a.createdAt||0));
    adminList.innerHTML = "";
    if (!arr.length) {
      adminList.innerHTML = `<div class="muted">No hay publicaciones.</div>`;
      return;
    }
    arr.forEach(item => {
      const node = document.createElement("div");
      node.className = "admin-item";
      node.innerHTML = `
        <img src="${item.img}" alt="${escapeHtml(item.name)}">
        <div style="flex:1">
          <div style="font-weight:700;color:var(--accent)">${escapeHtml(item.name)}</div>
          <div style="color:var(--muted);font-size:.95rem">${escapeHtml(item.desc)}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <button class="btn-ghost btn-delete" data-id="${item.id}">Eliminar</button>
        </div>
      `;
      adminList.appendChild(node);
    });

    // bind delete
    qsa(".btn-delete").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.getAttribute("data-id"));
        if (!confirm("¿Eliminar esta publicación?")) return;
        let arr2 = getProducts();
        arr2 = arr2.filter(x => x.id !== id);
        setProducts(arr2);
        renderAdminList();
        alert("Publicación eliminada.");
      });
    });
  }
}

// ---------------- On focus (update) ----------------
window.addEventListener("focus", () => {
  loadContactsToUI();
  if (qs("#catalogGrid")) renderCatalogPublic();
  if (qs("#adminList")) {
    // if admin page and logged, update list
    if (localStorage.getItem(ADMIN_FLAG) === "true") {
      // render admin list if admin page loaded
      // initAdminPage will handle rendering; but call renderAdminList if present
      const ev = new Event('adminRefresh');
      window.dispatchEvent(ev);
      // attempt to render via existing function
      try { renderAdminList(); } catch(e) {/* ignore if not present */}
    }
  }
});
