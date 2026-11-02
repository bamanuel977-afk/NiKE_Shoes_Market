const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const money = (n) => `$${Number(n).toFixed(2)}`;
const state = {
  cart: JSON.parse(localStorage.getItem("sole_cart") || "[]"),
  wishlist: JSON.parse(localStorage.getItem("sole_wishlist") || "[]"),
  selectedSize: 9,
  visible: 9,
  category: "",
  search: "",
  size: null,
  maxPrice: 250,
  inStock: false,
  sort: "featured",
};
const save = () => {
  localStorage.setItem("sole_cart", JSON.stringify(state.cart));
  localStorage.setItem("sole_wishlist", JSON.stringify(state.wishlist));
  updateCounts();
};
const toast = (msg) => {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2300);
};
const imageFallback =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80";

function updateCounts() {
  $("#cartCount").textContent = state.cart.reduce((n, x) => n + x.qty, 0);
  $("#wishCount").textContent = state.wishlist.length;
  $("#drawerCount").textContent =
    `(${state.cart.reduce((n, x) => n + x.qty, 0)})`;
}
function productCard(p) {
  const wished = state.wishlist.includes(p.id);
  return `<article class="product-card"><div class="product-image" data-detail="${p.id}"><img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='${imageFallback}'">${p.tag ? `<span class="product-tag">${p.tag}</span>` : ""}<button class="wish-button ${wished ? "active" : ""}" data-wish="${p.id}" aria-label="Add ${p.name} to wishlist">${wished ? "♥" : "♡"}</button><button class="quick-add" data-quick="${p.id}">QUICK ADD ＋</button></div><div class="product-info"><div class="product-brand">${p.brand} · ${p.gender}</div><h3>${p.name}</h3><div class="product-meta"><span class="product-price">${money(p.price)}</span><span class="rating">★ ${p.rating.toFixed(1)}</span></div></div></article>`;
}
function filteredProducts() {
  let list = PRODUCTS.filter((p) => {
    const hay =
      `${p.name} ${p.brand} ${p.gender} ${p.category} ${p.color}`.toLowerCase();
    const cats = $$('input[name="category"]:checked').map((x) => x.value);
    const brands = $$('input[name="brand"]:checked').map((x) => x.value);
    return (
      (!state.search || hay.includes(state.search.toLowerCase())) &&
      (!state.category ||
        p.gender === state.category ||
        p.category === state.category) &&
      (!cats.length || cats.includes(p.gender) || cats.includes(p.category)) &&
      (!brands.length || brands.includes(p.brand)) &&
      p.price <= state.maxPrice &&
      (!state.size || p.sizes.includes(Number(state.size))) &&
      (!state.inStock || p.stock > 0)
    );
  });
  if (state.sort === "price-low") list.sort((a, b) => a.price - b.price);
  if (state.sort === "price-high") list.sort((a, b) => b.price - a.price);
  if (state.sort === "rating") list.sort((a, b) => b.rating - a.rating);
  if (state.sort === "newest") list.sort((a, b) => a.newest - b.newest);
  return list;
}
function renderProducts() {
  const all = filteredProducts(),
    shown = all.slice(0, state.visible);
  $("#productGrid").innerHTML = shown.map(productCard).join("");
  $("#resultCount").textContent =
    `Showing ${shown.length} of ${all.length} products`;
  $("#emptyState").classList.toggle("hidden", all.length !== 0);
  $("#productGrid").classList.toggle("hidden", all.length === 0);
  $("#loadMore").classList.toggle("hidden", shown.length >= all.length);
  $("#filterCount").textContent = activeFilterCount()
    ? `(${activeFilterCount()})`
    : "";
}
function activeFilterCount() {
  return (
    $$('input[name="category"]:checked').length +
    $$('input[name="brand"]:checked').length +
    (state.size ? 1 : 0) +
    (state.maxPrice < 250 ? 1 : 0) +
    (state.inStock ? 1 : 0)
  );
}
function setupFilters() {
  const brands = [...new Set(PRODUCTS.map((p) => p.brand))].sort();
  $("#brandFilters").innerHTML = brands
    .map(
      (b) =>
        `<label><input type="checkbox" name="brand" value="${b}"> ${b}</label>`,
    )
    .join("");
  $("#sizeFilters").innerHTML = [6, 7, 8, 9, 10, 11, 12]
    .map((s) => `<button class="size-chip" data-size="${s}">${s}</button>`)
    .join("");
}
function openOverlay() {
  $("#overlay").classList.add("open");
}
function closeAll() {
  $$(".drawer,.modal").forEach((x) => x.classList.remove("open"));
  $("#overlay").classList.remove("open");
}
function openCart() {
  renderCart();
  openOverlay();
  $("#cartDrawer").classList.add("open");
}
function addToCart(id, size = 9) {
  const p = PRODUCTS.find((x) => x.id === Number(id));
  if (!p) return;
  const found = state.cart.find(
    (x) => x.id === p.id && x.size === Number(size),
  );
  if (found) found.qty++;
  else state.cart.push({ id: p.id, size: Number(size), qty: 1 });
  save();
  renderCart();
  toast(`${p.name} added to your bag.`);
}
function renderCart() {
  const box = $("#cartItems");
  if (!state.cart.length) {
    box.innerHTML =
      '<div class="empty-state"><span>▱</span><h3>Your bag is empty</h3><p>Find something you love and add it here.</p></div>';
  } else
    box.innerHTML = state.cart
      .map((item) => {
        const p = PRODUCTS.find((x) => x.id === item.id);
        return `<div class="cart-row"><img src="${p.image}" onerror="this.src='${imageFallback}'" alt="${p.name}"><div><h4>${p.name}</h4><p>Size US ${item.size} · ${money(p.price)}</p><div class="qty-control"><button data-qty="${p.id}|${item.size}|-1">−</button><span>${item.qty}</span><button data-qty="${p.id}|${item.size}|1">＋</button></div></div><div><b>${money(p.price * item.qty)}</b><br><button class="remove" data-remove="${p.id}|${item.size}">Remove</button></div></div>`;
      })
      .join("");
  const total = cartTotal();
  $("#cartSubtotal").textContent = money(total);
  updateCounts();
}
function cartTotal() {
  return state.cart.reduce(
    (sum, x) => sum + PRODUCTS.find((p) => p.id === x.id).price * x.qty,
    0,
  );
}
function openProduct(id) {
  const p = PRODUCTS.find((x) => x.id === Number(id));
  if (!p) return;
  state.selectedSize = 9;
  $("#productModalContent").innerHTML =
    `<div class="product-detail"><div class="detail-image"><img src="${p.image}" alt="${p.name}" onerror="this.src='${imageFallback}'"></div><div class="detail-copy"><p class="eyebrow">${p.brand} / ${p.category}</p><h2>${p.name}</h2><div class="detail-price">${money(p.price)}</div><p>${p.description}</p><p class="muted">Color: ${p.color} · ★ ${p.rating} / 5</p><h4>SELECT SIZE (US)</h4><div class="detail-sizes">${p.sizes.map((s) => `<button data-detail-size="${s}" class="${s === 9 ? "selected" : ""}">${s}</button>`).join("")}</div><p class="muted">${p.stock > 0 ? `${p.stock} pairs available` : "Currently out of stock"}</p><button class="button button-dark" data-detail-add="${p.id}" ${p.stock <= 0 ? "disabled" : ""}>ADD TO BAG — ${money(p.price)} ↗</button></div></div>`;
  openOverlay();
  $("#productModal").classList.add("open");
}
function renderWishlist() {
  const ids = state.wishlist;
  if (!ids.length) {
    toast("Your wishlist is empty.");
    return;
  }
  $("#productGrid").innerHTML = PRODUCTS.filter((p) => ids.includes(p.id))
    .map(productCard)
    .join("");
  $("#resultCount").textContent = `Your wishlist · ${ids.length} saved items`;
  $("#emptyState").classList.add("hidden");
  $("#productGrid").classList.remove("hidden");
  $("#loadMore").classList.add("hidden");
  $("#shop").scrollIntoView({ behavior: "smooth" });
}
function openCheckout() {
  if (!state.cart.length) {
    toast("Your bag is empty.");
    return;
  }
  closeAll();
  $("#checkoutItems").innerHTML = state.cart
    .map((x) => {
      const p = PRODUCTS.find((p) => p.id === x.id);
      return `<div class="summary-row"><span>${p.name} × ${x.qty} (US ${x.size})</span><b>${money(p.price * x.qty)}</b></div>`;
    })
    .join("");
  $("#checkoutTotal").textContent = money(cartTotal());
  openOverlay();
  $("#checkoutModal").classList.add("open");
}
function loadProfile() {
  const user = JSON.parse(localStorage.getItem("sole_user") || "null");
  if (user) {
    $("#accountName").value = user.name;
    $("#accountEmail").value = user.email;
  }
  const orders = JSON.parse(localStorage.getItem("sole_orders") || "[]");
  $("#orderHistory").innerHTML = orders.length
    ? `<h3 style="margin-top:22px;font:700 16px Manrope">Recent orders</h3>` +
      orders
        .map(
          (o) =>
            `<div class="summary-row"><span>${o.id} · ${o.date}</span><b>${money(o.total)}</b></div>`,
        )
        .join("")
    : '<p class="muted">Your orders will appear here after checkout.</p>';
}
function openAccount() {
  loadProfile();
  openOverlay();
  $("#accountModal").classList.add("open");
}

document.addEventListener("click", (e) => {
  const t = e.target;
  if (t.closest("[data-close]") || t.id === "overlay") {
    closeAll();
    return;
  }
  if (t.closest("#cartBtn")) {
    openCart();
    return;
  }
  if (t.closest("#accountBtn")) {
    openAccount();
    return;
  }
  if (t.closest("#wishlistBtn")) {
    renderWishlist();
    return;
  }
  const detail = t.closest("[data-detail]");
  if (detail) {
    openProduct(detail.dataset.detail);
    return;
  }
  const wish = t.closest("[data-wish]");
  if (wish) {
    const id = Number(wish.dataset.wish);
    state.wishlist = state.wishlist.includes(id)
      ? state.wishlist.filter((x) => x !== id)
      : [...state.wishlist, id];
    save();
    renderProducts();
    toast(
      state.wishlist.includes(id)
        ? "Saved to wishlist"
        : "Removed from wishlist",
    );
    return;
  }
  const quick = t.closest("[data-quick]");
  if (quick) {
    addToCart(quick.dataset.quick, 9);
    return;
  }
  const qty = t.closest("[data-qty]");
  if (qty) {
    const [id, size, delta] = qty.dataset.qty.split("|").map(Number);
    const item = state.cart.find((x) => x.id === id && x.size === size);
    item.qty += delta;
    if (item.qty <= 0) state.cart = state.cart.filter((x) => x !== item);
    save();
    renderCart();
    return;
  }
  const rem = t.closest("[data-remove]");
  if (rem) {
    const [id, size] = rem.dataset.remove.split("|").map(Number);
    state.cart = state.cart.filter((x) => !(x.id === id && x.size === size));
    save();
    renderCart();
    return;
  }
  const size = t.closest("[data-detail-size]");
  if (size) {
    state.selectedSize = Number(size.dataset.detailSize);
    $$("[data-detail-size]").forEach((x) =>
      x.classList.toggle("selected", x === size),
    );
    return;
  }
  const detailAdd = t.closest("[data-detail-add]");
  if (detailAdd) {
    addToCart(detailAdd.dataset.detailAdd, state.selectedSize);
    closeAll();
    return;
  }
  const cat = t.closest("[data-category]") || t.closest("[data-category-link]");
  if (cat) {
    state.category = cat.dataset.category || cat.dataset.categoryLink;
    state.visible = 9;
    renderProducts();
    $("#shop").scrollIntoView({ behavior: "smooth" });
    return;
  }
  const sizeFilter = t.closest("[data-size]");
  if (sizeFilter) {
    state.size =
      state.size === sizeFilter.dataset.size ? null : sizeFilter.dataset.size;
    $$("[data-size]").forEach((x) =>
      x.classList.toggle("selected", x.dataset.size === state.size),
    );
    renderProducts();
    return;
  }
});
$("#searchToggle").addEventListener("click", () => {
  $("#shop").scrollIntoView({ behavior: "smooth" });
  $("#searchInput").focus();
});
$("#searchButton").addEventListener("click", () => {
  state.search = $("#searchInput").value;
  state.visible = 9;
  renderProducts();
});
$("#searchInput").addEventListener("input", () => {
  state.search = $("#searchInput").value;
  state.visible = 9;
  renderProducts();
});
$("#sortSelect").addEventListener("change", (e) => {
  state.sort = e.target.value;
  renderProducts();
});
$("#priceRange").addEventListener("input", (e) => {
  state.maxPrice = Number(e.target.value);
  $("#priceValue").textContent = e.target.value;
  renderProducts();
});
$("#inStockOnly").addEventListener("change", (e) => {
  state.inStock = e.target.checked;
  renderProducts();
});
document.addEventListener("change", (e) => {
  if (e.target.matches('input[name="category"],input[name="brand"]'))
    renderProducts();
});
$("#filterToggle").addEventListener("click", () =>
  $("#filtersPanel").classList.toggle("show"),
);
function clearFilters() {
  state.category = "";
  state.search = "";
  state.size = null;
  state.maxPrice = 250;
  state.inStock = false;
  state.visible = 9;
  $("#searchInput").value = "";
  $("#priceRange").value = 250;
  $("#priceValue").textContent = "250";
  $("#inStockOnly").checked = false;
  $$('input[type="checkbox"]').forEach((x) => (x.checked = false));
  $$("[data-size]").forEach((x) => x.classList.remove("selected"));
  $("#sortSelect").value = "featured";
  state.sort = "featured";
  renderProducts();
}
$("#clearFilters").addEventListener("click", clearFilters);
$("#emptyClear").addEventListener("click", clearFilters);
$("#loadMore").addEventListener("click", () => {
  state.visible += 6;
  renderProducts();
});
$("#checkoutBtn").addEventListener("click", openCheckout);
$("#checkoutForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!state.cart.length) return;
  const data = Object.fromEntries(new FormData(e.target).entries());
  const orders = JSON.parse(localStorage.getItem("sole_orders") || "[]");
  const order = {
    id: "SH-" + Date.now().toString().slice(-7),
    date: new Date().toLocaleDateString(),
    total: cartTotal(),
    items: state.cart,
    customer: data,
    status: "Received",
  };
  orders.unshift(order);
  localStorage.setItem("sole_orders", JSON.stringify(orders));
  state.cart = [];
  save();
  e.target.reset();
  closeAll();
  toast(`Demo order ${order.id} placed successfully!`);
  openAccount();
});
$("#accountForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const user = {
    name: $("#accountName").value.trim(),
    email: $("#accountEmail").value.trim(),
  };
  localStorage.setItem("sole_user", JSON.stringify(user));
  $("#accountMessage").textContent = "Profile saved in this browser.";
  toast("Profile saved.");
});
$("#newsletterForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = $("#newsletterEmail").value.trim();
  const subs = JSON.parse(localStorage.getItem("sole_subscribers") || "[]");
  if (!subs.includes(email)) subs.push(email);
  localStorage.setItem("sole_subscribers", JSON.stringify(subs));
  $("#newsletterMessage").textContent =
    "Thanks for subscribing! (Saved in this browser demo.)";
  e.target.reset();
});
$("#mobileMenu").addEventListener("click", () =>
  $("#mainNav").classList.toggle("open"),
);
$("#mainNav").addEventListener("click", (e) => {
  if (e.target.tagName === "A") $("#mainNav").classList.remove("open");
});
$("#overlay").addEventListener("click", closeAll);
setupFilters();
renderProducts();
updateCounts();
renderCart();
