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
  "Pet": "🐾",
};

// ---------- STORE DETAIL CATALOG (illustrative browsing only) ----------
// These are generic departments/items typical of each store category —
// NOT this specific store's real inventory. CloseBuy has no per-store
// stock data by design (Phase 1 is manual availability requests, not an
// inventory feed), so nothing here is presented as confirmed in-stock —
// see the disclaimer rendered above the catalog and the lack of prices.
const DEPT_EMOJI = {
  "Produce": "🥬", "Meat & Seafood": "🍗", "Dairy & Eggs": "🥛", "Pantry": "🥫",
  "Frozen": "🧊", "Beverages": "🥤", "Medicine": "💊", "Personal Care": "🧴",
  "Vitamins": "💊", "Baby Care": "🍼", "Snacks": "🍪", "Drinks": "🥤",
  "Groceries": "🛒", "Tobacco & Vape": "🚬", "Everyday Essentials": "🔌",
  "Hair Care": "💇", "Skin Care": "🧴", "Nails": "💅", "Tools": "🛠️",
  "Hair Extensions": "💁", "Hair Products": "🧴", "Cosmetics": "💄",
  "Wash Packages": "🚿", "Interior": "🧹", "Add-ons": "✨", "Tackle": "🎣",
  "Bait": "🪱", "Gear": "🎒", "Beer": "🍺", "Wine": "🍷", "Spirits": "🥃",
  "Mixers & Ice": "🧊", "Food": "🐶", "Supplies": "🧸", "Health & Grooming": "🩺",
};
const DEPARTMENTS = {
  "Grocery": [
    { name: "Produce", items: ["Bananas", "Roma Tomatoes", "Onions", "Avocados", "Leafy Greens", "Jalapeños"] },
    { name: "Meat & Seafood", items: ["Chicken Thighs", "Ground Beef", "Tilapia", "Shrimp", "Chorizo"] },
    { name: "Dairy & Eggs", items: ["Whole Milk", "Eggs", "Queso Fresco", "Butter", "Crema"] },
    { name: "Pantry", items: ["Rice", "Beans", "Cooking Oil", "Masa Harina", "Spices"] },
    { name: "Frozen", items: ["Frozen Vegetables", "Ice Cream", "Frozen Tamales", "Frozen Pupusas"] },
    { name: "Beverages", items: ["Soda", "Juice", "Bottled Water", "Coffee", "Horchata"] },
  ],
  "Pharmacy": [
    { name: "Medicine", items: ["Cough Syrup", "Pain Relievers", "Allergy Meds", "Cold Medicine", "Antacids"] },
    { name: "Personal Care", items: ["Toothpaste", "Deodorant", "Shampoo", "Bar Soap", "Razors"] },
    { name: "Vitamins", items: ["Multivitamins", "Vitamin C", "Fish Oil", "Probiotics"] },
    { name: "Baby Care", items: ["Diapers", "Baby Wipes", "Baby Formula", "Baby Lotion"] },
  ],
  "Convenience": [
    { name: "Snacks", items: ["Chips", "Candy", "Nuts", "Cookies"] },
    { name: "Drinks", items: ["Soda", "Energy Drinks", "Bottled Water", "Sports Drinks"] },
    { name: "Tobacco & Vape", items: ["Cigarettes", "Vape Pens", "Lighters", "Rolling Papers"] },
    { name: "Everyday Essentials", items: ["Phone Chargers", "Batteries", "Lottery Tickets", "Ice"] },
  ],
  "Mini Mart": [
    { name: "Snacks", items: ["Chips", "Candy", "Nuts", "Cookies"] },
    { name: "Groceries", items: ["Rice", "Cooking Oil", "Canned Goods", "Bread"] },
    { name: "Drinks", items: ["Soda", "Bottled Water", "Juice", "Beer"] },
    { name: "Everyday Essentials", items: ["Phone Chargers", "Batteries", "Lottery Tickets"] },
  ],
  "Beauty": [
    { name: "Hair Care", items: ["Shampoo", "Conditioner", "Hair Oil", "Edge Control"] },
    { name: "Skin Care", items: ["Face Cream", "Facial Serum", "Face Masks", "Sunscreen"] },
    { name: "Nails", items: ["Nail Polish", "Acrylic Kits", "Nail Files"] },
    { name: "Tools", items: ["Blow Dryers", "Flat Irons", "Hair Brushes"] },
  ],
  "Beauty Supply": [
    { name: "Hair Extensions", items: ["Wigs", "Weaves", "Braiding Hair", "Bundles"] },
    { name: "Hair Products", items: ["Relaxers", "Edge Control", "Hair Oils", "Styling Gel"] },
    { name: "Tools", items: ["Clippers", "Combs", "Blow Dryers"] },
    { name: "Cosmetics", items: ["Foundation", "Lip Gloss", "Eyelashes"] },
  ],
  "Car Wash": [
    { name: "Wash Packages", items: ["Exterior Wash", "Full Detail", "Wax & Shine", "Undercarriage Wash"] },
    { name: "Interior", items: ["Vacuum", "Interior Detail", "Leather Conditioning"] },
    { name: "Add-ons", items: ["Air Freshener", "Tire Shine", "Headlight Restoration"] },
  ],
  "Fishing/Specialty": [
    { name: "Tackle", items: ["Fishing Rods", "Reels", "Lures", "Hooks", "Fishing Line"] },
    { name: "Bait", items: ["Live Bait", "Bait Cooler"] },
    { name: "Gear", items: ["Tackle Boxes", "Nets", "Waders", "Coolers"] },
  ],
  "Specialty/Liquor": [
    { name: "Beer", items: ["Domestic Beer", "Craft Beer", "Imported Beer"] },
    { name: "Wine", items: ["Red Wine", "White Wine", "Champagne"] },
    { name: "Spirits", items: ["Whiskey", "Vodka", "Tequila", "Rum"] },
    { name: "Mixers & Ice", items: ["Soda Mixers", "Ice", "Garnishes"] },
  ],
  "Pet": [
    { name: "Food", items: ["Dog Food", "Cat Food", "Treats", "Pet Chews"] },
    { name: "Supplies", items: ["Leashes", "Collars", "Toys", "Litter"] },
    { name: "Health & Grooming", items: ["Flea & Tick", "Pet Vitamins", "Shampoo", "Brushes"] },
  ],
};
const DEFAULT_DEPARTMENTS = [
  { name: "Everyday Essentials", items: ["Snacks", "Drinks", "Household Basics", "Personal Care"] },
];

const state = {
  stores: [],
  products: [],
  activeCategory: "all",
  currentStore: null,
  userLoc: null, // { lat, lng } once/if the browser grants geolocation
};

const el = (id) => document.getElementById(id);

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// Real distance, not a guess: haversine great-circle distance in miles.
function milesBetween(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distanceLabel(store) {
  if (!state.userLoc || store.lat == null || store.lng == null) return null;
  const mi = milesBetween(state.userLoc.lat, state.userLoc.lng, store.lat, store.lng);
  return mi < 0.1 ? "< 0.1 mi" : `${mi.toFixed(1)} mi`;
}

function sortByDistance(stores) {
  if (!state.userLoc) return stores;
  return [...stores].sort((a, b) => {
    const da = a.lat != null ? milesBetween(state.userLoc.lat, state.userLoc.lng, a.lat, a.lng) : Infinity;
    const db = b.lat != null ? milesBetween(state.userLoc.lat, state.userLoc.lng, b.lat, b.lng) : Infinity;
    return da - db;
  });
}

function currentCategoryStores() {
  return state.activeCategory === "all"
    ? state.stores
    : state.stores.filter((s) => s.category === state.activeCategory);
}

function requestUserLocation(manual) {
  if (!("geolocation" in navigator)) {
    if (manual) el("locPillText").textContent = "Location not supported";
    return;
  }
  if (manual) el("locPillText").textContent = "Locating…";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      state.userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      el("locPillText").textContent = "Near your location";
      renderStoreGrid(currentCategoryStores());
      if (manual) {
        showBrowseView();
        el("storeGrid").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    () => {
      // Denied or unavailable — corridor-level framing stays, no fake numbers.
      if (manual) el("locPillText").textContent = "Enable location in your browser";
    },
    { timeout: 8000, maximumAge: manual ? 0 : 300000 }
  );
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

// Skeleton placeholders so the first paint never looks broken/blank while
// the free-tier backend wakes up (cold start can take 20-40s).
function skeletonRailHtml() {
  return `
    <div class="rail-block">
      <div class="skeleton-text" style="width:110px;height:15px;margin:28px 0 12px;"></div>
      <div class="product-row">
        ${Array(6).fill(`
          <div class="product-card skeleton-card">
            <div class="skeleton-box" style="width:26px;height:26px;margin-bottom:10px;"></div>
            <div class="skeleton-text" style="width:85%;"></div>
            <div class="skeleton-text" style="width:50%;margin-top:6px;height:8px;"></div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}
function skeletonStoreGridHtml() {
  return Array(6).fill(`
    <div class="store-card skeleton-card">
      <div class="store-main" style="width:100%;">
        <div class="skeleton-text" style="width:65%;height:13px;"></div>
        <div class="skeleton-text" style="width:40%;margin-top:9px;height:10px;"></div>
      </div>
    </div>
  `).join("");
}

async function loadAll(attempt) {
  attempt = attempt || 1;
  if (attempt === 1) {
    el("productRails").innerHTML = skeletonRailHtml().repeat(3);
    el("storeGrid").innerHTML = skeletonStoreGridHtml();
    el("storeCount").textContent = "Loading stores…";
  }
  try {
    const [stores, products] = await Promise.all([
      api("/stores"),
      api("/products"),
    ]);
    state.stores = Array.isArray(stores) ? stores : [];
    state.products = Array.isArray(products) ? products : [];
    renderCategoryRail();
    renderProductRails();
    renderStoreGrid(currentCategoryStores());
  } catch (err) {
    console.error(err);
    // The backend is on a free tier that sleeps — a failed first attempt
    // usually just means it's waking up, so retry quietly before showing
    // an error the person has to act on themselves.
    if (attempt <= 3) {
      el("storeCount").textContent = "Waking up the store list… this can take up to a minute on the first visit.";
      setTimeout(() => loadAll(attempt + 1), 6000);
      return;
    }
    el("productRails").innerHTML = `<p class="empty-state">Couldn't reach the CloseBuy backend right now. ${escapeHtml(err.message)} — <button class="back-link" style="display:inline;padding:0;margin:0;" onclick="loadAll()">Try again</button></p>`;
    el("storeGrid").innerHTML = "";
    el("storeCount").textContent = "";
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
      renderProductRails();
      renderStoreGrid(currentCategoryStores());
      el("storesHeading").textContent = state.activeCategory === "all" ? "All stores" : `${state.activeCategory} stores`;
      showBrowseView();
      el("mainView").scrollIntoView({ behavior: "smooth" });
    });
  });
}

// ---------- RENDER: PRODUCT RAILS ----------

// Selecting a category clears every other category's rail — only the
// products for that one category show, so the page reads as a filtered
// view rather than the full catalog with one section highlighted.
function renderProductRails() {
  const byCategory = {};
  for (const p of state.products) {
    if (state.activeCategory !== "all" && p.category !== state.activeCategory) continue;
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
  const sorted = sortByDistance(stores);
  el("storeCount").textContent = `${stores.length} independent store${stores.length === 1 ? "" : "s"}${state.userLoc ? ", nearest first" : " on the corridor"}`;
  if (!sorted.length) {
    el("storeGrid").innerHTML = `<p class="empty-state">No stores in this category yet.</p>`;
    return;
  }
  el("storeGrid").innerHTML = sorted.map(storeCardHtml).join("");
  el("storeGrid").querySelectorAll(".store-card").forEach((card) => {
    card.addEventListener("click", () => openStoreDetail(card.dataset.id));
  });
}

function storeCardHtml(s) {
  const dist = distanceLabel(s);
  return `
    <button class="store-card" data-id="${escapeHtml(s.id)}">
      <div class="store-main">
        <div class="store-name">${escapeHtml(s.name)}</div>
        <div class="store-meta">${escapeHtml(s.category)} · ${escapeHtml(s.city)}</div>
        <div class="tag-row">
          <span class="tag">${escapeHtml(s.language || "—")}</span>
          ${dist ? `<span class="tag">${dist}</span>` : ""}
        </div>
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
    const matchingStores = sortByDistance(state.stores.filter((s) => matchedCats.has(s.category)));
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

  const dist = distanceLabel(store);
  el("detailIcon").textContent = CATEGORY_ICONS[store.category] || "🏷️";
  el("detailName").textContent = store.name;
  el("detailMeta").textContent = `${store.city}${dist ? " · " + dist : ""}`;
  el("detailTags").innerHTML = `
    <span class="tag">${escapeHtml(store.category || "—")}</span>
    <span class="tag">${escapeHtml(store.language || "—")}</span>
    ${dist ? `<span class="tag">${dist}</span>` : ""}
  `;
  el("detailAddress").textContent = store.address || "Address on file soon";
  el("detailCategory").textContent = store.category || "—";
  el("detailLanguage").textContent = store.language || "—";
  el("detailProductInput").value = prefillProduct || "";
  el("requestStatus").textContent = "";
  el("sendRequestBtn").disabled = false;
  el("sendRequestBtn").textContent = "Ask this store";

  renderStoreCatalog(store);

  showView("detailView");
  window.scrollTo({ top: 0, behavior: "auto" });
}

// Renders the illustrative department rail + item rows for a store's
// category. See the DEPARTMENTS comment above — this is generic browsing
// content, not the store's actual stock.
function renderStoreCatalog(store) {
  const depts = DEPARTMENTS[store.category] || DEFAULT_DEPARTMENTS;
  const fallbackEmoji = CATEGORY_ICONS[store.category] || "🏷️";

  el("deptRail").innerHTML = depts.map((d, i) => `
    <button class="dept-chip ${i === 0 ? "active" : ""}" data-target="dept-${i}">
      ${DEPT_EMOJI[d.name] || fallbackEmoji} ${escapeHtml(d.name)}
    </button>
  `).join("");

  el("deptRails").innerHTML = depts.map((d, i) => `
    <div class="dept-block" id="dept-${i}">
      <div class="dept-title">${DEPT_EMOJI[d.name] || fallbackEmoji} ${escapeHtml(d.name)}</div>
      <div class="item-row">
        ${d.items.map((name) => itemCardHtml(name, DEPT_EMOJI[d.name] || fallbackEmoji)).join("")}
      </div>
    </div>
  `).join("");

  el("deptRail").querySelectorAll(".dept-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      el("deptRail").querySelectorAll(".dept-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      el(chip.dataset.target).scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  el("deptRails").querySelectorAll(".item-card").forEach((card) => {
    card.addEventListener("click", () => askAboutItem(card.dataset.name));
  });
}

function itemCardHtml(name, emoji) {
  return `
    <div class="item-card" data-name="${escapeHtml(name)}">
      <span class="item-emoji">${emoji}</span>
      <div class="item-name">${escapeHtml(name)}</div>
      <button class="item-ask-btn" type="button" tabindex="-1" aria-label="Ask if ${escapeHtml(name)} is available">+</button>
    </div>
  `;
}

// Clicking an illustrative item never "adds" anything — it just prefills
// the real request box below, which is CloseBuy's actual mechanism.
function askAboutItem(name) {
  el("detailProductInput").value = name;
  el("detailProductInput").closest(".request-box").scrollIntoView({ behavior: "smooth", block: "center" });
  el("detailProductInput").focus();
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

// Clicking the location pill (re-)asks for real location and jumps straight
// to every CloseBuy store sorted nearest-first, across all categories.
el("locPillBtn").addEventListener("click", () => {
  state.activeCategory = "all";
  renderCategoryRail();
  renderProductRails();
  el("storesHeading").textContent = "All stores";
  requestUserLocation(true);
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
requestUserLocation();
