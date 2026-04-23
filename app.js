
/* ===================== UTILS & SECURITY ===================== */
const utils = {
  h(str) {
    if (!str) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', "/": '&#47;' };
    return String(str).replace(/[&<>"'/]/g, s => map[s]);
  },

  // Cloud Error Logger
  async reportError(msg, err = {}) {
    const db = window._firebaseDb;
    if (!db) return;
    try {
      const { collection, addDoc, serverTimestamp } = window._firebaseFirestore;
      await addDoc(collection(db, "system_logs"), {
        type: 'error',
        message: msg,
        error_detail: err.message || 'Unknown',
        stack: err.stack || '',
        user_id: State.user ? State.user.uid : 'guest',
        user_email: State.user ? State.user.email : 'guest',
        path: window.location.hash || '#home',
        userAgent: navigator.userAgent,
        timestamp: serverTimestamp()
      });
    } catch (e) { console.error("Critical: Logging Failed", e); }
  },

  // Centralized Error Boundary with Auto-Reporting
  async safe(fn, errorMsg = 'Operation Failed') {
    try { return await fn(); }
    catch (e) {
      console.error(errorMsg, e);
      this.reportError(errorMsg, e); // Send glitch report to cloud
      UI.toast(`❌ ${errorMsg}: ${e.message}`, 'error');
      return null;
    }
  },

  date(d) {
    if (!d) return 'N/A';
    try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch (e) { return 'Invalid'; }
  }
};

// ===================== DATA STORE =====================
const DB = {
  partners: [
    { name: 'Neomotion', tagline: 'Live Life to the Fullest', color: '#D94F1E', initial: 'N', website: 'https://neomotion.in' },
    { name: 'Karma', tagline: 'A Better Wheelchair, A Better Life', color: '#00897B', initial: 'K', website: 'https://www.karma-medical.com' },
    { name: 'Forza Freedom', tagline: 'Wheelchair World', color: '#1565C0', initial: 'FF', website: 'https://forzawheelchairs.com' },
    { name: 'Phoenix Instinct', tagline: 'Rising Above Adversity', color: '#B45309', initial: 'PI', website: 'https://phoenixinstinct.com' },
    { name: 'Vermeiren', tagline: 'Mobility Solutions Since 1956', color: '#1A237E', initial: 'V', website: 'https://www.vermeiren.com' },
    { name: 'Invacare', tagline: "Making Life's Experiences Possible", color: '#1B5E20', initial: 'Inv', website: 'https://www.invacare.com' }
  ],
  products: [
    {
      id: 1, name: "Forza Freedom 3000", brand: "Forza", category: "manual",
      status: "instock", stock: 10, image: "assets/Forza Freedom 3000.jpg",
      badge: "Clinical Standard", price: 0, mrp: 0,
      desc: "A lightweight and reliable manual wheelchair built with a high-strength aluminium alloy frame. Designed for daily use with enhanced comfort upholstery and precision rear wheels.",
      specs: { "Frame": "Aluminium Alloy", "Weight": "16 kg", "Capacity": "110 kg", "Folding": "Double Crossbar", "Armrests": "Detachable", "Footrests": "Swing-away" },
      features: ["Precision bearing wheels", "Breathable nylon upholstery", "Double crossbar stability", "Quick-response brakes"]
    },
    {
      id: 2, name: "Forza Freedom 4000 (Fixed)", brand: "Forza", category: "manual",
      status: "instock", stock: 8, image: "assets/Forza Freedom 4000 (Fixed Backrest).jpeg",
      badge: "Durable Choice", price: 0, mrp: 0,
      desc: "The Freedom 4000 features a fixed backrest for maximum stability and long-term durability. It is the workhorse of our manual range, preferred for clinical and hospital environments.",
      specs: { "Backrest": "Fixed Support", "Frame": "Reinforced Steel", "Seat Width": "18-20 inches", "Brakes": "Dual Rear Lock", "Rear Wheels": "Mag Wheels", "Weight": "18.5 kg" },
      features: ["Fixed backrest stability", "Heavy-duty frame", "Puncture-proof MAG wheels", "Anatomical armrests"]
    },
    {
      id: 3, name: "Forza Freedom 5000", brand: "Forza", category: "manual",
      status: "instock", stock: 12, image: "assets/Forza Freedom 5000 STD.jpeg",
      badge: "Premium Manual", price: 0, mrp: 0,
      desc: "A premium manual wheelchair that combines sleek aesthetics with clinical functionality. Features a lightweight chassis and ergonomic seating for active independent users.",
      specs: { "Brand": "Forza Freedom", "Chassis": "T6 Aluminium", "Casters": "6-inch Solid", "Rear Wheels": "Pneumatic/Solid options", "Weight": "14.2 kg", "Finish": "Matte Black" },
      features: ["Ultra-light chassis", "Ergonomic propulsion rims", "Modern matte finish", "Compact folding"]
    },
    {
      id: 4, name: "Forza Freedom 6000 (Recliner)", brand: "Forza", category: "manual",
      status: "instock", stock: 5, image: "assets/Forza Freedom 6000 (Recliner).jpeg",
      badge: "Posture Support", price: 0, mrp: 0,
      desc: "The Freedom 6000 Recliner is designed for users who require frequent changes in posture. High back support and smooth reclining mechanism provide relief and prevent pressure sores.",
      specs: { "Recline Range": "Up to 160°", "Head Support": "Integrated Contour", "Leg Support": "Elevating Footrests", "Frame": "Steel Reinforced", "Brakes": "Attendant & Hand-rim", "Cushion": "High Density" },
      features: ["Full recline mechanism", "Elevating leg support", "Contoured headrest", "High-stress durability"]
    },
    {
      id: 5, name: "Forza Freedom CP (Cerebral Palsy)", brand: "Forza", category: "manual",
      status: "instock", stock: 4, image: "assets/Forza Freedom CP.jpeg",
      badge: "Paediatric Spec", price: 0, mrp: 0,
      desc: "A specialized paediatric/adult wheelchair for Cerebral Palsy management. Features tilt-in-space, lateral trunk supports, and a 5-point harness for maximum postural stability.",
      specs: { "Mechanism": "Tilt-in-Space / Recline", "Supports": "Thoracic Lateral + Headrest", "Safety": "5-Point Harness included", "Seat": "Anatomical Contoured", "Wheels": "Small Transit Casters", "Adjustability": "Growth-flexible" },
      features: ["Postural lateral supports", "Tilt-in-space mechanism", "Head & neck alignment", "Growth adjustability"]
    },
    {
      id: 6, name: "Forza Freedom Junior Recliner", brand: "Forza", category: "manual",
      status: "instock", stock: 6, image: "assets/Forza Freedom Junior Recliner.jpeg",
      badge: "Paediatric Choice", price: 0, mrp: 0,
      desc: "A dedicated paediatric reclining wheelchair that provides clinical comfort for children. Lightweight but high-support, with vibrant scaling and adjustable leg rests.",
      specs: { "User Profile": "Junior / Child", "Recline": "Adjustable Backrest", "Frame": "Aluminium/Steel Hybrid", "Weight": "14 kg", "Legrest": "Elevating & Angle-Adjustable", "Warranty": "2 Years" },
      features: ["Child-specific ergonomics", "Comfort padding", "Safe recline angles", "Vibrant clinical finish"]
    },
    {
      id: 7, name: "Invacare Action 2 NG STD", brand: "Invacare", category: "manual",
      status: "instock", stock: 15, image: "assets/Invacare Action 2 NG STD.jpeg",
      badge: "Global Trusted", price: 0, mrp: 0,
      desc: "The Invacare Action 2 is a globally trusted standard for manual mobility. Offering reliability, customizability, and ease of transport for active users.",
      specs: { "Brand": "Invacare", "Series": "Action NG", "Frame": "Foldable Aluminium", "Rear Wheels": "Quick-release Spoke", "Custom": "Shadow Seat Adaptation", "Weight": "15 kg" },
      features: ["Quick-release rear wheels", "Dual-crossbar folding", "Shadow-ready seating", "Reliable durability"]
    },
    {
      id: 8, name: "Invacare Rea Clematis Pro", brand: "Invacare", category: "manual",
      status: "instock", stock: 3, image: "assets/Invacare Rea Clematis Pro.jpeg",
      badge: "Clinical Elite", price: 0, mrp: 0,
      desc: "A premium clinical tilt-in-space wheelchair designed for complex care. The Rea Clematis Pro provides exceptional pressure redistribution and long-term postural support.",
      specs: { "Brand": "Invacare", "Class": "Tilt-in-Space", "Tilt Range": "-1° to 25°", "Backrest Recline": "30° Stepless", "Seating": "Flo-shape Cushion", "Control": "Attendant Operated" },
      features: ["Clinical pressure relief", "Stepless recline control", "Flo-shape postural seating", "Stable wheelbase"]
    },
    {
      id: 9, name: "Stair Climber (Electric)", brand: "Shadow", category: "electric",
      status: "instock", stock: 2, image: "assets/Stair Climber.jpeg",
      badge: "Innovation", price: 0, mrp: 0,
      desc: "Revolutionary mobility solution for multi-storey buildings. This electric stair climber features a caterpillar track system to safely transport users up and down stairs.",
      specs: { "Type": "Tracked Stair Climber", "Motor": "High-torque Electric", "Track": "Anti-slip Rubber", "Battery": "Lithium Rechargeable", "Capacity": "120 kg", "Operation": "Single Attendant" },
      features: ["Safe caterpillar tracks", "Foldable into car boot", "Adjustable guide handle", "Safety X-belt included"]
    },
    {
      id: 10, name: "Forza Freedom Urja Pro", brand: "Forza", category: "electric",
      status: "instock", stock: 5, image: "assets/Forza Freedom Urja Pro.jpeg",
      badge: "Power Choice", price: 0, mrp: 0,
      desc: "The Urja Pro is a high-performance electric wheelchair with a sophisticated joystick control system and long-range power. Built for rugged urban mobility.",
      specs: { "Drive": "Rear-wheel Electric", "Controller": "Interactive Joystick", "Speed": "Up to 8 km/h", "Range": "15-20 km", "Climbing Angle": "Up to 12°", "Weight": "45 kg" },
      features: ["Interactive joystick control", "Dual powerful motors", "Rugged shock absorbers", "Comfort captain's seat"]
    },
    {
      id: 11, name: "Forza Freedom Urja Lite", brand: "Forza", category: "electric",
      status: "instock", stock: 7, image: "assets/Forza Freedom Urja Lite.jpeg",
      badge: "Lightweight Electric", price: 0, mrp: 0,
      desc: "A lightweight, foldable electric wheelchair that bridges the gap between manual portability and power mobility. Perfect for travel and shopping malls.",
      specs: { "Type": "Power Mobility", "Weight": "24 kg (with battery)", "Folding": "Single-button fold", "Battery": "Lithium-Ion", "Motors": "Brushless DC", "Casters": "Solid 8-inch" },
      features: ["Featherweight construction", "Brushless motor efficiency", "Ultra-compact folding", "Travel-safe battery"]
    }
  ],

  orders: [
  ],

  testimonials: [
    { text: "Shadow Wheelchairs changed my father's life. The custom postural seating was perfectly fitted and the team visited our home for assessment. Exceptional service!", name: "Preethi M.", location: "Adyar, Chennai", rating: 5 },
    { text: "I rented a wheelchair for my mother after her surgery. Delivery was prompt, the chair was spotless and exactly what we needed. Will definitely buy from them!", name: "Karthik R.", location: "Mylapore, Chennai", rating: 5 },
    { text: "Johnson sir's knowledge of postural support is unmatched. He helped us pick the right chair for our son with cerebral palsy. We're very grateful.", name: "Vimala S.", location: "Tambaram, Chennai", rating: 5 }
  ],

  registeredUsers: [
  ]
};

// ===================== STATE =====================
const State = {
  // --- Core Data ---
  cart: JSON.parse(localStorage.getItem('sw_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('sw_wishlist') || '[]'),
  user: JSON.parse(localStorage.getItem('sw_user') || 'null'),
  products: (localStorage.getItem('sw_products_v14') && JSON.parse(localStorage.getItem('sw_products_v14')).length) ? JSON.parse(localStorage.getItem('sw_products_v14')) : DB.products,
  orders: (localStorage.getItem('sw_orders') && JSON.parse(localStorage.getItem('sw_orders')).length) ? JSON.parse(localStorage.getItem('sw_orders')) : DB.orders,
  registeredUsers: (localStorage.getItem('sw_registered_users') && JSON.parse(localStorage.getItem('sw_registered_users')).length) ? JSON.parse(localStorage.getItem('sw_registered_users')) : DB.registeredUsers,

  // --- UI State ---
  shopFilter: 'all',
  heroSlide: 0,
  heroTimer: null,
  userAuthMode: 'register',
  adminTab: 'products',
  userTab: 'orders',

  save() {
    localStorage.setItem('sw_cart', JSON.stringify(this.cart));
    localStorage.setItem('sw_wishlist', JSON.stringify(this.wishlist));
    localStorage.setItem('sw_user', JSON.stringify(this.user));
    localStorage.setItem('sw_products_v14', JSON.stringify(this.products));
    localStorage.setItem('sw_orders', JSON.stringify(this.orders));
    localStorage.setItem('sw_registered_users', JSON.stringify(this.registeredUsers || []));
  },

  getProduct(id) { return this.products.find(p => p.id === parseInt(id)); },
  cartTotal() { return this.cart.reduce((sum, i) => sum + i.price * i.qty, 0); },
  cartCount() { return this.cart.reduce((sum, i) => sum + i.qty, 0); },

  async syncCloudData() {
    // This is still useful for a one-time force-sync if needed, 
    // but the real-time listeners below are now the primary source.
    const { getDocs, collection } = window._firebaseFirestore;
    const db = window._firebaseDb;

    try {
      const cSnap = await getDocs(collection(db, "customers"));
      this.registeredUsers = cSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) { console.warn("Customer sync skipped:", e.message); }

    try {
      const eSnap = await getDocs(collection(db, "enquiries"));
      this.orders = eSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (e) { console.warn("Enquiries sync failed:", e.message); }

    this.save();
  },

  // Real-time Listeners
  _adminUnsubs: [],
  startAdminListeners() {
    this.stopAdminListeners(); // Clean up existing
    const { onSnapshot, collection } = window._firebaseFirestore;
    const db = window._firebaseDb;
    if (!onSnapshot || !db) return;

    // Listen to Customers
    const unsubCust = onSnapshot(collection(db, "customers"), (snapshot) => {
      this.registeredUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.save();
      this.refreshAdminUI();
    });

    // Listen to Enquiries
    const unsubOrders = onSnapshot(collection(db, "enquiries"), (snapshot) => {
      this.orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      this.save();
      this.refreshAdminUI();
    });

    // Listen to Inventory (Products)
    const unsubProds = onSnapshot(collection(db, "products"), (snapshot) => {
      if (snapshot.empty) return; // Keep defaults if DB is empty
      this.products = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }))
        .sort((a, b) => a.id - b.id);
      this.save();
      this.refreshAdminUI();
    });

    this._adminUnsubs = [unsubCust, unsubOrders, unsubProds];
  },

  stopAdminListeners() {
    this._adminUnsubs.forEach(unsub => unsub());
    this._adminUnsubs = [];
  },

  refreshAdminUI() {
    if (window.location.hash.includes('admin')) {
      const content = document.getElementById('main-content');
      const isAdminAuthed = localStorage.getItem('sw_admin_authed') === 'true';
      if (isAdminAuthed && content) {
        const stats = content.querySelector('.stats-cards');
        if (stats) stats.outerHTML = this._getAdminStatsHtml();

        const body = document.getElementById('admin-body');
        if (body) body.innerHTML = Pages.adminTab(this.adminTab);
      }
    }
  },

  _getAdminStatsHtml() {
    return `
      <div class="stats-cards" style="margin-bottom:2rem">
        <div class="stat-c highlight"><span>Total Products</span><strong>${this.products.length}</strong></div>
        <div class="stat-c"><span>In Stock</span><strong>${this.products.filter(p => p.status === 'instock').length}</strong></div>
        <div class="stat-c"><span>Low Stock</span><strong>${this.products.filter(p => p.status === 'lowstock').length}</strong></div>
        <div class="stat-c highlight"><span>Enquiries</span><strong>${this.orders.length}</strong></div>
        <div class="stat-c highlight" style="border-color:var(--blue)"><span>Total Customers</span><strong>${this.registeredUsers.length}</strong></div>
      </div>
    `;
  }
};

// ===================== AUTH LISTENER =====================
const initAuthListener = () => {
  const auth = window._firebaseAuth;
  const onAuthStateChanged = window._firebaseAuthReady;

  if (!auth || !onAuthStateChanged) return;

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const isAdminAuthed = localStorage.getItem('sw_admin_authed') === 'true';
      const isWhitelistedAdmin = user.email === 'rohinselva12@gmail.com';
      if (isAdminAuthed || isWhitelistedAdmin) return;

      if (window._authProcessing) return;

      const { query, where, getDocs, collection } = window._firebaseFirestore;
      const db = window._firebaseDb;

      try {
        const cSnap = await getDocs(query(collection(db, "customers"), where("uid", "==", user.uid)));

        if (!cSnap.empty) {
          State.user = cSnap.docs[0].data();
          State.save();
          if (window.location.hash === '#user') {
            const content = document.getElementById('main-content');
            if (content) content.innerHTML = Pages.user();
          }
        } else {
          if (!State.user || State.user.uid !== user.uid) {
            State.user = {
              uid: user.uid,
              email: user.email,
              name: user.email.split('@')[0],
              phone: '',
              address: ''
            };
            State.save();
            if (window.location.hash === '#user') {
              const content = document.getElementById('main-content');
              if (content) content.innerHTML = Pages.user();
            }
          }
        }
      } catch (e) {
        console.error("Selective Auth sync error:", e);
      }
    }
  });
};

// ===================== CART =====================
const Cart = {
  add(id, qty = 1) {
    const p = State.getProduct(id);
    if (!p || p.stock === 0) return UI.toast('❌ Product not available', 'error');
    const existing = State.cart.find(i => i.id === id);
    if (existing) {
      if (existing.qty >= p.stock) return UI.toast('⚠ Max stock reached');
      existing.qty += qty;
    } else {
      State.cart.push({ id, name: p.name, price: p.price, image: p.image, category: p.category, qty, isRental: p.isRental || false });
    }
    State.save();
    UI.updateBadges();
    UI.toast(`✅ "${p.name}" added to cart`);
    UI.renderCartDrawer();
  },
  remove(id) {
    State.cart = State.cart.filter(i => i.id !== id);
    State.save(); UI.updateBadges(); UI.renderCartDrawer();
  },
  changeQty(id, delta) {
    const item = State.cart.find(i => i.id === id);
    const p = State.getProduct(id);
    if (!item) return;
    item.qty = Math.max(1, Math.min(item.qty + delta, p ? p.stock : 99));
    if (item.qty === 0) return Cart.remove(id);
    State.save(); UI.renderCartDrawer();
  },
  clear() { State.cart = []; State.save(); UI.updateBadges(); UI.renderCartDrawer(); }
};

// ===================== WISHLIST =====================
const Wishlist = {
  toggle(id) {
    const idx = State.wishlist.indexOf(id);
    if (idx === -1) { State.wishlist.push(id); UI.toast('❤ Added to wishlist'); }
    else { State.wishlist.splice(idx, 1); UI.toast('Removed from wishlist'); }
    State.save(); UI.updateBadges();
    document.querySelectorAll(`.wishlist-btn[data-id="${id}"]`).forEach(btn => {
      btn.classList.toggle('loved', State.wishlist.includes(id));
      btn.textContent = State.wishlist.includes(id) ? '❤' : '♡';
    });
  },
  has(id) { return State.wishlist.includes(id); }
};

// ===================== SEARCH =====================
const Search = {
  run(query) {
    const container = document.getElementById('search-results');
    if (!container) return;
    if (query.length < 2) { container.innerHTML = ''; return; }
    const results = State.products.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      p.desc.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6);
    if (!results.length) { container.innerHTML = '<div style="padding:14px 16px;color:#868e96;font-size:.85rem;">No results found.</div>'; return; }
    container.innerHTML = results.map(p => `
      <div class="search-result-item" onclick="UI.toggleSearch(); router.goProduct(${p.id})">
        <img src="${p.image}" alt="${p.name}">
        <div><strong>${p.name}</strong><span style="font-size:.7rem;color:#868e96">View Details</span></div>
      </div>
    `).join('');
  }
};

// ===================== UI HELPERS =====================
const UI = {
  toast(msg, type = 'success') {
    // Only show critical errors; silence all success/info notifications as requested
    if (type !== 'error') return;

    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.style.borderLeftColor = '#e03131'; // Error color
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 3000);
  },

  updateBadges() {
    const cc = document.getElementById('cart-count');
    const wc = document.getElementById('wishlist-count');
    if (cc) cc.textContent = State.cartCount();
    if (wc) wc.textContent = State.wishlist.length;
  },

  toggleSearch() {
    const bar = document.getElementById('search-bar');
    const inp = document.getElementById('search-input');
    bar.classList.toggle('open');
    if (bar.classList.contains('open')) { inp.focus(); }
    else { inp.value = ''; document.getElementById('search-results').innerHTML = ''; }
  },

  toggleMenu(force) {
    const nav = document.getElementById('nav-links');
    if (force === false) nav.classList.remove('open');
    else if (force === true) nav.classList.add('open');
    else nav.classList.toggle('open');
  },

  openCart() {
    document.getElementById('cart-drawer').classList.add('open');
    document.getElementById('cart-overlay').classList.add('open');
    UI.renderCartDrawer();
  },

  closeCart() {
    document.getElementById('cart-drawer').classList.remove('open');
    document.getElementById('cart-overlay').classList.remove('open');
  },

  openModal(html) {
    const modal = document.getElementById('main-modal');
    document.getElementById('modal-overlay').classList.add('open');
    modal.classList.add('open');
    document.getElementById('modal-body').innerHTML = html;
  },

  closeModal() {
    document.getElementById('main-modal').classList.remove('open');
    document.getElementById('modal-overlay').classList.remove('open');
  },

  renderCartDrawer() {
    const body = document.getElementById('cart-body');
    const foot = document.getElementById('cart-foot');
    if (!body || !foot) return;

    if (!State.cart.length) {
      body.innerHTML = `<div class="empty-cart"><div class="ec-icon">🛒</div><h4>Your cart is empty</h4><p>Add products to get started.</p><br><button class="btn btn-primary btn-sm" onclick="UI.closeCart(); router.go('shop')">Browse Products</button></div>`;
      foot.innerHTML = '';
      return;
    }

    body.innerHTML = State.cart.map(item => `
      <div class="cart-item-row">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <div class="cat">${item.category} ${item.isRental ? '· Rental' : ''}</div>
          <h5>${item.name}</h5>
          <div style="font-size:.75rem;color:#868e96;margin-top:4px">Interested in: ${item.qty} unit${item.qty > 1 ? 's' : ''}</div>
          <div class="cart-qty-btns">
            <button onclick="Cart.changeQty(${item.id}, -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="Cart.changeQty(${item.id}, 1)">+</button>
          </div>
        </div>
        <button class="cart-item-del" onclick="Cart.remove(${item.id})">🗑</button>
      </div>
    `).join('');

    foot.innerHTML = `
      <div style="background:var(--white);padding:1.2rem;border-radius:var(--radius);margin-bottom:1.2rem;border:1px solid var(--gray-200)">
        <h5 style="margin-bottom:.5rem;font-size:.85rem">Direct Contact</h5>
        <div style="font-size:.85rem;margin-bottom:4px">📞 <a href="tel:+919445610803">+91 94456 10803</a></div>
        <div style="font-size:.85rem">✉ <a href="mailto:johnson.shadowwheelchairs@outlook.com" style="color:var(--orange-dark);font-weight:700">johnson.shadowwheelchairs@outlook.com</a></div>
      </div>
      <button class="btn btn-primary btn-full" onclick="UI.closeCart(); Pages.openEnquiryForm()">Request Callback →</button>
      <button class="btn btn-outline btn-full" style="margin-top:8px" onclick="UI.closeCart()">Continue Browsing</button>
    `;
  },

  setActive(page) {
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    // Select by href or by onclick attribute for robustness
    const link = document.querySelector(`.nav-links a[onclick*="'${page}'"]`) ||
      document.querySelector(`.nav-links a[href="#${page}"]`);
    if (link) link.classList.add('active');
  }
};

// ===================== HERO SLIDER =====================
const Hero = {
  slides: [
    { badge: "Premium Mobility Choice", title: "EMPOWERING <span class='highlight'>MOBILITY</span>", sub: "Experience next-level independence with our sophisticated electric wheelchairs.", img: "assets/hero_electric.png", btnLabel: "Shop Electric", category: "electric" },
    { badge: "Manual Excellence", title: "BUILT FOR <span class='highlight'>PRECISION</span>", sub: "Ultra-lightweight frames and ergonomic design for your active lifestyle.", img: "assets/hero_manual.png", btnLabel: "Shop Manual", category: "manual" },
    { badge: "Shadow Innovation", title: "BEYOND <span class='highlight'>BOUNDARIES</span>", sub: "Revolutionary devices designed to overcome any obstacle, including stairs.", img: "assets/hero_innovation.png", btnLabel: "Explore Technology", category: "electric" }
  ],

  render() {
    return `
      <div class="hero">
        <div class="hero-slides" id="hero-slides">
          ${this.slides.map((s, i) => `
            <div class="hero-slide ${i === 0 ? 'active' : ''}" id="slide-${i}">
              <div class="hero-content">
                <div class="hero-badge">${s.badge}</div>
                <h1>${s.title}</h1>
                <p>${s.sub}</p>
                <div class="hero-actions">
                  <button class="btn btn-primary" onclick="router.goShop('${s.category}')">${s.btnLabel}</button>
                  <button class="btn btn-outline" style="color:#fff;border-color:rgba(255,255,255,.3)" onclick="router.go('contact')">Get Free Advice</button>
                </div>
              </div>
              <div class="hero-image"><img src="${s.img}" alt="${s.title.replace(/<[^>]+>/g, '')}"></div>
            </div>
          `).join('')}
        </div>
        <button class="hero-prev" onclick="Hero.prev()">‹</button>
        <button class="hero-next" onclick="Hero.next()">›</button>
        <div class="hero-dots">
          ${this.slides.map((_, i) => `<button class="hero-dot ${i === 0 ? 'active' : ''}" onclick="Hero.goTo(${i})"></button>`).join('')}
        </div>
      </div>
    `;
  },

  goTo(idx) {
    document.querySelectorAll('.hero-slide').forEach((s, i) => s.classList.toggle('active', i === idx));
    document.querySelectorAll('.hero-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
    State.heroSlide = idx;
  },

  next() { this.goTo((State.heroSlide + 1) % this.slides.length); },
  prev() { this.goTo((State.heroSlide - 1 + this.slides.length) % this.slides.length); },

  start() {
    clearInterval(State.heroTimer);
    State.heroTimer = setInterval(() => Hero.next(), 5000);
  }
};

// ===================== PRODUCT CARD =====================
function productCard(p) {
  const statusMap = { instock: 'badge-instock', lowstock: 'badge-lowstock', outofstock: 'badge-outofstock', rental: 'badge-rental', custom: 'badge-custom' };
  const statusLabel = { instock: 'In Stock', lowstock: 'Low Stock', outofstock: 'Out of Stock' };
  const badgeClass = p.isRental ? 'badge-rental' : (p.category === 'custom' ? 'badge-custom' : statusMap[p.status]);
  const isLoved = Wishlist.has(p.id);
  const canBuy = p.status !== 'outofstock';

  return `
    <div class="product-card" id="pc-${p.id}">
      <div class="product-img-wrap" onclick="router.goProduct(${p.id})">
        <img src="${p.image}" alt="${utils.h(p.name)}" loading="lazy">
        <span class="product-badge ${badgeClass}">${utils.h(p.badge) || (p.isRental ? 'For Rent' : statusLabel[p.status])}</span>
        <button class="wishlist-btn ${isLoved ? 'loved' : ''}" data-id="${p.id}" onclick="event.stopPropagation(); Wishlist.toggle(${p.id})">${isLoved ? '❤' : '♡'}</button>
      </div>
      <div class="product-info">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <div class="cat-label">${utils.h(p.category.charAt(0).toUpperCase() + p.category.slice(1))}</div>
          ${p.brand ? `<span style="font-size:.68rem;padding:2px 8px;background:rgba(245,160,0,.12);color:var(--orange-dark);border-radius:50px;font-weight:800;white-space:nowrap">${utils.h(p.brand)}</span>` : ''}
        </div>
        <h3 onclick="router.goProduct(${p.id})">${utils.h(p.name)}</h3>
        <p class="desc">${utils.h(p.desc).substring(0, 80)}...</p>
        <div class="product-footer">
          <button class="btn btn-outline btn-sm btn-full" onclick="Pages.quickEnquiry(${p.id})" ${!canBuy ? 'disabled' : ''}>
            ${canBuy ? 'Show Interest' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  `;
}

// ===================== PAGES =====================
const Pages = {

  // ---- HOME ----
  home() {
    const cats = [
      { id: 'electric', icon: '⚡', label: 'Electric Wheelchairs', count: State.products.filter(p => p.category === 'electric').length },
      { id: 'manual', icon: '♿', label: 'Manual Wheelchairs', count: State.products.filter(p => p.category === 'manual').length },
      { id: 'custom', icon: '🎯', label: 'Custom Seating', count: State.products.filter(p => p.category === 'custom').length },
    ];

    const whyUs = [
      { icon: '📐', title: 'Personalised Assessment', text: 'Every customer is unique. Our therapists conduct a full assessment before recommending or building your chair.' },
      { icon: '🏗', title: 'Custom Fabrication', text: 'We customise wheelchairs for every mobility difficulty – postural support, hospice needs, and more.' },
      { icon: '🚚', title: 'Home Delivery & Setup', text: 'From Chennai to India-wide, we deliver, assemble, and fit your wheelchair at home.' },
      { icon: '🔧', title: 'After-Sales Maintenance', text: 'Ongoing wheelchair maintenance and servicing so your chair performs at its best every day.' },
      { icon: '🏥', title: 'Hospital & Hospice Care', text: 'Specialised reclining and comfort equipment designed for long-term care and recovery.' },
      { icon: '❤️', title: 'Compassionate Care', text: 'We understand the emotional journey. Our team brings patience, empathy, and expertise to every interaction.' }
    ];

    const topProducts = State.products.filter(p => p.status !== 'outofstock').slice(0, 4);

    return `
      ${Hero.render()}

      <div class="stats-bar">
        <div class="stats-inner">
          <div class="stat-item"><strong>1000+</strong><span>Customers Served</span></div>
          <div class="stat-item"><strong>10+</strong><span>Years Experience</span></div>
          <div class="stat-item"><strong>8</strong><span>Wheelchair Models</span></div>
          <div class="stat-item"><strong>24/7</strong><span>Support Available</span></div>
        </div>
      </div>

      <section class="categories-section">
        <div class="container">
          <div class="section-title"><h2>PRODUCT CATEGORIES</h2><span class="accent-line"></span><p>Find the right mobility solution for your needs</p></div>
          <div class="categories-grid">
            ${cats.map(c => `
              <div class="category-card" onclick="router.goShop('${c.id}')">
                <span class="cat-icon">${c.icon}</span>
                <h4>${c.label}</h4>
                <span>${c.count} product${c.count !== 1 ? 's' : ''}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-title"><h2>TOP SELLING PRODUCTS</h2><span class="accent-line"></span><p>Our most trusted mobility solutions</p></div>
          <div class="product-grid">${topProducts.map(p => productCard(p)).join('')}</div>
          <div style="text-align:center;margin-top:3rem"><button class="btn btn-dark" onclick="router.go('shop')">View All Products →</button></div>
        </div>
      </section>

      <section class="section why-section">
        <div class="container">
          <div class="section-title"><h2 style="color:#fff">WHY CHOOSE <span style="color:var(--orange)">SHADOW</span></h2><span class="accent-line"></span><p style="color:#868e96">Six reasons thousands of customers trust us</p></div>
          <div class="why-grid">${whyUs.map(w => `<div class="why-card"><div class="why-icon">${w.icon}</div><h4>${w.title}</h4><p>${w.text}</p></div>`).join('')}</div>
        </div>
      </section>

      <section class="section testimonials-section">
        <div class="container">
          <div class="section-title"><h2>CUSTOMER STORIES</h2><span class="accent-line"></span><p>Real experiences from our community</p></div>
          <div class="testimonials-grid">
            ${DB.testimonials.map(t => `
              <div class="testimonial-card">
                <div class="stars">${'★'.repeat(t.rating)}</div>
                <p>"${t.text}"</p>
                <div class="testimonial-author">
                  <div class="author-avatar">${t.name.charAt(0)}</div>
                  <div><div class="author-name">${t.name}</div><div class="author-location">📍 ${t.location}</div></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <section style="padding:60px 0;background:var(--black)">
        <div class="container">
          <div class="section-title"><h2 style="color:#fff">TRUSTED <span style="color:var(--orange)">PARTNER BRANDS</span></h2><span class="accent-line"></span><p style="color:#868e96">We source from the world's leading wheelchair manufacturers and customise every chair for your unique needs</p></div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem;margin-bottom:2.5rem">
            ${DB.partners.map(p => `
              <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:var(--radius);padding:2rem 1.5rem;text-align:center;transition:all var(--transition);border-top:3px solid ${p.color}" onmouseover="this.style.background='rgba(255,255,255,.09)'" onmouseout="this.style.background='rgba(255,255,255,.05)'">
                <div style="font-family:'Bebas Neue',sans-serif;font-size:1.8rem;letter-spacing:2px;color:#fff;line-height:1">${p.name}</div>
              </div>
            `).join('')}
          </div>
          <p style="text-align:center;color:#868e96;font-size:.85rem">Shadow Wheelchairs is an authorised dealer and customisation partner for all the brands above. Every chair is sourced, assessed, and adapted specifically for your requirements.</p>
        </div>
      </section>

      <div class="cta-banner">
        <div class="container cta-inner">
          <div><h2>NOT SURE WHICH CHAIR IS RIGHT?</h2><p>Talk to our mobility specialist — free, no-obligation consultation.</p></div>
          <div style="display:flex;gap:1rem;flex-wrap:wrap">
            <a href="tel:+919445610803" class="btn btn-dark">📞 Call Us Now</a>
            <button class="btn btn-outline btn-dark" onclick="router.go('contact')">Send Enquiry</button>
          </div>
        </div>
      </div>
    `;
  },

  // ---- SHOP ----
  shop(filterCat = 'all') {
    State.shopFilter = filterCat;
    const cats = [
      { id: 'all', label: 'All Products' },
      { id: 'electric', label: 'Electric' },
      { id: 'manual', label: 'Manual' },
      { id: 'custom', label: 'Custom Seating' }
    ];

    const filtered = filterCat === 'all' ? State.products : State.products.filter(p => p.category === filterCat);

    return `
      <div class="container section-sm">
        <div class="section-title"><h2>OUR PRODUCTS</h2><span class="accent-line"></span><p>Browse our full range of wheelchairs and mobility aids</p></div>

        <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-bottom:2rem;justify-content:center">
          ${cats.map(c => `<button class="btn btn-sm ${State.shopFilter === c.id ? 'btn-primary' : 'btn-outline'}" onclick="Pages.filterShop('${c.id}')">${c.label}</button>`).join('')}
        </div>

        <div class="sort-bar">
          <span style="font-size:.88rem;color:#868e96">${filtered.length} product${filtered.length !== 1 ? 's' : ''} found</span>
          <select onchange="Pages.sortShop(this.value)">
            <option value="default">Default Sort</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        <div class="product-grid" id="shop-grid">
          ${filtered.length ? filtered.map(p => productCard(p)).join('') : '<div style="text-align:center;padding:3rem;color:#868e96;grid-column:1/-1">No products found in this category.</div>'}
        </div>
      </div>
    `;
  },

  filterShop(cat) {
    State.shopFilter = cat;
    document.getElementById('main-content').innerHTML = this.shop(cat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  sortShop(val) {
    const grid = document.getElementById('shop-grid');
    let products = State.shopFilter === 'all' ? [...State.products] : State.products.filter(p => p.category === State.shopFilter);
    if (val === 'price-asc') products.sort((a, b) => a.price - b.price);
    else if (val === 'price-desc') products.sort((a, b) => b.price - a.price);
    else if (val === 'name') products.sort((a, b) => a.name.localeCompare(b.name));
    grid.innerHTML = products.map(p => productCard(p)).join('');
  },

  // ---- PRODUCT DETAIL ----
  product(id) {
    const p = State.getProduct(id);
    if (!p) return '<div class="container section-sm"><p>Product not found. <button class="btn btn-outline" onclick="router.go(\'shop\')">Back to Shop</button></p></div>';

    const related = State.products.filter(r => r.category === p.category && r.id !== p.id).slice(0, 3);

    return `
      <div class="container section-sm">
        <div style="font-size:.82rem;color:#868e96;margin-bottom:1.5rem">
          <span style="cursor:pointer;color:var(--orange)" onclick="router.go('home')">Home</span> › 
          <span style="cursor:pointer;color:var(--orange)" onclick="router.goShop('${p.category}')">${utils.h(p.category.charAt(0).toUpperCase() + p.category.slice(1))}</span> › 
          ${utils.h(p.name)}
        </div>

        <div class="detail-layout">
          <div class="detail-gallery">
            <div class="main-img"><img src="${p.image}" alt="${p.name}" id="main-prod-img"></div>
            <div class="thumb-row">
              <div class="thumb active" onclick="document.getElementById('main-prod-img').src='${p.image}'"><img src="${p.image}" alt="view 1"></div>
            </div>
          </div>

          <div class="detail-info">
            <div class="cat-breadcrumb">${utils.h(p.category.charAt(0).toUpperCase() + p.category.slice(1))} ${p.isRental ? '· Rental' : ''}</div>
            <h1 style="margin-bottom:0.4rem">${utils.h(p.name)}</h1>
            <div class="product-success-meta">

              <div class="detail-badge-wrap">
                <span class="product-badge-inline ${p.status === 'instock' ? 'badge-instock' : p.status === 'lowstock' ? 'badge-lowstock' : 'badge-outofstock'}">
                  ${p.status === 'instock' ? '✓ In Stock' : p.status === 'lowstock' ? '⚠ Only ' + p.stock + ' left' : '✕ Out of Stock'}
                </span>
              </div>
            </div>

            <div style="font-size:.9rem;color:var(--orange-dark);font-weight:700;margin-bottom:1.5rem;background:var(--orange-pale);display:inline-block;padding:4px 12px;border-radius:50px;margin-top:0.5rem">Contact for Quote</div>
            
            <p class="detail-desc">${utils.h(p.desc)}</p>

            <ul style="margin-bottom:1.5rem;display:flex;flex-direction:column;gap:6px">
              ${p.features.map(f => `<li style="font-size:.88rem;color:#495057">✅ ${utils.h(f)}</li>`).join('')}
            </ul>

            <div class="detail-actions">
              <button class="btn btn-primary" onclick="Cart.add(${p.id}); UI.openCart()" ${p.status === 'outofstock' ? 'disabled' : ''}>
                ${p.status === 'outofstock' ? 'Unavailable' : 'Express Interest'}
              </button>
              <button class="btn btn-outline" onclick="Wishlist.toggle(${p.id})" id="detail-wish-btn">
                ${Wishlist.has(p.id) ? '❤ Wishlisted' : '♡ Wishlist'}
              </button>
            </div>

            <div style="background:var(--orange-pale);border-radius:var(--radius);padding:1rem 1.2rem;margin-bottom:1.5rem;font-size:.85rem">
              📞 <a href="tel:+919445610803" style="color:var(--orange-dark);font-weight:700">Call +91 94456 10803</a> for immediate assistance.
            </div>

            <h4 style="margin-bottom:1rem;font-size:.95rem">Technical Specifications</h4>
            <table class="spec-table">
              ${Object.entries(p.specs).map(([k, v]) => `<tr><td>${utils.h(k)}</td><td>${utils.h(v)}</td></tr>`).join('')}
            </table>
          </div>
        </div>

        ${related.length ? `
          <div style="margin-top:4rem">
            <h2 style="font-family:var(--font-display);font-size:2rem;margin-bottom:1.5rem">YOU MAY ALSO LIKE</h2>
            <div class="product-grid">${related.map(r => productCard(r)).join('')}</div>
          </div>
        ` : ''}
      </div>
    `;
  },

  // ---- CHECKOUT ----
  openEnquiryForm() {
    const u = State.user;
    const isAuthed = !!u && !!u.phone;

    UI.openModal(`
      <div style="text-align:center;margin-bottom:2rem">
        <h1 style="font-family:var(--font-display);font-size:2.5rem;color:var(--black)">REQUEST CALLBACK</h1>
        <p style="color:#868e96">Our clinic team will call you to discuss your custom mobility needs.</p>
      </div>

      <form class="contact-form" onsubmit="Pages.submitEnquiry(event)">
        <div class="form-row">
          <div class="form-group">
            <label>Your Name *</label>
            <input type="text" id="eq-name" required 
              value="${u ? utils.h(u.name) : ''}" 
              placeholder="Customer / Caregiver name">
          </div>
          <div class="form-group">
            <label>Phone Number *</label>
            <input type="tel" id="eq-phone" required 
              value="${u ? utils.h(u.phone) : ''}" 
              placeholder="+91 XXXXX XXXXX">
          </div>
        </div>

        <div class="form-group"><label>Interested in (Items)</label>
          <textarea readonly style="background:var(--gray-100);color:var(--gray-700)">${State.cart.map(i => `${i.name} (${i.qty})`).join(', ')}</textarea>
        </div>
        
        <div class="form-group"><label>Preferred time for callback / Medical Notes</label>
          <textarea id="eq-notes" rows="3" placeholder="e.g. Call me after 4pm. Specific requirements..."></textarea>
        </div>
        
        <button type="submit" class="btn btn-primary btn-full" style="margin-top:1rem">Send Request →</button>
      </form>
    `);
  },

  async submitEnquiry(e) {
    e.preventDefault();
    const name = document.getElementById('eq-name').value;
    const phone = document.getElementById('eq-phone').value;
    const notes = document.getElementById('eq-notes').value;

    const newEnquiry = {
      customer: name,
      phone: phone,
      product: State.cart.map(i => `${i.name} (x${i.qty})`).join(', '),
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      notes: notes,
      userUid: State.user ? State.user.uid : null
    };

    try {
      const { collection, addDoc, serverTimestamp } = window._firebaseFirestore;
      const docRef = await addDoc(collection(window._firebaseDb, "enquiries"), {
        ...newEnquiry,
        createdAt: serverTimestamp()
      });

      newEnquiry.id = docRef.id;
      State.orders.unshift(newEnquiry);

      Cart.clear();
      State.save();

      UI.openModal(`
        <div style="text-align:center;padding:2rem">
          <div style="font-size:4rem;margin-bottom:1rem">📞</div>
          <h2 style="font-family:var(--font-display);font-size:2.5rem;color:var(--black)">REQUEST SENT!</h2>
          <p style="color:#868e96;margin:1.5rem 0">Thank you, <strong>${name}</strong>. Our specialist will call you at <strong>${phone}</strong> shortly to discuss the assessment and customisation.</p>
          <div style="background:var(--orange-pale);border-radius:var(--radius);padding:1.2rem;margin-bottom:2rem">
            📍 Clinic Address: 36, Professor Sanjeevi St, Mylapore, Chennai
          </div>
          <button class="btn btn-primary" onclick="UI.closeModal(); router.go('home')">Back to Home</button>
        </div>
      `);
    } catch (err) {
      console.error(err);
      UI.toast('❌ Submission Error: ' + err.message, 'error');
    }
  },

  quickEnquiry(id) {
    Cart.add(id);
    UI.openCart();
    UI.toast('Item added to enquiry list');
  },

  // ---- USER PANEL ----
  user() {
    // If not logged in and NOT on wishlist tab, show login/reg
    if (!State.user && State.userTab !== 'wishlist') {
      const isLogin = State.userAuthMode === 'login';
      return `
        <div class="container section-sm" style="max-width:500px;margin:0 auto">
          <div style="text-align:center;margin-bottom:2.5rem">
            <h1 style="font-family:var(--font-display);font-size:3rem;letter-spacing:-1px">MY ACCOUNT</h1>
            <p style="color:#868e96;margin-top:.5rem">${isLogin ? 'Sign in to access your consultations and enquiries.' : 'Register to book clinical consultations and track your custom mobility needs.'}</p>
          </div>
          
          <div style="background:var(--white);border-radius:var(--radius-lg);padding:3rem;box-shadow:var(--shadow-lg);border-top:5px solid var(--orange)">
            <form class="contact-form" onsubmit="Pages.loginUser(event)">
              ${!isLogin ? `<div class="form-group"><label>Full Name</label><input id="u-name" required placeholder="Enter your name"></div>` : ''}
              <div class="form-group"><label>Email Address</label><input id="u-email" type="email" required placeholder="email@example.com"></div>
              <div class="form-group"><label>Password</label><input id="u-pass" type="password" required placeholder="••••••••"></div>
              ${!isLogin ? `<div class="form-group"><label>Phone Number</label><input id="u-phone" type="tel" required placeholder="+91 XXXXX XXXXX"></div>` : ''}
              
              <button type="submit" id="auth-btn" class="btn btn-primary btn-full" style="padding:1.2rem;font-size:1.1rem;font-weight:900;margin-top:1rem">
                ${isLogin ? 'Sign In →' : 'Register Account →'}
              </button>
            </form>

            <div style="margin-top:2rem;padding-top:1.5rem;border-top:1px solid #eee;text-align:center;font-size:.9rem">
              ${isLogin ?
          `New Customer? <a href="javascript:void(0)" onclick="State.userAuthMode='register'; router.go('user')" style="color:var(--orange);font-weight:bold">Register here</a>` :
          `Already registered? <a href="javascript:void(0)" onclick="State.userAuthMode='login'; router.go('user')" style="color:var(--orange);font-weight:bold">Sign in here</a>`
        }
            </div>
          </div>

          <div style="text-align:center;margin-top:2rem;color:#868e96;font-size:.85rem">
            🔒 Your data is secure and used only for clinical consultations.
          </div>
        </div>
      `;
    }

    const u = State.user || { name: 'Guest User', email: 'Log in to save your wishlist permanently', phone: '' };
    const nameStr = u.name;
    const firstChar = nameStr.charAt(0).toUpperCase();
    const tabs = State.user ? ['orders', 'wishlist', 'profile'] : ['wishlist'];

    return `
      <div class="container section-sm">
        <div class="panel-layout">
          <div class="panel-sidebar">
            <div class="panel-user-info">
              <div class="avatar">${utils.h(firstChar)}</div>
              <h4>${utils.h(nameStr)}</h4>
              <p style="font-size:.8rem">${utils.h(u.email)}</p>
            </div>
            ${tabs.map(t => {
      const active = State.userTab === t;
      const icons = {
        orders: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
        wishlist: `<svg width="18" height="18" viewBox="0 0 24 24" fill="${active ? '#e03131' : '#ff8787'}" stroke="#e03131" stroke-width="2" style="margin-right:8px"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
        profile: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
      };
      const labels = { orders: 'My Enquiries', wishlist: 'Wishlist', profile: 'Profile' };

      return `<div class="panel-nav-link ${active ? 'active' : ''}" onclick="State.userTab='${t}'; document.getElementById('user-panel-body').innerHTML = Pages.userTab('${t}')">
                ${icons[t]} ${labels[t]}
              </div>`;
    }).join('')}
            ${State.user ?
        `<div class="panel-nav-link" onclick="Pages.logoutUser()" style="color:var(--danger)">🚪 Logout</div>` :
        `<div class="panel-nav-link" onclick="State.userAuthMode='login'; State.userTab='orders'; router.go('user')" style="color:var(--orange);font-weight:700">👤 Sign In / Register</div>`
      }
          </div>
          <div class="panel-content" id="user-panel-body">${this.userTab(State.userTab)}</div>
        </div>
      </div>
    `;
  },

  userTab(tab) {
    if (tab === 'orders') {
      const u = State.user;
      const userOrders = u ? State.orders.filter(o => o.phone === u.phone) : [];
      if (!userOrders.length) return '<h3>My Enquiries</h3><div style="text-align:center;padding:3rem;color:#868e96">No enquiries yet. <button class="btn btn-primary btn-sm" onclick="router.go(\'shop\')">Browse Products</button></div>';
      return `
        <h3>My Enquiries</h3>
        <table class="data-table">
          <thead><tr><th>Enquiry ID</th><th>Interested Products</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            ${userOrders.map((o, i) => `<tr>
              <td><strong>#${i + 1}</strong></td>
              <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${utils.h(o.product)}">${utils.h(o.product)}</td>
              <td>${utils.date(o.date)}</td>
              <td>${statusPill(o.status)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      `;
    }
    if (tab === 'wishlist') {
      const wishedProds = State.products.filter(p => State.wishlist.includes(p.id));
      if (!wishedProds.length) return '<h3>My Wishlist</h3><div style="text-align:center;padding:3rem;color:#868e96">No items in wishlist yet.</div>';
      return `<h3>My Wishlist</h3><div class="product-grid">${wishedProds.map(p => productCard(p)).join('')}</div>`;
    }
    if (tab === 'profile') {
      const u = State.user;
      return `
        <h3>My Profile</h3>
        <form class="contact-form" onsubmit="Pages.updateProfile(event)" style="max-width:420px">
          <div class="form-group"><label>Full Name</label><input id="up-name" value="${utils.h(u.name || '')}" required></div>
          <div class="form-group"><label>Email</label><input id="up-email" type="email" value="${utils.h(u.email || '')}" required></div>
          <div class="form-group"><label>Phone</label><input id="up-phone" type="tel" value="${utils.h(u.phone || '')}" required></div>
          <div class="form-group"><label>Address</label><textarea id="up-address" rows="3">${utils.h(u.address || '')}</textarea></div>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </form>
      `;
    }
    return '';
  },

  async loginUser(e) {
    e.preventDefault();
    const email = document.getElementById('u-email').value;
    const pass = document.getElementById('u-pass').value;
    const isLogin = State.userAuthMode === 'login';
    const btn = document.getElementById('auth-btn');

    btn.disabled = true;
    btn.textContent = isLogin ? 'Signing In...' : 'Registering Account...';

    // Block the auth listener from interfering while we handle the flow ourselves
    window._authProcessing = true;

    try {
      if (isLogin) {
        const signInCred = await window._firebaseSignIn(window._firebaseAuth, email, pass);
        const { getDoc, doc } = window._firebaseFirestore;
        const db = window._firebaseDb;

        // Fetch the existing profile instead of clearing it
        const uDoc = await getDoc(doc(db, "customers", signInCred.user.uid));

        if (uDoc.exists()) {
          State.user = uDoc.data();
        } else {
          State.user = { uid: signInCred.user.uid, email: signInCred.user.email, name: email.split('@')[0], phone: '', address: '' };
        }

        State.save();
        UI.toast('✅ Sign-in successful!');
      } else {
        const name = document.getElementById('u-name').value;
        const phone = document.getElementById('u-phone').value;
        const userCred = await window._firebaseCreateUser(window._firebaseAuth, email, pass);
        const user = userCred.user;

        const profile = {
          uid: user.uid,
          name, email, phone,
          joined: new Date().toISOString().split('T')[0]
        };

        const { doc, setDoc } = window._firebaseFirestore;
        await setDoc(doc(window._firebaseDb, "customers", user.uid), profile);
        State.user = profile;
        State.save();
        UI.toast('✅ Registration successful! Welcome.');
      }

      router.go('user');

    } catch (err) {
      console.error("Auth Exception:", err.code, err.message);
      let msg = err.message;
      if (err.code === 'auth/email-already-in-use') msg = "This email is already registered.";
      if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') msg = "Invalid email or password. Please try again.";
      if (err.code === 'auth/invalid-credential') msg = "Invalid email or password. Please try again.";
      UI.toast('❌ ' + msg, 'error');
    } finally {
      window._authProcessing = false;
      const stillHere = document.getElementById('auth-btn');
      if (stillHere) {
        stillHere.disabled = false;
        stillHere.textContent = isLogin ? 'Sign In →' : 'Register Account →';
      }
    }
  },

  logoutUser() {
    const auth = window._firebaseAuth;
    if (auth) window._firebaseSignOut(auth);

    State.user = null;
    State.cart = [];
    State.save();
    UI.updateBadges();

    localStorage.removeItem('sw_user');
    const content = document.getElementById('main-content');
    if (content) content.innerHTML = this.user();

    console.log("Customer logged out.");
  },

  async updateProfile(e) {
    e.preventDefault();
    const u = State.user;
    u.name = document.getElementById('up-name').value;
    u.email = document.getElementById('up-email').value;
    u.phone = document.getElementById('up-phone').value;
    u.address = document.getElementById('up-address').value;

    State.save();
    UI.toast('Syncing profile...');

    try {
      const { doc, updateDoc } = window._firebaseFirestore;
      const db = window._firebaseDb;
      await updateDoc(doc(db, "customers", u.uid), {
        name: u.name,
        email: u.email,
        phone: u.phone,
        address: u.address
      });
      UI.toast('✅ Profile updated and synced!');
    } catch (err) {
      console.error("Profile sync error:", err);
      UI.toast('❌ Cloud sync failed, saved locally.', 'error');
    }
  },

  // ---- ADMIN ----
  async admin() {
    const isAdminAuthed = localStorage.getItem('sw_admin_authed') === 'true';
    const auth = window._firebaseAuth;
    const db = window._firebaseDb;

    if (isAdminAuthed && auth && auth.currentUser) {
      const { getDoc, doc } = window._firebaseFirestore;
      const adminDoc = await getDoc(doc(db, "admins", auth.currentUser.uid));
      const isWhitelisted = auth.currentUser.email === 'rohinselva12@gmail.com';

      if (!adminDoc.exists() && !isWhitelisted) {
        localStorage.removeItem('sw_admin_authed');
        await window._firebaseSignOut(auth);
        UI.toast('🚫 Unauthorized: Clinical Admin access only.', 'error');
        if (window.location.hash !== '#admin-login' && window.location.hash !== '#admin') {
          router.go('home');
          return '';
        }
      }
    }

    if (!isAdminAuthed) {
      // ... same login UI ...
      return `
        <div class="container section-sm" style="max-width:440px;margin:0 auto">
          <h1 style="font-family:var(--font-display);font-size:2.5rem;margin-bottom:2rem">ADMIN ACCESS</h1>
          <div style="background:var(--white);border-radius:var(--radius);padding:2rem;box-shadow:var(--shadow)">
            <form class="contact-form" onsubmit="Pages.adminLogin(event)">
              <div class="form-group"><label>Admin Email</label><input id="admin-email" type="email" required placeholder="your@email.com"></div>
              <div class="form-group"><label>Password</label><input id="admin-pass" type="password" required placeholder="Firebase account password"></div>
              <button type="submit" class="btn btn-dark btn-full">Sign In with Firebase →</button>
            </form>
          </div>
        </div>
      `;
    }

    // Refresh data from Firestore
    try {
      await State.syncCloudData();
    } catch (err) {
      console.error("Cloud Sync Error:", err);
    }

    // Start Real-time synchronization
    State.startAdminListeners();

    const tabs = ['products', 'orders', 'customers', 'add'];
    const tabHtml = `
      <div class="container section-sm">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;flex-wrap:wrap;gap:1rem">
          <h1 style="font-family:var(--font-display);font-size:2.5rem">ADMIN PANEL <span style="font-size:.8rem;color:var(--success);vertical-align:middle">● LIVE</span></h1>
          <button class="btn btn-sm" style="background:#ffe3e3;color:#c92a2a;border:none" onclick="Pages.adminLogout()">Logout</button>
        </div>

        ${State._getAdminStatsHtml()}

        <div style="display:flex;gap:.6rem;margin-bottom:1.5rem;flex-wrap:wrap">
          ${tabs.map(t => `<button class="btn btn-sm ${State.adminTab === t ? 'btn-primary' : 'btn-outline'}" onclick="State.adminTab='${t}'; document.getElementById('admin-body').innerHTML = Pages.adminTab('${t}')">${{ products: '📦 Inventory', orders: '📋 Enquiries', customers: '👥 Customers', add: '➕ Add Product' }[t]}</button>`).join('')}
        </div>

        <div id="admin-body">${this.adminTab(State.adminTab)}</div>
      </div>
    `;
    return tabHtml;
  },

  adminTab(tab) {
    if (tab === 'products') {
      return `
        <div style="background:var(--white);border-radius:var(--radius);padding:1.5rem;box-shadow:var(--shadow-sm)">
          <div class="admin-toolbar">
            <strong>Inventory (${State.products.length} products)</strong>
            <input class="admin-search" placeholder="Search products..." oninput="Pages.adminSearchProducts(this.value)" id="admin-prod-search">
          </div>
          <div style="overflow-x:auto">
            <table class="data-table" id="admin-prod-table">
              <thead><tr><th>ID</th><th>Image</th><th>Product</th><th>Category</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>${Pages.adminProductRows(State.products)}</tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (tab === 'orders') {
      return `
        <div style="background:var(--white);border-radius:var(--radius);padding:1.5rem;box-shadow:var(--shadow-sm)">
          <div class="admin-toolbar">
            <strong>Customer Enquiries (${State.orders.length})</strong>
            <input class="admin-search" placeholder="Search enquiries..." oninput="Pages.adminSearchOrders(this.value)">
          </div>
          <div style="overflow-x:auto">
            <table class="data-table" id="admin-order-table">
              <thead><tr><th>ID</th><th>Customer</th><th>Phone</th><th>Interested Items</th><th>Date</th><th>Status</th><th>Update</th></tr></thead>
              <tbody>${Pages.adminOrderRows(State.orders)}</tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (tab === 'add') {
      return `
        <div style="background:var(--white);border-radius:var(--radius);padding:2rem;box-shadow:var(--shadow-sm);max-width:600px">
          <h3 style="margin-bottom:1.5rem">Add New Product</h3>
          <form class="contact-form" onsubmit="Pages.adminAddProduct(event)">
            <div class="form-row">
              <div class="form-group"><label>Product Name *</label><input id="np-name" required></div>
              <div class="form-group"><label>Category *</label>
                <select id="np-cat">
                  <option value="electric">Electric</option>
                  <option value="manual">Manual</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group"><label>Stock Qty *</label><input id="np-stock" type="number" required min="0"></div>
              <div class="form-group"><label>Status</label>
                <select id="np-status"><option value="instock">In Stock</option><option value="lowstock">Low Stock</option><option value="outofstock">Out of Stock</option></select>
              </div>
            </div>
            <div class="form-group"><label>Description *</label><textarea id="np-desc" rows="3" required></textarea></div>
            <div class="form-group"><label>Badge Label</label><input id="np-badge" placeholder="e.g. New Arrival, Best Seller"></div>
            <div class="form-group"><label>Image Path</label><input id="np-img" placeholder="assets/filename.png" value="assets/electric_wc.png"></div>
            <button type="submit" class="btn btn-primary">Add Product</button>
          </form>
        </div>
      `;
    }
    if (tab === 'customers') {
      return `
        <div style="background:var(--white);border-radius:var(--radius);padding:1.5rem;box-shadow:var(--shadow-sm)">
          <div class="admin-toolbar">
            <strong>Customer Accounts (${State.registeredUsers.length})</strong>
            <input class="admin-search" placeholder="Search customers by name or email..." oninput="Pages.adminSearchCustomers(this.value)" id="admin-cust-search">
          </div>
          <div style="overflow-x:auto">
            <table class="data-table" id="admin-cust-table">
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined Date</th><th>UID</th></tr></thead>
              <tbody>${Pages.adminCustomerRows(State.registeredUsers)}</tbody>
            </table>
          </div>
        </div>
      `;
    }
    return '';
  },

  adminProductRows(products) {
    if (!products || !Array.isArray(products) || products.length === 0) {
      return '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--gray-500)">No products in inventory yet. Click "Add Product" to start.</td></tr>';
    }
    return products.map(p => `
      <tr id="prow-${p.id}">
        <td><strong>#${p.id}</strong></td>
        <td><img src="${p.image}" style="width:44px;height:44px;object-fit:contain;background:var(--gray-100);border-radius:6px;padding:2px"></td>
        <td><strong>${utils.h(p.name)}</strong></td>
        <td><span style="font-size:.75rem;text-transform:capitalize">${utils.h(p.category)}</span></td>
        <td><input type="number" value="${p.stock}" min="0" style="width:60px;padding:4px 6px;border:1px solid var(--gray-200);border-radius:4px;font-size:.85rem" onchange="Pages.adminUpdateStock(${p.id}, this.value)"></td>
        <td>
          <select style="font-size:.75rem;padding:4px;border:1px solid var(--gray-200);border-radius:4px" onchange="Pages.adminUpdateStatus(${p.id}, this.value)">
            <option value="instock" ${p.status === 'instock' ? 'selected' : ''}>In Stock</option>
            <option value="lowstock" ${p.status === 'lowstock' ? 'selected' : ''}>Low Stock</option>
            <option value="outofstock" ${p.status === 'outofstock' ? 'selected' : ''}>Out of Stock</option>
          </select>
        </td>
        <td>
          <button class="action-btn action-btn-del" onclick="Pages.adminDeleteProduct(${p.id})">Delete</button>
        </td>
      </tr>
    `).join('');
  },

  adminOrderRows(orders) {
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--gray-500)">No customer enquiries received yet.</td></tr>';
    }
    return orders.map((o, i) => `
      <tr>
        <td><strong>#${i + 1}</strong></td>
        <td>${utils.h(o.customer)}</td>
        <td><a href="tel:${o.phone}" style="color:var(--orange)">${utils.h(o.phone)}</a></td>
        <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${utils.h(o.product)}">${utils.h(o.product)}</td>
        <td>${utils.date(o.date)}</td>
        <td>${statusPill(o.status)}</td>
        <td>
          <select style="font-size:.75rem;padding:4px;border:1px solid var(--gray-200);border-radius:4px" onchange="Pages.adminUpdateOrderStatus('${o.id}', this.value)">
            <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="contacted" ${o.status === 'contacted' ? 'selected' : ''}>Contacted</option>
            <option value="assessed" ${o.status === 'assessed' ? 'selected' : ''}>Assessed</option>
            <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Completed</option>
            <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
      </tr>
    `).join('');
  },

  adminCustomerRows(users) {
    if (!users || !Array.isArray(users) || users.length === 0) {
      return '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--gray-500)">No customers have registered yet.</td></tr>';
    }
    return users.map(u => `
      <tr>
        <td><strong>${utils.h(u.name)}</strong></td>
        <td>${utils.h(u.email)}</td>
        <td><a href="tel:${u.phone}" style="color:var(--orange)">${utils.h(u.phone)}</a></td>
        <td>${utils.date(u.joined)}</td>
        <td style="font-size:.7rem;color:var(--gray-400);font-family:monospace">${utils.h(u.uid || 'manual-entry')}</td>
      </tr>
    `).join('');
  },


  async adminUpdateStock(id, val) {
    const p = State.getProduct(id);
    if (!p) return;

    p.stock = parseInt(val);
    if (p.stock === 0) p.status = 'outofstock';

    State.save();
    UI.toast('Syncing Stock...');

    await utils.safe(async () => {
      const { doc, updateDoc } = window._firebaseFirestore;
      const db = window._firebaseDb;
      if (p.uid) {
        await updateDoc(doc(db, "products", p.uid), {
          stock: p.stock,
          status: p.status,
          "specs.Stock": String(p.stock)
        });
        UI.toast('✅ Stock Cloud Synced');
      }
    }, 'Stock Sync Failed');
  },

  async adminUpdateStatus(id, val) {
    const p = State.getProduct(id);
    if (!p) return;

    p.status = val;
    State.save();
    UI.toast('Syncing Status...');

    await utils.safe(async () => {
      const { doc, updateDoc } = window._firebaseFirestore;
      const db = window._firebaseDb;
      if (p.uid) {
        await updateDoc(doc(db, "products", p.uid), { status: val });
        UI.toast('✅ Status Cloud Synced');
      }
    }, 'Status Sync Failed');
  },

  async adminUpdateOrderStatus(orderId, val) {
    const o = State.orders.find(o => o.id === orderId);
    if (o) {
      o.status = val;
      State.save();
      UI.toast('Cloud Syncing...');

      try {
        const { doc, updateDoc } = window._firebaseFirestore;
        const db = window._firebaseDb;
        await updateDoc(doc(db, "enquiries", orderId), { status: val });
        UI.toast('✅ Cloud Status Updated');
      } catch (err) {
        console.error("Cloud Update Error:", err);
        UI.toast('❌ Cloud update failed', 'error');
      }
    }
  },

  adminEditPrice(id) {
    const p = State.getProduct(id);
    if (!p) return;
    UI.openModal(`
      <h3 style="margin-bottom:1.5rem">Edit Price: ${utils.h(p.name)}</h3>
      <form class="contact-form" onsubmit="Pages.adminSavePrice(event, ${id})">
        <div class="form-group"><label>Current Price (INR)</label><input id="ep-price" type="number" value="${p.price}" required></div>
        <div class="form-group"><label>MRP / Original Price (INR)</label><input id="ep-mrp" type="number" value="${p.mrp || p.price}"></div>
        <div class="form-row" style="margin-top:.5rem">
          <button type="submit" class="btn btn-primary">Update Cloud Price</button>
          <button type="button" class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
        </div>
      </form>
    `);
  },

  async adminSavePrice(e, id) {
    e.preventDefault();
    const p = State.getProduct(id);
    if (!p) return;

    const newPrice = parseInt(document.getElementById('ep-price').value);
    const newMrp = parseInt(document.getElementById('ep-mrp').value);

    // Optimistic Update
    p.price = newPrice;
    p.mrp = newMrp;
    State.save();
    UI.closeModal();
    UI.toast('Syncing Price...');

    await utils.safe(async () => {
      const { doc, updateDoc } = window._firebaseFirestore;
      const db = window._firebaseDb;
      if (p.uid) {
        await updateDoc(doc(db, "products", p.uid), {
          price: newPrice,
          mrp: newMrp
        });
        UI.toast('✅ Price Synced to Cloud');
      }
    }, 'Price Sync Failed');
  },

  adminDeleteProduct(id) {
    const p = State.getProduct(id);
    if (!p) return;
    UI.openModal(`
      <div style="text-align:center;padding:1rem">
        <div style="font-size:3rem;margin-bottom:1rem">🗑</div>
        <h3 style="margin-bottom:1rem">Delete Product?</h3>
        <p style="color:#868e96;margin-bottom:2rem">Are you sure you want to delete <strong>${p.name}</strong>?<br>This action cannot be undone locally.</p>
        <div style="display:flex;gap:1rem;justify-content:center">
          <button class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button class="btn btn-primary" style="background:#e03131;border-color:#e03131" onclick="Pages.executeDelete(${id})">Delete Product</button>
        </div>
      </div>
    `);
  },

  async executeDelete(id) {
    const p = State.getProduct(id);
    if (!p) return;

    UI.closeModal();
    UI.toast('Cloud Deleting...');

    await utils.safe(async () => {
      const { doc, deleteDoc } = window._firebaseFirestore;
      const db = window._firebaseDb;

      if (p.uid) {
        await deleteDoc(doc(db, "products", p.uid));
        // We don't filter locally; the onSnapshot will handle the UI update automatically
        UI.toast('✅ Permanent Deletion Successful');
      }
    }, 'Cloud Deletion Failed');
  },

  async adminAddProduct(e) {
    e.preventDefault();
    UI.toast('Adding to Cloud...');

    const stock = parseInt(document.getElementById('np-stock').value);
    const newId = State.products.length > 0 ? Math.max(...State.products.map(p => p.id)) + 1 : 1;

    const productData = {
      id: newId,
      name: document.getElementById('np-name').value,
      category: document.getElementById('np-cat').value,
      price: 0,
      mrp: 0,
      stock,
      status: document.getElementById('np-status').value,
      desc: document.getElementById('np-desc').value,
      badge: document.getElementById('np-badge').value || 'New',
      image: document.getElementById('np-img').value || 'assets/electric_wc.png',
      features: ['Custom built', 'Quality assured'],
      specs: { 'Category': document.getElementById('np-cat').value, 'Stock': String(stock) }
    };

    await utils.safe(async () => {
      const { collection, addDoc } = window._firebaseFirestore;
      const db = window._firebaseDb;
      await addDoc(collection(db, "products"), productData);

      UI.toast('✅ Product Added Permanently');
      State.adminTab = 'products';
      document.getElementById('admin-body').innerHTML = this.adminTab('products');
    }, 'Product Addition Failed');
  },

  adminSearchProducts(q) {
    const filtered = q ? State.products.filter(p => p.name.toLowerCase().includes(q.toLowerCase())) : State.products;
    document.querySelector('#admin-prod-table tbody').innerHTML = Pages.adminProductRows(filtered);
  },

  adminSearchOrders(q) {
    const filtered = q ? State.orders.filter(o => o.customer.toLowerCase().includes(q.toLowerCase()) || o.id.includes(q)) : State.orders;
    document.querySelector('#admin-order-table tbody').innerHTML = Pages.adminOrderRows(filtered);
  },

  adminSearchCustomers(q) {
    const filtered = q ? State.registeredUsers.filter(u => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())) : State.registeredUsers;
    document.querySelector('#admin-cust-table tbody').innerHTML = Pages.adminCustomerRows(filtered);
  },

  async adminLogin(e) {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-pass').value;
    const auth = window._firebaseAuth;
    const db = window._firebaseDb;

    if (!auth || !db) {
      UI.toast('⚠ Firebase not connected yet.', 'error');
      return;
    }

    try {
      const userCred = await window._firebaseSignIn(auth, email, pass);
      const user = userCred.user;

      // Role Check logic
      const { getDoc, doc } = window._firebaseFirestore;
      const adminDoc = await getDoc(doc(db, "admins", user.uid));

      const isWhitelisted = email === 'rohinselva12@gmail.com';

      if (adminDoc.exists() || isWhitelisted) {
        localStorage.setItem('sw_admin_authed', 'true');
        UI.toast('✅ Welcome, Admin!');
        router.go('admin');
      } else {
        await window._firebaseSignOut(auth);
        localStorage.removeItem('sw_admin_authed');
        UI.toast('🚫 Access Denied: Unauthorized account.', 'error');
        UI.openModal(`
          <div style="text-align:center;padding:1rem">
            <h3 style="color:var(--danger);margin-bottom:1rem">Access Denied</h3>
            <p>You do not have permission to access this area</p>
            <button class="btn btn-primary" style="margin-top:1.5rem" onclick="UI.closeModal(); router.go('home')">Back to Home</button>
          </div>
        `);
      }
    } catch (err) {
      console.error(err);
      UI.toast('❌ Login Failed: ' + err.message, 'error');
    }
  },

  adminLogout() {
    const auth = window._firebaseAuth;
    if (auth) window._firebaseSignOut(auth);
    localStorage.removeItem('sw_admin_authed');
    State.stopAdminListeners(); // Clear real-time sync

    // Purge administrative session data from memory
    State.orders = [];
    State.registeredUsers = [];

    window._is_secret_route = false;
    window.location.hash = 'home';
    router.go('home');
    UI.toast('Admin logged out.');
  },


  // ---- ABOUT ----
  about() {
    return `
      <div class="about-hero">
        <div class="container about-hero-inner">
          <div>
            <h1>EMPOWERING <span>INDEPENDENCE</span><br>SINCE 2015</h1>
            <p style="margin-top:1.2rem">Shadow Wheelchairs & Seating was founded by Johnson, a passionate occupational therapist and mobility specialist based in Chennai. Our mission is simple: to provide every customer with the exact mobility solution their body and lifestyle demands — no compromises, no off-the-shelf limits.</p>
            <p style="margin-top:1rem">We work with customers, caregivers, hospitals, and physiotherapists across India to deliver customised wheelchairs, postural seating, and hospice care equipment — with genuine compassion at every step.</p>
            <div style="display:flex;gap:1rem;margin-top:2rem;flex-wrap:wrap">
              <button class="btn btn-primary" onclick="router.go('contact')">Get in Touch</button>
              <button class="btn btn-outline" style="border-color:rgba(255,255,255,.3);color:#fff" onclick="router.go('shop')">Browse Products</button>
            </div>
          </div>
          <div class="about-img" style="background:rgba(255,255,255,.06);padding:2rem;border-radius:var(--radius-lg)">
            <img src="assets/electric_wc.png" alt="Shadow Wheelchairs">
          </div>
        </div>
      </div>

      <section class="section">
        <div class="container">
          <div class="section-title"><h2>OUR CORE VALUES</h2><span class="accent-line"></span></div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:2rem">
            ${[
        { icon: '🎯', t: 'Customer First', d: 'Every decision, every recommendation, every design is guided by what\'s best for the customer.' },
        { icon: '🔬', t: 'Evidence Based', d: 'Our recommendations are grounded in clinical expertise and therapist-led assessment.' },
        { icon: '🤝', t: 'Compassionate Service', d: 'We understand the emotional weight of mobility challenges. We serve with empathy.' },
        { icon: '⚙', t: 'Custom Excellence', d: 'We don\'t believe in generic solutions. We fabricate chairs that fit your body.' }
      ].map(v => `
              <div style="background:var(--white);border-radius:var(--radius);padding:1.8rem;box-shadow:var(--shadow-sm);border-top:4px solid var(--orange)">
                <div style="font-size:2rem;margin-bottom:1rem">${v.icon}</div>
                <h4 style="font-size:1rem;font-weight:900;margin-bottom:8px">${v.t}</h4>
                <p style="font-size:.88rem;color:#868e96;line-height:1.7">${v.d}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  },

  // ---- CONTACT ----
  contact() {
    const u = State.user || {};
    return `
      <div class="container section-sm">
        <div class="section-title"><h2>CONTACT US</h2><span class="accent-line"></span><p>Reach out with any questions or to book a free consultation</p></div>
        <div class="contact-grid">
          <div class="contact-info-box">
            <h3>Get In Touch</h3>
            <div class="contact-item"><div class="ci-icon">📍</div><div><h5>Address</h5><p>36, Professor Sanjeevi St,<br>Karneeswarapuram, Mylapore,<br>Chennai, Tamil Nadu 600004</p></div></div>
            <div class="contact-item"><div class="ci-icon">📞</div><div><h5>Phone</h5><a href="tel:+919445610803">+91 94456 10803</a></div></div>
            <div class="contact-item"><div class="ci-icon">✉</div><div><h5>Email</h5><a href="mailto:johnson.shadowwheelchairs@outlook.com">johnson.shadowwheelchairs@outlook.com</a></div></div>
            <div class="contact-item"><div class="ci-icon">🕐</div><div><h5>Working Hours</h5><p>Mon–Sat: 10:30 AM – 5:00 PM<br>Sunday: By Appointment</p></div></div>
            <div style="margin-top:2rem">
              <h5 style="color:var(--orange);font-size:.8rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:.8rem">We Service</h5>
              <p style="font-size:.85rem;line-height:1.7">Chennai & Across India</p>
            </div>
          </div>
          <div>
            <h3 style="font-size:1.1rem;font-weight:900;margin-bottom:1.5rem">Send Us a Message</h3>
            <form class="contact-form" onsubmit="Pages.submitContact(event)">
              <div class="form-row">
                <div class="form-group"><label>Your Name *</label><input id="c-name" required placeholder="Full name" value="${u.name || ''}"></div>
                <div class="form-group"><label>Phone Number *</label><input id="c-phone" required placeholder="+91 XXXXX" value="${u.phone || ''}"></div>
              </div>
              <div class="form-group"><label>Email Address</label><input id="c-email" type="email" placeholder="Optional" value="${u.email || ''}"></div>
              <div class="form-group"><label>Subject *</label>
                <select id="c-subj">
                  <option>Product Enquiry</option>
                  <option>Custom Wheelchair Assessment</option>
                  <option>Other</option>
                </select>
              </div>
              <div class="form-group"><label>Message *</label><textarea id="c-msg" rows="5" required placeholder="Tell us about your needs, mobility difficulty, or any questions..."></textarea></div>
              <button type="submit" class="btn btn-primary">Send Message →</button>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  submitContact(e) {
    e.preventDefault();
    UI.toast('✅ Message sent! We\'ll contact you within 24 hours.');
    e.target.reset();
  }
};

// ===================== STATUS PILL HELPER =====================
function statusPill(status) {
  const map = {
    pending: ['pill-orange', 'Pending'],
    processing: ['pill-blue', 'Processing'],
    shipped: ['pill-blue', 'Shipped'],
    delivered: ['pill-green', 'Delivered'],
    cancelled: ['pill-red', 'Cancelled']
  };
  const [cls, label] = map[status] || ['pill-gray', status];
  return `<span class="status-pill ${cls}">${label}</span>`;
}

// ===================== ROUTER =====================
const router = {
  async go(page, ...args) {
    // SECURITY GUARD: Only block home-redirect if admin is still authed or secret flag is intentionally set
    const currentHash = window.location.hash.substring(1);
    const isAdminAuthed = localStorage.getItem('sw_admin_authed') === 'true';
    if (page === 'home' && isAdminAuthed && (currentHash === 'admin-login' || currentHash === 'admin' || window._is_secret_route)) {
      return;
    }

    UI.toggleMenu(false);
    clearInterval(State.heroTimer);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const content = document.getElementById('main-content');

    // Restore opacity if it was dimmed by the high-priority filter
    if (window._is_secret_route) document.body.style.opacity = '1';

    // Reset ALL nav links first (fixes persistent 'Home' highlight)
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));

    // Clear content immediately for secret routes to prevent overlap
    if (page === 'admin' || page === 'admin-login') {
      content.innerHTML = '<div class="container section-sm" style="text-align:center;padding:100px 20px;"><div class="spinner"></div><p style="margin-top:1rem;color:var(--gray-500)">Accessing Secure Clinical Portal...</p></div>';
    }

    UI.setActive(page);

    try {
      if (page === 'home') {
        content.innerHTML = Pages.home();
        Hero.start();
      } else if (page === 'shop') {
        content.innerHTML = Pages.shop(State.shopFilter);
      } else if (page === 'about') {
        content.innerHTML = Pages.about();
      } else if (page === 'contact') {
        content.innerHTML = Pages.contact();
      } else if (page === 'user') {
        content.innerHTML = Pages.user();
      } else if (page === 'admin' || page === 'admin-login') {
        const html = await Pages.admin();
        if (html) content.innerHTML = html;
      } else if (page === 'checkout') {
        content.innerHTML = Pages.checkout();
      } else {
        content.innerHTML = '<div class="container section-sm"><h2>Page not found</h2></div>';
      }
    } catch (err) {
      console.error("Routing Error:", err);
      content.innerHTML = `<div class="container section-sm"><h2>Error loading page</h2><p>${err.message}</p></div>`;
    }

    // Render footer
    document.getElementById('site-footer').innerHTML = renderFooter();
  },

  goShop(cat) {
    State.shopFilter = cat;
    UI.toggleMenu(false);
    this.go('shop');
  },

  goProduct(id) {
    clearInterval(State.heroTimer);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    UI.toggleMenu(false);
    document.getElementById('main-content').innerHTML = Pages.product(id);
    document.getElementById('site-footer').innerHTML = renderFooter();
  }
};

// ===================== FOOTER =====================
function renderFooter() {
  return `
    <div class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="footer-logo-wrap">
              <div class="logo-img-wrap">
                <img src="assets/logo.png" alt="Shadow Wheelchairs" class="main-logo">
              </div>
              <div class="logo-text">
                <span class="logo-main">SHADOW</span>
                <span class="logo-sub">WHEELCHAIRS & SEATING</span>
              </div>
            </div>
            <p>Empowering mobility and enriching lives across India, one customer at a time.</p>
          </div>
          <div class="footer-col">
            <h5>Products</h5>
            <ul>
              <li><a href="#" onclick="router.goShop('electric')">Electric Wheelchairs</a></li>
              <li><a href="#" onclick="router.goShop('manual')">Manual Wheelchairs</a></li>
              <li><a href="#" onclick="router.goShop('custom')">Custom Seating</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h5>Company</h5>
            <ul>
              <li><a href="#" onclick="router.go('about')">About Us</a></li>
              <li><a href="#" onclick="router.go('contact')">Contact Us</a></li>
              <li><a href="#" onclick="router.go('user')">My Account</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h5>Contact</h5>
            <ul>
              <li><a href="tel:+919445610803">📞 +91 94456 10803</a></li>
              <li><a href="mailto:johnson.shadowwheelchairs@outlook.com">✉ johnson.shadowwheelchairs@outlook.com</a></li>
              <li><a href="#">📍 36, Professor Sanjeevi St, Mylapore, Chennai – 600004</a></li>
              <li style="color:#868e96;font-size:.82rem;margin-top:.5rem">Mon–Sat: 10:30 AM – 5:00 PM</li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 Shadow Wheelchairs & Seating. All Rights Reserved.</span>
          <span style="color:#868e96">Made with ❤ for patient care in India</span>
        </div>
      </div>
    </div>
  `;
}

// Init function to handle routing
const initApp = () => {
  UI.updateBadges();
  UI.renderCartDrawer();

  // Start listening for login/logout changes
  initAuthListener();

  const handleRoute = () => {
    const hash = window.location.hash.substring(1) || 'home';
    // Deep block home if we have a secret flag from index.html
    if ((hash === 'home' || !hash) && window._is_secret_route) return;
    router.go(hash);
  };

  window.addEventListener('hashchange', handleRoute);

  // Initial route
  handleRoute();
};

document.addEventListener('DOMContentLoaded', initApp);

// Expose to window for HTML event handlers (since app.js is now a Module)
window.DB = DB;
window.State = State;
window.Cart = Cart;
window.Wishlist = Wishlist;
window.Search = Search;
window.UI = UI;
window.Hero = Hero;
window.Pages = Pages;
window.router = router;
window.statusPill = statusPill;
window.renderFooter = renderFooter;
