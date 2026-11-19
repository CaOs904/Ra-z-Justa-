// ==========================================
// DATOS DE EJEMPLO Y ESTADO COMPARTIDO
// ==========================================

const DRIVER_PHOTO_SVG = `
  <svg viewBox="0 0 80 80" width="64" height="64" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" fill="#d7ccc8"/>
    <circle cx="40" cy="30" r="15" fill="#8d6e63"/>
    <path d="M16 74 C16 54, 64 54, 64 74 Z" fill="#2e7d32"/>
    <path d="M25 22 Q40 10 55 22 Z" fill="#1b4d2e"/>
    <rect x="23" y="20" width="34" height="4" rx="2" fill="#1b4d2e"/>
  </svg>
`;

const state = {
  currentProfile: null, // 'farmer' | 'driver'
  activeTab: "orders",  // farmer: 'orders' | 'wallet' | 'detail' ; driver: 'route' | 'wallet'
  selectedOrderId: null,

  farmer: {
    name: "Hernando Rojas",
    location: "Vereda San Miguel, Sibaté, Cundinamarca",
    farmName: "Finca El Mirador",
    balance: 285000,
    bankAccount: "Bancolombia Ahorros •••• 4821",
    history: [
      { id: "TX-101", title: "Pago pedido #RJ-392", date: "Ayer, 4:15 p. m.", amount: 94000, type: "in" },
      { id: "TX-100", title: "Pago pedido #RJ-388", date: "17 Nov, 11:30 a. m.", amount: 112000, type: "in" },
      { id: "TX-099", title: "Retiro a cuenta bancaria", date: "15 Nov, 6:00 p. m.", amount: -150000, type: "out" }
    ]
  },

  driver: {
    name: "Carlos Pérez",
    vehicle: "Pickup blanca",
    plate: "ABC123",
    eta: "Hoy, 2:30 p. m.",
    balance: 145000,
    bankAccount: "Nequi / Daviplata •••• 7734",
    history: [
      { id: "DT-201", title: "Ruta Sur-Centro (4 entregas)", date: "Ayer, 5:40 p. m.", amount: 52000, type: "in" },
      { id: "DT-200", title: "Retiro a cuenta bancaria", date: "16 Nov, 8:10 p. m.", amount: -100000, type: "out" }
    ]
  },

  // 2 pedidos entrantes para Hernando Rojas
  orders: [
    {
      id: "RJ-401",
      customer: "Familia Morales",
      address: "Cra 68 # 24B-15, Apto 402 · Bogotá",
      status: "Pendiente", // Pendiente -> Pedido confirmado -> Enviado por el campesino -> Recogido -> En camino -> Entregado
      total: 68500,
      photoSent: false,
      items: [
        { name: "Papa sabanera lavada", qty: "10 kg", price: 24000 },
        { name: "Fresa fresca de Sibaté", qty: "2 kg", price: 18500 },
        { name: "Zanahoria orgánica", qty: "3 kg", price: 9000 },
        { name: "Huevos criollos AA", qty: "1 cubeta (30 uds)", price: 17000 }
      ]
    },
    {
      id: "RJ-402",
      customer: "Familia Castro",
      address: "Calle 127 # 18-40, Casa 6 · Bogotá",
      status: "Pendiente",
      total: 54000,
      photoSent: false,
      items: [
        { name: "Arveja verde desgranada", qty: "2 kg", price: 18000 },
        { name: "Papa criolla", qty: "4 kg", price: 16000 },
        { name: "Queso campesino fresco", qty: "2 bloques (500 g)", price: 20000 }
      ]
    }
  ],

  // Ruta asignada para Carlos Pérez (1 finca + 4 hogares)
  route: {
    id: "RUTA-08",
    status: "assigned", // assigned | accepted | rejected
    farmsCount: 1,
    homesCount: 4,
    totalPay: 52000,
    payPerDelivery: 13000,
    pickedUp: false,
    farmStop: {
      farm: "Finca El Mirador (Hernando Rojas)",
      address: "Vereda San Miguel, Km 4 vía Sibaté, Cundinamarca",
      packages: "4 canastillas selladas (Pedidos #RJ-401 al #RJ-404)"
    },
    deliveries: [
      {
        stopNumber: 1,
        orderId: "RJ-401",
        family: "Familia Morales",
        address: "Cra 68 # 24B-15, Apto 402 · Ciudad Salitre",
        pay: 13000,
        status: "Pedido confirmado",
        receiptCode: "COMP-8841"
      },
      {
        stopNumber: 2,
        orderId: "RJ-402",
        family: "Familia Castro",
        address: "Calle 127 # 18-40, Casa 6 · Bella Suiza",
        pay: 13000,
        status: "Pedido confirmado",
        receiptCode: "COMP-8842"
      },
      {
        stopNumber: 3,
        orderId: "RJ-403",
        family: "Familia Gómez",
        address: "Cra 15 # 93-22, Apto 601 · Chicó Norte",
        pay: 13000,
        status: "Enviado por el campesino",
        receiptCode: "COMP-8843"
      },
      {
        stopNumber: 4,
        orderId: "RJ-404",
        family: "Familia Rodríguez",
        address: "Calle 53 # 27-19, Apto 204 · Galerías",
        pay: 13000,
        status: "Enviado por el campesino",
        receiptCode: "COMP-8844"
      }
    ]
  }
};

// ==========================================
// UTILIDADES
// ==========================================

function formatCOP(value) {
  const abs = Math.abs(value).toLocaleString("es-CO");
  return value < 0 ? `-$${abs}` : `$${abs}`;
}

function getStatusClass(status) {
  const map = {
    "Pendiente": "st-pendiente",
    "Pedido confirmado": "st-confirmado",
    "Enviado por el campesino": "st-enviado",
    "Recogido": "st-recogido",
    "En camino": "st-camino",
    "Entregado": "st-entregado"
  };
  return map[status] || "st-pendiente";
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2800);
}

// ==========================================
// NAVEGACIÓN PRINCIPAL
// ==========================================

function selectProfile(profile) {
  state.currentProfile = profile;
  state.activeTab = profile === "farmer" ? "orders" : "route";

  document.getElementById("welcome-screen").classList.add("hidden");
  document.getElementById("app-shell").classList.remove("hidden");

  if (profile === "farmer") {
    document.getElementById("header-avatar").textContent = "👨‍🌾";
    document.getElementById("header-name").textContent = state.farmer.name;
    document.getElementById("header-sub").textContent = "Sibaté, Cundinamarca";
  } else {
    document.getElementById("header-avatar").textContent = "🛻";
    document.getElementById("header-name").textContent = state.driver.name;
    document.getElementById("header-sub").textContent = `${state.driver.vehicle} · ${state.driver.plate}`;
  }

  renderBottomNav();
  renderCurrentView();
}

function goHome() {
  document.getElementById("app-shell").classList.add("hidden");
  document.getElementById("welcome-screen").classList.remove("hidden");
}

function switchTab(tab) {
  state.activeTab = tab;
  renderBottomNav();
  renderCurrentView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderBottomNav() {
  const nav = document.getElementById("bottom-nav");
  if (state.currentProfile === "farmer") {
    nav.innerHTML = `
      <button class="nav-btn ${state.activeTab !== "wallet" ? "active" : ""}" onclick="switchTab('orders')">
        <span class="nav-ico">🧺</span>
        <span>Pedidos</span>
      </button>
      <button class="nav-btn ${state.activeTab === "wallet" ? "active" : ""}" onclick="switchTab('wallet')">
        <span class="nav-ico">💰</span>
        <span>Mi saldo</span>
      </button>
    `;
  } else {
    nav.innerHTML = `
      <button class="nav-btn ${state.activeTab !== "wallet" ? "active" : ""}" onclick="switchTab('route')">
        <span class="nav-ico">🗺️</span>
        <span>Mi ruta</span>
      </button>
      <button class="nav-btn ${state.activeTab === "wallet" ? "active" : ""}" onclick="switchTab('wallet')">
        <span class="nav-ico">💰</span>
        <span>Mi saldo</span>
      </button>
    `;
  }
}

function renderCurrentView() {
  if (state.currentProfile === "farmer") {
    if (state.activeTab === "orders") renderFarmerOrders();
    else if (state.activeTab === "detail") renderFarmerOrderDetail();
    else renderWallet("farmer");
  } else {
    if (state.activeTab === "route") renderDriverRoute();
    else renderWallet("driver");
  }
}

// ==========================================
// VISTAS DEL CAMPESINO (HERNANDO ROJAS)
// ==========================================

function renderFarmerOrders() {
  const container = document.getElementById("main-content");
  const ordersHtml = state.orders.map((order) => {
    const isPending = order.status === "Pendiente";
    const itemsHtml = order.items
      .map((i) => `<li><span>${i.name} (${i.qty})</span><strong>${formatCOP(i.price)}</strong></li>`)
      .join("");

    return `
      <article class="card">
        <div class="stop-header">
          <div>
            <strong>Pedido #${order.id}</strong>
            <div style="font-size:0.84rem; color:var(--muted);">${order.customer}</div>
          </div>
          <span class="status-pill ${getStatusClass(order.status)}">${order.status}</span>
        </div>

        <ul class="item-list">${itemsHtml}</ul>

        <div class="price-row">
          <span style="font-size:0.86rem; color:var(--muted);">Valor para ti:</span>
          <span class="price-big">${formatCOP(order.total)}</span>
        </div>

        ${
          isPending
            ? `<button class="btn btn-primary" onclick="acceptFarmerOrder('${order.id}')">✓ Aceptar pedido</button>`
            : `<button class="btn btn-earth" onclick="openFarmerOrderDetail('${order.id}')">Ver detalle y recogida ›</button>`
        }
      </article>
    `;
  }).join("");

  container.innerHTML = `
    <div class="section-title">
      <span>Pedidos entrantes (${state.orders.length})</span>
      <span style="font-size:0.78rem; color:var(--green-main);">Finca El Mirador</span>
    </div>
    ${ordersHtml}
  `;
}

function acceptFarmerOrder(orderId) {
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return;

  order.status = "Pedido confirmado";
  syncOrderStatusToDriver(orderId, "Pedido confirmado");
  showToast(`Pedido #${orderId} confirmado. Ya puedes alistarlo.`);
  openFarmerOrderDetail(orderId);
}

function openFarmerOrderDetail(orderId) {
  state.selectedOrderId = orderId;
  state.activeTab = "detail";
  renderCurrentView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderFarmerOrderDetail() {
  const container = document.getElementById("main-content");
  const order = state.orders.find((o) => o.id === state.selectedOrderId);
  if (!order) return renderFarmerOrders();

  const itemsHtml = order.items
    .map((i) => `<li><span>${i.name} · ${i.qty}</span><strong>${formatCOP(i.price)}</strong></li>`)
    .join("");

  const canMarkSent = order.status === "Pedido confirmado";

  container.innerHTML = `
    <button class="back-link" onclick="switchTab('orders')">← Volver a pedidos</button>

    <div class="card">
      <div class="stop-header">
        <div>
          <h3>Pedido #${order.id}</h3>
          <p style="font-size:0.84rem; color:var(--muted);">${order.customer}</p>
        </div>
        <span class="status-pill ${getStatusClass(order.status)}">${order.status}</span>
      </div>

      <ul class="item-list">${itemsHtml}</ul>

      <div class="price-row">
        <strong>Total cosecha</strong>
        <span class="price-big">${formatCOP(order.total)}</span>
      </div>
    </div>

    <div class="card">
      <h3 style="font-size:1rem; color:var(--earth-dark);">Transportista asignado</h3>
      <div class="driver-box">
        <div class="driver-photo">${DRIVER_PHOTO_SVG}</div>
        <div>
          <strong style="font-size:1.02rem;">${state.driver.name}</strong>
          <div style="font-size:0.86rem; color:var(--earth-dark); margin-top:2px;">
            🛻 ${state.driver.vehicle}
          </div>
          <span class="plate-tag">${state.driver.plate}</span>
          <div style="font-size:0.82rem; color:var(--muted); margin-top:6px;">
            🕒 Hora estimada de recogida: <strong>${state.driver.eta}</strong>
          </div>
        </div>
      </div>

      ${
        canMarkSent
          ? `<button class="btn btn-primary" onclick="openFarmerPhotoModal('${order.id}')">
               📸 Marcar mercado enviado
             </button>`
          : `<div class="responsibility-banner" style="margin-top:12px; margin-bottom:0;">
               ✓ Estado actual: <strong>${order.status}</strong>
               ${order.photoSent ? " · Foto de canastilla registrada." : ""}
             </div>`
      }
    </div>
  `;
}

function openFarmerPhotoModal(orderId) {
  openModal(`
    <h3 style="color:var(--earth-dark);">Confirmar despacho del mercado</h3>
    <p style="font-size:0.88rem; color:var(--muted); margin-top:6px;">
      Foto simulada de las canastillas listas para entregar a ${state.driver.name}.
    </p>
    <div class="photo-preview">
      <div style="font-size:3rem;">🧺🥔🍓🥕</div>
      <strong style="display:block; margin-top:8px; color:var(--green-dark);">Foto capturada · Pedido #${orderId}</strong>
      <span style="font-size:0.8rem; color:var(--muted);">Finca El Mirador, Sibaté · Verificada</span>
    </div>
    <button class="btn btn-primary" onclick="confirmFarmerSent('${orderId}')">
      ✓ Confirmar "Mercado enviado"
    </button>
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
  `);
}

function confirmFarmerSent(orderId) {
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return;

  order.status = "Enviado por el campesino";
  order.photoSent = true;
  syncOrderStatusToDriver(orderId, "Enviado por el campesino");

  closeModal();
  showToast(`Pedido #${orderId} marcado como Enviado por el campesino.`);
  renderFarmerOrderDetail();
}

// ==========================================
// VISTAS DEL TRANSPORTISTA (CARLOS PÉREZ)
// ==========================================

function renderDriverRoute() {
  const container = document.getElementById("main-content");
  const route = state.route;

  // Caso 1: Ruta rechazada
  if (route.status === "rejected") {
    container.innerHTML = `
      <div class="card" style="text-align:center; padding:28px 18px;">
        <div style="font-size:2.8rem; margin-bottom:10px;">🛣️</div>
        <h3>Ruta rechazada</h3>
        <p style="font-size:0.9rem; color:var(--muted); margin-top:8px;">
          No tienes rutas activas en este momento. Cuando haya una nueva ruta rural disponible aparecerá aquí.
        </p>
        <button class="btn btn-primary" onclick="restoreRouteDemo()">
          🔄 Simular nueva ruta asignada
        </button>
      </div>
    `;
    return;
  }

  // Caso 2: Ruta asignada pendiente de aceptar/rechazar
  if (route.status === "assigned") {
    container.innerHTML = `
      <div class="section-title"><span>Ruta asignada hoy</span></div>

      <div class="card card-earth">
        <span class="status-pill" style="background:rgba(255,255,255,0.2); color:#fff;">
          ● Nueva ruta #${route.id}
        </span>
        <div class="balance-amount">${formatCOP(route.totalPay)}</div>
        <p style="font-size:0.88rem; opacity:0.9;">Remuneración total por completar la ruta</p>
      </div>

      <div class="card">
        <h3 style="font-size:1rem; margin-bottom:10px; color:var(--earth-dark);">Resumen de la ruta</h3>
        <ul class="item-list">
          <li><span>🌾 Fincas de recogida</span><strong>${route.farmsCount} finca (Sibaté)</strong></li>
          <li><span>🏠 Hogares de entrega</span><strong>${route.homesCount} hogares (Bogotá)</strong></li>
          <li><span>💵 Pago por entrega</span><strong>${formatCOP(route.payPerDelivery)} c/u</strong></li>
          <li><span>🛻 Vehículo</span><strong>${state.driver.vehicle} (${state.driver.plate})</strong></li>
        </ul>

        <div class="btn-row">
          <button class="btn btn-danger-outline" onclick="rejectRoute()">✕ Rechazar</button>
          <button class="btn btn-primary" onclick="acceptRoute()">✓ Aceptar ruta</button>
        </div>
      </div>
    `;
    return;
  }

  // Caso 3: Ruta aceptada -> Lista ordenada de paradas
  const deliveredCount = route.deliveries.filter((d) => d.status === "Entregado").length;

  const deliveriesHtml = route.deliveries.map((stop) => {
    const isDelivered = stop.status === "Entregado";
    const canDeliver = route.pickedUp && !isDelivered;

    return `
      <article class="card stop-card ${isDelivered ? "stop-done" : ""}">
        <div class="stop-header">
          <div>
            <div class="stop-number">Parada ${stop.stopNumber + 1} · Entrega hogar #${stop.orderId}</div>
            <strong>${stop.family}</strong>
          </div>
          <span class="status-pill ${getStatusClass(stop.status)}">${stop.status}</span>
        </div>

        <p class="address-text">📍 ${stop.address}</p>

        <div class="price-row">
          <span style="font-size:0.82rem; color:var(--muted);">Remuneración entrega:</span>
          <strong style="color:var(--green-main);">${formatCOP(stop.pay)}</strong>
        </div>

        ${
          isDelivered
            ? `<div style="margin-top:10px; font-size:0.84rem; font-weight:700; color:var(--green-main);">
                 ✓ Entregado · Comprobante ${stop.receiptCode} guardado
               </div>`
            : `<button class="btn btn-primary" ${canDeliver ? "" : "disabled"} onclick="openDeliveryModal('${stop.orderId}')">
                 ${canDeliver ? "📦 Entregar con foto y comprobante" : "🔒 Primero confirma la recogida en finca"}
               </button>`
        }
      </article>
    `;
  }).join("");

  container.innerHTML = `
    <div class="section-title">
      <span>Paradas de la ruta</span>
      <span style="font-size:0.82rem; color:var(--green-main);">${deliveredCount}/${route.homesCount} entregadas</span>
    </div>

    ${
      route.pickedUp
        ? `<div class="responsibility-banner">
             🛡️ Carga recogida: la responsabilidad del mercado está ahora en manos del transportista (${state.driver.name}).
           </div>`
        : ""
    }

    <!-- PARADA 1: FINCA DE RECOGIDA -->
    <article class="card stop-card stop-farm ${route.pickedUp ? "stop-done" : ""}">
      <div class="stop-header">
        <div>
          <div class="stop-number">Parada 1 · Recogida en finca</div>
          <strong>${route.farmStop.farm}</strong>
        </div>
        <span class="status-pill ${route.pickedUp ? "st-recogido" : "st-enviado"}">
          ${route.pickedUp ? "Recogido" : "Por recoger"}
        </span>
      </div>
      <p class="address-text">🌾 ${route.farmStop.address}</p>
      <p style="font-size:0.84rem; color:var(--earth-dark);">📦 ${route.farmStop.packages}</p>

      ${
        !route.pickedUp
          ? `<button class="btn btn-earth" onclick="openPickupModal()">
               📸 Confirmar recogida con foto
             </button>`
          : `<div style="margin-top:10px; font-size:0.84rem; font-weight:700; color:var(--earth-dark);">
               ✓ Recogida verificada con foto en finca
             </div>`
      }
    </article>

    ${deliveriesHtml}
  `;
}

function acceptRoute() {
  state.route.status = "accepted";
  showToast("Ruta aceptada. Dirígete a la finca de Hernando Rojas.");
  renderDriverRoute();
}

function rejectRoute() {
  state.route.status = "rejected";
  showToast("Has rechazado la ruta asignada.");
  renderDriverRoute();
}

function restoreRouteDemo() {
  state.route.status = "assigned";
  renderDriverRoute();
}

function openPickupModal() {
  openModal(`
    <h3 style="color:var(--earth-dark);">Confirmar recogida en finca</h3>
    <p style="font-size:0.88rem; color:var(--muted); margin-top:6px;">
      Al confirmar con foto, recibes las canastillas de Hernando Rojas y la responsabilidad del pedido pasa a ti.
    </p>
    <div class="photo-preview">
      <div style="font-size:3rem;">🛻🧺✅</div>
      <strong style="display:block; margin-top:8px; color:var(--earth-dark);">Foto simulada de carga en pickup</strong>
      <span style="font-size:0.8rem; color:var(--muted);">Placa ${state.driver.plate} · Finca El Mirador, Sibaté</span>
    </div>
    <button class="btn btn-earth" onclick="confirmPickup()">
      ✓ Confirmar recogida y salir en camino
    </button>
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
  `);
}

function confirmPickup() {
  state.route.pickedUp = true;

  // Actualiza estados de forma coherente a "Recogido" -> "En camino"
  state.route.deliveries.forEach((d) => {
    if (d.status !== "Entregado") {
      d.status = "En camino";
    }
  });

  state.orders.forEach((o) => {
    if (o.status !== "Entregado") {
      o.status = "En camino";
    }
  });

  closeModal();
  showToast("Recogida confirmada. Pedidos ahora En camino.");
  renderDriverRoute();
}

function openDeliveryModal(orderId) {
  const stop = state.route.deliveries.find((d) => d.orderId === orderId);
  if (!stop) return;

  openModal(`
    <h3 style="color:var(--green-dark);">Entregar a ${stop.family}</h3>
    <p style="font-size:0.86rem; color:var(--muted); margin-top:4px;">${stop.address}</p>

    <div class="photo-preview">
      <div style="font-size:2.8rem;">🚪🧺📸</div>
      <strong style="display:block; margin-top:6px; color:var(--green-dark);">Foto de entrega en puerta (simulada)</strong>

      <div class="receipt-box">
        <strong>🧾 Comprobante digital ${stop.receiptCode}</strong><br>
        Pedido: #${stop.orderId}<br>
        Recibe: ${stop.family}<br>
        Abono inmediato a tu saldo: <strong style="color:var(--green-main);">${formatCOP(stop.pay)}</strong>
      </div>
    </div>

    <button class="btn btn-primary" onclick="confirmDelivery('${stop.orderId}')">
      ✓ Confirmar entrega y sumar ${formatCOP(stop.pay)}
    </button>
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
  `);
}

function confirmDelivery(orderId) {
  const stop = state.route.deliveries.find((d) => d.orderId === orderId);
  if (!stop || stop.status === "Entregado") return;

  stop.status = "Entregado";

  // Sincronizar con pedidos del campesino si corresponde
  const farmerOrder = state.orders.find((o) => o.id === orderId);
  if (farmerOrder) {
    farmerOrder.status = "Entregado";
  }

  // Sumar al saldo del transportista al instante
  state.driver.balance += stop.pay;
  state.driver.history.unshift({
    id: `DT-${Date.now()}`,
    title: `Entrega #${stop.orderId} (${stop.family})`,
    date: "Ahora mismo",
    amount: stop.pay,
    type: "in"
  });

  closeModal();
  showToast(`¡Entregado! +${formatCOP(stop.pay)} sumados a tu saldo.`);
  renderDriverRoute();
}

function syncOrderStatusToDriver(orderId, newStatus) {
  const stop = state.route.deliveries.find((d) => d.orderId === orderId);
  if (stop && stop.status !== "Entregado" && !state.route.pickedUp) {
    stop.status = newStatus;
  }
}

// ==========================================
// MI SALDO (CAMPESINO Y TRANSPORTISTA)
// ==========================================

function renderWallet(role) {
  const container = document.getElementById("main-content");
  const user = role === "farmer" ? state.farmer : state.driver;
  const cardStyle = role === "farmer" ? "card-highlight" : "card-earth";

  const historyHtml = user.history
    .map(
      (tx) => `
      <div class="tx-item">
        <div>
          <div class="tx-title">${tx.title}</div>
          <div class="tx-date">${tx.date}</div>
        </div>
        <div class="${tx.amount >= 0 ? "tx-plus" : "tx-minus"}">
          ${tx.amount >= 0 ? "+" : ""}${formatCOP(tx.amount)}
        </div>
      </div>
    `
    )
    .join("");

  container.innerHTML = `
    <div class="section-title"><span>Mi saldo</span></div>

    <div class="card ${cardStyle}">
      <span style="font-size:0.86rem; opacity:0.9;">Saldo disponible</span>
      <div class="balance-amount">${formatCOP(user.balance)}</div>
      <p style="font-size:0.8rem; opacity:0.85;">Cuenta registrada: ${user.bankAccount}</p>

      <button class="btn" style="background:#ffffff; color:var(--green-dark); margin-top:16px;"
        ${user.balance <= 0 ? "disabled" : ""}
        onclick="openWithdrawModal('${role}')">
        🏦 Retirar a mi cuenta bancaria
      </button>
    </div>

    <div class="card">
      <h3 style="font-size:1rem; color:var(--earth-dark); margin-bottom:6px;">Historial de pagos</h3>
      ${historyHtml}
    </div>
  `;
}

function openWithdrawModal(role) {
  const user = role === "farmer" ? state.farmer : state.driver;
  openModal(`
    <h3 style="color:var(--earth-dark);">Retirar saldo</h3>
    <p style="font-size:0.9rem; color:var(--muted); margin-top:6px;">
      Transferiremos tu saldo disponible a tu cuenta bancaria registrada.
    </p>
    <div class="receipt-box" style="margin:14px 0;">
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <span>Titular:</span><strong>${user.name}</strong>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <span>Destino:</span><strong>${user.bankAccount}</strong>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:1.05rem;">
        <span>Monto a retirar:</span><strong style="color:var(--green-main);">${formatCOP(user.balance)}</strong>
      </div>
    </div>
    <button class="btn btn-primary" onclick="confirmWithdraw('${role}')">
      ✓ Confirmar retiro ahora
    </button>
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
  `);
}

function confirmWithdraw(role) {
  const user = role === "farmer" ? state.farmer : state.driver;
  const amount = user.balance;
  if (amount <= 0) return;

  user.balance = 0;
  user.history.unshift({
    id: `WD-${Date.now()}`,
    title: `Retiro a ${user.bankAccount}`,
    date: "Ahora mismo",
    amount: -amount,
    type: "out"
  });

  closeModal();
  showToast(`Retiro por ${formatCOP(amount)} enviado a tu cuenta bancaria.`);
  renderWallet(role);
}

// ==========================================
// CONTROL DE MODALES
// ==========================================

function openModal(html) {
  document.getElementById("modal-body").innerHTML = html;
  document.getElementById("modal-overlay").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
}

function closeModalOnBackdrop(event) {
  if (event.target.id === "modal-overlay") {
    closeModal();
  }
}
