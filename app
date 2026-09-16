// CloseBuy frontend — talks directly to the live backend at CLOSEBUY_API_BASE
// (see config.js). No build step, no framework: plain fetch + DOM.

const CATEGORY_ICONS = {
  "Grocery": "🛒",
  "Pharmacy": "💊",
  "Convenience": "🏪",
  "Beauty": "💄",
  "Beauty Supply": "💇",
  "Mini Mart": "🏬",
  "Car Wash": "🚗",
  "Fishing/Specialty": "🎣",
  "Specialty/Liquor": "🍷",
};

const state = {
  stores: [],
  products: [],
  activeCategory: "all",
  currentStore: null,
};

const el = (id) => document.getElementById(id);

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

async function api(path, options) {
  const res = await fetch(CLOSEBUY_API_BASE + path, options);
  if (!res.ok) {
    let detail = "";
    try { detail = (await res.json()).error || ""; } catch {}
    throw new Error(`${path} failed (${res.status}) ${detail}`);
  }
  return res.json();
}

// ---------- DATA LOADING ----------

async function loadAll() {
  try {
    const [stores, products] = await Promise.all([
      api("/stores"),
      api("/products"),
    ]);
    state.stores = Array.isArray(stores) ? stores : [];
    state.products = Array.isArray(products) ? products : [];
    renderCategoryRail();
    renderProductRails();
    renderStoreGrid(state.stores);
  } catch (err) {
    console.error(err);
    el("productRails").innerHTML = `<p class="empty-state">Couldn't reach the CloseBuy backend right now (it may be waking up from sleep — try again in about 30 seconds). ${escapeHtml(err.message)}</p>`;
    el("storeGrid").innerHTML = "";
  }
}

// ---------- RENDER: CATEGORY RAIL ----------

function renderCategoryRail() {
  const cats = ["all", ...new Set(state.stores.map((s) => s.category).filter(Boolean))];
  el("catRail").innerHTML = cats.map((c) => `
    <button class="cat-chip ${c === state.activeCategory ? "active" : ""}" data-cat="${escapeHtml(c)}">
      ${c === "all" ? "🔎 All" : `${CATEGORY_ICONS[c] || "🏷️"} ${escapeHtml(c)}`}
    </button>
  `).join("");

  el("catRail").querySelectorAll(".cat-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.activeCategory = btn.dataset.cat;
      renderCategoryRail();
      const filtered = state.activeCategory === "all"
        ? state.stores
        : state.stores.filter((s) => s.category === state.activeCategory);
      renderStoreGrid(filtered);
      showBrowseView();
      el("mainView").scrollIntoView({ behavior: "smooth" });
    });
  });
}

// ---------- RENDER: PRODUCT RAILS ----------

function renderProductRails() {
  const byCategory = {};
  for (const p of state.products) {
    (byCategory[p.category] ||= []).push(p);
  }
  const order = Object.keys(CATEGORY_ICONS).filter((c) => byCategory[c]);
  el("productRails").innerHTML = order.map((cat) => `
    <div class="rail-block">
      <div class="rail-title">${CATEGORY_ICONS[cat] || "🏷️"} ${escapeHtml(cat)}</div>
      <div class="product-row">
        ${byCategory[cat].slice(0, 14).map(productCardHtml).join("")}
      </div>
    </div>
  `).join("");

  el("productRails").querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", () => runSearch(card.dataset.name));
  });
}

function productCardHtml(p) {
  return `
    <button class="product-card" data-name="${escapeHtml(p.name)}">
      <span class="product-emoji">${CATEGORY_ICONS[p.category] || "🏷️"}</span>
      <div class="product-name">${escapeHtml(p.name)}</div>
      <div class="product-cat">${escapeHtml(p.category)}</div>
    </button>
  `;
}

// ---------- RENDER: STORE GRID ----------

function renderStoreGrid(stores) {
  el("storeCount").textContent = `${stores.length} independent store${stores.length === 1 ? "" : "s"} on the corridor`;
  if (!stores.length) {
    el("storeGrid").innerHTML = `<p class="empty-state">No stores in this category yet.</p>`;
    return;
  }
  el("storeGrid").innerHTML = stores.map(storeCardHtml).join("");
  el("storeGrid").querySelectorAll(".store-card").forEach((card) => {
    card.addEventListener("click", () => openStoreDetail(card.dataset.id));
  });
}

function storeCardHtml(s) {
  return `
    <button class="store-card" data-id="${escapeHtml(s.id)}">
      <div class="store-main">
        <div class="store-name">${escapeHtml(s.name)}</div>
        <div class="store-meta">${escapeHtml(s.category)} · ${escapeHtml(s.city)}</div>
        <div class="tag-row"><span class="tag">${escapeHtml(s.language || "—")}</span></div>
      </div>
      <div class="store-side">
        <svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
      </div>
    </button>
  `;
}

// ---------- SEARCH ----------

let searchDebounce;
el("searchInput").addEventListener("input", (e) => {
  clearTimeout(searchDebounce);
  const q = e.target.value.trim();
  if (!q) return;
  searchDebounce = setTimeout(() => runSearch(q), 350);
});
el("searchInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") { clearTimeout(searchDebounce); runSearch(e.target.value.trim()); }
});

async function runSearch(query) {
  if (!query) return;
  el("searchInput").value = query;
  el("searchQueryLabel").textContent = query;
  showView("searchView");

  el("searchProducts").innerHTML = `<p class="empty-state">Searching…</p>`;
  el("searchStoreGrid").innerHTML = "";

  try {
    const products = await api(`/products?q=${encodeURIComponent(query)}`);
    if (!products.length) {
      el("searchProducts").innerHTML = `<p class="empty-state">No catalog matches for "${escapeHtml(query)}" yet — try a broader term.</p>`;
      el("searchStoreGrid").innerHTML = "";
      return;
    }
    el("searchProducts").innerHTML = products.map(productCardHtml).join("");
    el("searchProducts").querySelectorAll(".product-card").forEach((card) => {
      card.addEventListener("click", () => runSearch(card.dataset.name));
    });

    const matchedCats = new Set(products.map((p) => p.category));
    const matchingStores = state.stores.filter((s) => matchedCats.has(s.category));
    el("searchStoreGrid").innerHTML = matchingStores.length
      ? matchingStores.map(storeCardHtml).join("")
      : `<p class="empty-state">No active stores carry this category yet.</p>`;
    el("searchStoreGrid").querySelectorAll(".store-card").forEach((card) => {
      card.addEventListener("click", () => openStoreDetail(card.dataset.id, query));
    });
  } catch (err) {
    el("searchProducts").innerHTML = `<p class="empty-state">Search failed: ${escapeHtml(err.message)}</p>`;
  }
}

el("backFromSearch").addEventListener("click", showBrowseView);

// ---------- STORE DETAIL + REQUEST ----------

function openStoreDetail(storeId, prefillProduct) {
  const store = state.stores.find((s) => String(s.id) === String(storeId));
  if (!store) return;
  state.currentStore = store;

  el("detailName").textContent = store.name;
  el("detailMeta").textContent = `${store.category} · ${store.city}`;
  el("detailAddress").textContent = store.address || "Address on file soon";
  el("detailCategory").textContent = store.category || "—";
  el("detailLanguage").textContent = store.language || "—";
  el("detailProductInput").value = prefillProduct || "";
  el("requestStatus").textContent = "";
  el("sendRequestBtn").disabled = false;
  el("sendRequestBtn").textContent = "Ask this store";

  showView("detailView");
}

el("backFromDetail").addEventListener("click", showBrowseView);

function sessionId() {
  let id = localStorage.getItem("closebuy_session");
  if (!id) {
    id = "web-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("closebuy_session", id);
  }
  return id;
}

el("sendRequestBtn").addEventListener("click", async () => {
  const store = state.currentStore;
  const product = el("detailProductInput").value.trim();
  if (!store || !product) {
    el("requestStatus").textContent = "Tell us what you're looking for first.";
    return;
  }
  el("sendRequestBtn").disabled = true;
  el("sendRequestBtn").textContent = "Sending…";
  el("requestStatus").textContent = "";

  try {
    const requestId = "req-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const result = await api("/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestId,
        productName: product,
        storeId: store.id,
        storeName: store.name,
        storePhone: store.phone || null,
        customerSession: sessionId(),
      }),
    });
    el("requestStatus").textContent = store.phone
      ? `Sent — ${store.name} will text back shortly.`
      : `Logged. We don't have a phone number on file for ${store.name} yet, so this won't send an SMS, but it's recorded for outreach follow-up.`;
    el("sendRequestBtn").textContent = "Request sent";
  } catch (err) {
    el("requestStatus").textContent = `Couldn't send that: ${err.message}`;
    el("sendRequestBtn").disabled = false;
    el("sendRequestBtn").textContent = "Ask this store";
  }
});

// ---------- VIEW SWITCHING ----------

function showView(id) {
  ["browseView", "searchView", "detailView"].forEach((v) => {
    el(v).hidden = v !== id;
  });
}
function showBrowseView() {
  showView("browseView");
  el("searchInput").value = "";
}

el("logoBtn").addEventListener("click", () => {
  showBrowseView();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ---------- CHAT WIDGET ----------

const chatToggle = el("chatToggle");
const chatPanel = el("chatPanel");
const chatMessages = el("chatMessages");
const chatForm = el("chatForm");
const chatInput = el("chatInput");
let chatOpened = false;

chatToggle.addEventListener("click", () => {
  chatPanel.hidden = !chatPanel.hidden;
  if (!chatPanel.hidden && !chatOpened) {
    chatOpened = true;
    addChatMessage("assistant", "Hi! Tell me what you're looking for and I'll point you to a nearby store.");
  }
});
el("chatClose").addEventListener("click", () => { chatPanel.hidden = true; });

function addChatMessage(role, text) {
  const div = document.createElement("div");
  div.className = `chat-msg ${role}`;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = chatInput.value.trim();
  if (!msg) return;
  chatInput.value = "";
  addChatMessage("user", msg);
  const thinking = document.createElement("div");
  thinking.className = "chat-msg system";
  thinking.textContent = "…";
  chatMessages.appendChild(thinking);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const { reply } = await api("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sessionId(), message: msg }),
    });
    thinking.remove();
    addChatMessage("assistant", reply);
  } catch (err) {
    thinking.remove();
    addChatMessage("system", `Couldn't reach the assistant (${err.message}). The backend may be waking up — try again shortly.`);
  }
});

// ---------- INIT ----------

loadAll();
